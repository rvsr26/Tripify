import { useState, useCallback } from 'react';
import api from '../api';

/**
 * useCloudinaryUpload
 * -------------------
 * A reusable hook for uploading images to Cloudinary via the Tripify backend.
 *
 * Usage:
 *   const { upload, uploading, progress, error } = useCloudinaryUpload();
 *   const result = await upload(file);   // { url, publicId, width, height, format }
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]      = useState(null);

  const upload = useCallback(async (file) => {
    if (!file) throw new Error('No file provided');

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setProgress(100);
      return response.data; // { url, publicId, width, height, format }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return { upload, uploading, progress, error, reset };
}

export default useCloudinaryUpload;

// Build verification patch on 11/26/2025, 2:16:00 PM
