/*
File: routes/orderRoutes.js
Description: Express router for order endpoints
*/
import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder
} from '../controllers/orderController.js';

const Orderrouter = express.Router();

Orderrouter.post('/', createOrder);
Orderrouter.get('/', getOrders);
Orderrouter.get('/:id', getOrderById);
Orderrouter.put('/:id', updateOrder);
Orderrouter.delete('/:id', deleteOrder);

export default Orderrouter;