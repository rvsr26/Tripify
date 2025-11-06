import express from 'express';
import multer  from 'multer';
import { authMiddleware } from '../middlewares/auth.js';
import { uploadImage }    from '../controllers/upload.js';

const router  = express.Router();

// Keep files in memory — no disk writes, stream straight to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// POST /api/upload  (requires auth, single "file" field)
router.post('/', authMiddleware, upload.single('file'), uploadImage);

export default router;
