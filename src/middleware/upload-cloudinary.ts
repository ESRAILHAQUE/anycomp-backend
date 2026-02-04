import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'anycomp/specialists', // Folder in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto',
        },
      ],
      public_id: `specialist-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      resource_type: 'image',
      format: 'auto', // Auto format optimization
      fetch_format: 'auto',
    };
  },
});

// File filter - only allow images
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Configure multer with Cloudinary storage
export const uploadCloudinary = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware for multiple images
export const uploadMultipleCloudinary = uploadCloudinary.array('images', 10); // Max 10 images

