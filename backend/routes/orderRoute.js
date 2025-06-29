import express from 'express';
import {
    createOrder,
    confirmPayment,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';

const orderrouter = express.Router();

// 🎯 Protected endpoints
orderrouter.post('/', authMiddleware, createOrder);
orderrouter.get('/confirm', authMiddleware, confirmPayment);

// 🌐 Public endpoints
orderrouter.get('/', getOrders);
orderrouter.get('/:id', getOrderById);
orderrouter.put('/:id', updateOrder);
orderrouter.delete('/:id', deleteOrder);

export default orderrouter
