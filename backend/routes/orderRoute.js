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

const Orderrouter = express.Router();

// 🎯 Protected endpoints
Orderrouter.post('/', authMiddleware, createOrder);
Orderrouter.get('/confirm', authMiddleware, confirmPayment);

// 🌐 Public endpoints
Orderrouter.get('/', getOrders);
Orderrouter.get('/:id', getOrderById);
Orderrouter.put('/:id', updateOrder);
Orderrouter.delete('/:id', deleteOrder);

export default Orderrouter;
