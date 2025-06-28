import Order from '../models/orderModel.js';
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
import { v4 as uuidv4 } from 'uuid';    // for generating a unique orderId

// Create a new order (Stripe Checkout for online, else COD)
export const createOrder = async (req, res) => {
    try {
        const {
            customer,
            items,          // frontend should POST [{ id, name, price, quantity, imageUrl }, …]
            paymentMethod,  // 'COD' or 'Online'
            notes,
            deliveryDate
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty items array' });
        }

        // Normalize paymentMethod to match schema enum
        const normalizedPaymentMethod =
            paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment';

        // Build the items exactly as the schema expects (flat, no "item" wrapper)
        const orderItems = items.map(i => ({
            id: i.id,
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.quantity),
            imageUrl: i.imageUrl
        }));

        // Generate and persist your external ID
        const orderId = `ORD-${uuidv4()}`;

        let newOrder;
        if (normalizedPaymentMethod === 'Online Payment') {
            // Stripe line items require price_data
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: orderItems.map(o => ({
                    price_data: {
                        currency: 'inr',
                        product_data: { name: o.name },
                        unit_amount: Math.round(o.price * 100)
                    },
                    quantity: o.quantity
                })),
                customer_email: customer.email,
                success_url: `${process.env.FRONTEND_URL}/myorder/verify?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
                metadata: { orderId, ...customer }
            });

            newOrder = new Order({
                orderId,
                customer,
                items: orderItems,
                shipping: 0,
                paymentMethod: normalizedPaymentMethod,
                paymentStatus: 'Unpaid',         // Stripe isn’t paid until webhook/confirm
                sessionId: session.id,
                paymentIntentId: session.payment_intent,
                notes,
                deliveryDate
            });

            await newOrder.save();
            return res.status(201).json({ order: newOrder, checkoutUrl: session.url });
        }

        // Cash on Delivery
        newOrder = new Order({
            orderId,
            customer,
            items: orderItems,
            shipping: 0,
            paymentMethod: normalizedPaymentMethod,
            paymentStatus: 'Paid',           // COD we mark as Paid immediately
            notes,
            deliveryDate
        });

        await newOrder.save();
        res.status(201).json({ order: newOrder, checkoutUrl: null });
    } catch (err) {
        console.error('createOrder error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Confirm Stripe payment and update order
export const confirmPayment = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ message: 'session_id required' });

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        const order = await Order.findOneAndUpdate(
            { sessionId: session_id },
            { paymentStatus: 'Paid' },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        return res.json(order);
    } catch (err) {
        console.error('confirmPayment error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get orders for logged-in user
export const getOrders = async (req, res) => {
    try {
        const filter = { 'customer.email': req.user.email };
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('getOrders error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Admin: Get all orders
export const getAllOrders = async (_req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('getAllOrders error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get order by ID (check ownership if non-admin)
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (!req.user.isAdmin && order.customer.email !== req.user.email) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        console.error('getOrderById error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Customer can update own order (notes, before processing)
export const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.customer.email !== req.user.email) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        console.error('updateOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Admin: Update any order
export const updateAnyOrder = async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updated) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('updateAnyOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete an order (admin)
export const deleteOrder = async (req, res) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('deleteOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};