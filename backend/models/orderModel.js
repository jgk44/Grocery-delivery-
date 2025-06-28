import mongoose from 'mongoose';

// Item sub-schema matching frontend payload
const orderItemSchema = new mongoose.Schema({
    id: { type: String, required: true },          // frontend item identifier
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String }
});

// Main Order schema aligned with frontend CheckoutPage payload
const orderSchema = new mongoose.Schema({
    // Unique external order identifier
    orderId: { type: String, unique: true, required: true },

    // Optional user reference if logged in
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Customer details
    customer: {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
        },
        phone: { type: String, required: true, minlength: 10 },
        address: { type: String, required: true },
        notes: { type: String }
    },

    // Chosen payment method (must match frontend values)
    paymentMethod: { type: String, enum: ['Cash on Delivery', 'Online Payment'], required: true },

    items: { type: [orderItemSchema], default: [] },

    // Pricing breakdown
    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },

    // Payment tracking
    sessionId: { type: String },
    paymentIntentId: { type: String },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },

    // Order lifecycle
    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    date: { type: Date, default: Date.now, index: true },
    deliveryDate: { type: Date, index: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compute pricing breakdown before save to prevent trusting client
orderSchema.pre('save', function (next) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.tax = parseFloat((this.subtotal * 0.05).toFixed(2));
    this.total = this.subtotal + this.tax + this.shipping;
    next();
});

// Virtual for computed total if needed elsewhere
orderSchema.virtual('calculatedTotal').get(function () {
    return this.subtotal + this.tax + this.shipping;
});

export default mongoose.model('Order', orderSchema);
