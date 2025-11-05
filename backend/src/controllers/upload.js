import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload a single image to Cloudinary.
 * Expects multipart/form-data with field name "file".
 * Returns { url, publicId, width, height, format }.
 */
export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided. Send a file in the "file" field.' });
    }

    // Validate file is an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are supported.' });
    }

    // Size guard — 10 MB
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image must be smaller than 10 MB.' });
    }

    // Stream buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder:         'tripify/memories',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          resource_type:  'image',
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );

      Readable.from(req.file.buffer).pipe(uploadStream);
    });

    res.json({
      url:      result.secure_url,
      publicId: result.public_id,
      width:    result.width,
      height:   result.height,
      format:   result.format,
    });
  } catch (e) {
    console.error('Cloudinary upload error:', e);
    res.status(500).json({ error: 'Image upload failed. ' + (e.message || '') });
  }
}
