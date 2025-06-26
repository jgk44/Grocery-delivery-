// backend/controllers/productController.js
import { Product } from '../models/productModel.js';

// GET /api/products
export const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        next(err);
    }
};

// GET /api/products/:id
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }
        res.json(product);
    } catch (err) {
        next(err);
    }
};

// POST /api/products
export const createProduct = async (req, res, next) => {
    try {
        // Multer adds file info to req.file
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const { name, description, category, oldPrice, price } = req.body;
        const product = await Product.create({ name, description, category, oldPrice, price, imageUrl });
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

// PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }
        if (req.file) {
            product.imageUrl = `/uploads/${req.file.filename}`;
        }
        Object.assign(product, req.body);
        const updated = await product.save();
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }
        await product.remove();
        res.json({ message: 'Product removed' });
    } catch (err) {
        next(err);
    }
};