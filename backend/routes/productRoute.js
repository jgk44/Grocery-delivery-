import express from 'express';
import multer from 'multer';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';

const itemrouter = express.Router();
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, 'uploads/'),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

itemrouter.post('/', upload.single('image'), createProduct);
itemrouter.route('/')
    .get(getProducts)
    .post(createProduct);

itemrouter.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

export default itemrouter;
