// backend/routes/productRoute.js

import express from 'express';
import multer from 'multer';
import {
    getProducts,
    createProduct,
    deleteProduct,
} from '../controllers/productController.js';

const itemrouter = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, 'uploads/'),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// GET all products
itemrouter.get('/', getProducts);

// POST create a new product (with optional image upload)
itemrouter.post('/', upload.single('image'), createProduct);

// DELETE a product by ID
itemrouter.delete('/:id', deleteProduct);

export default itemrouter;
