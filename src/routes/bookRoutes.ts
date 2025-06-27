import express from 'express';
import multer from 'multer';
import {
  getBooks,
  addBook,
  processBookImage,
  searchBooks,
  deleteBook,
} from '../controllers/bookController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = express.Router();

router.get('/', getBooks);
router.post('/', addBook);
router.post('/process-image', upload.single('image'), processBookImage);
router.get('/search', searchBooks);
router.delete('/:id', deleteBook)

export default router;