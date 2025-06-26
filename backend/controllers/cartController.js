// backend/controllers/cartController.js

import { CartItem } from '../models/cartItem.js';

// GET /api/cart
export const getCart = async (req, res, next) => {
    try {
        const items = await CartItem.find({ user: req.user._id }).populate('item');
        const formatted = items.map(ci => ({
            _id: ci._id.toString(),
            item: ci.item,
            quantity: ci.quantity,
        }));
        res.json(formatted);
    } catch (err) {
        next(err);
    }
};

// POST /api/cart
export const addToCart = async (req, res, next) => {
    try {
        const { itemId, quantity } = req.body;
        if (!itemId || typeof quantity !== 'number') {
            res.status(400);
            throw new Error('itemId and quantity (number) are required');
        }

        let cartItem = await CartItem.findOne({ user: req.user._id, item: itemId });

        if (cartItem) {
            cartItem.quantity = Math.max(1, cartItem.quantity + quantity);
            if (cartItem.quantity < 1) {
                await cartItem.remove();
                return res.json({ _id: cartItem._id.toString(), item: cartItem.item, quantity: 0 });
            }
            await cartItem.save();
            await cartItem.populate('item');
            return res.status(200).json({
                _id: cartItem._id.toString(),
                item: cartItem.item,
                quantity: cartItem.quantity,
            });
        }

        cartItem = await CartItem.create({
            user: req.user._id,
            item: itemId,
            quantity,
        });
        await cartItem.populate('item');
        res.status(201).json({
            _id: cartItem._id.toString(),
            item: cartItem.item,
            quantity: cartItem.quantity,
        });
    } catch (err) {
        next(err);
    }
};

// PUT /api/cart/:id
export const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const cartItem = await CartItem.findOne({ _id: req.params.id, user: req.user._id });
        if (!cartItem) {
            res.status(404);
            throw new Error('Cart item not found');
        }
        cartItem.quantity = Math.max(1, quantity);
        await cartItem.save();
        await cartItem.populate('item');
        res.json({
            _id: cartItem._id.toString(),
            item: cartItem.item,
            quantity: cartItem.quantity,
        });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/cart/:id
export const deleteCartItem = async (req, res, next) => {
    try {
        const cartItem = await CartItem.findOne({ _id: req.params.id, user: req.user._id });
        if (!cartItem) {
            res.status(404);
            throw new Error('Cart item not found');
        }
        await cartItem.deleteOne();
        res.json({ _id: req.params.id });
    } catch (err) {
        next(err);
    }
};

// POST /api/cart/clear
export const clearCart = async (req, res, next) => {
    try {
        await CartItem.deleteMany({ user: req.user._id });
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        next(err);
    }
};
