import { Router } from 'express';
import { SpecialistController } from '../controllers/specialist.controller';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { uploadMultiple } from '../middleware/upload';
import { uploadMultipleCloudinary } from '../middleware/upload-cloudinary';

const router = Router();
const specialistController = new SpecialistController();

// Choose upload middleware based on environment
// Use Cloudinary in production, local storage in development
const uploadMiddleware = process.env.NODE_ENV === 'production' && 
  process.env.CLOUDINARY_CLOUD_NAME 
  ? uploadMultipleCloudinary 
  : uploadMultiple;

// Validation rules - Note: For FormData, validation happens in controller after parsing JSON
const createSpecialistValidation = [
  body('title').optional().notEmpty().withMessage('Title is required'),
  body('base_price').optional().isNumeric().withMessage('Base price must be a number'),
  body('duration_days').optional().isInt().withMessage('Duration days must be an integer'),
  // For FormData, data field contains JSON string
  body('data').optional().custom((value) => {
    if (value) {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (!parsed.title) throw new Error('Title is required');
        if (!parsed.base_price || isNaN(parseFloat(parsed.base_price))) {
          throw new Error('Base price must be a number');
        }
        if (!parsed.duration_days || !Number.isInteger(parseInt(parsed.duration_days))) {
          throw new Error('Duration days must be an integer');
        }
      } catch (error) {
        throw error instanceof Error ? error : new Error('Invalid data format');
      }
    }
    return true;
  }),
];

const updateSpecialistValidation = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('is_draft').optional().isBoolean().withMessage('is_draft must be a boolean'),
];

// Routes
router.get('/', specialistController.getAllSpecialists);
router.get('/:id', specialistController.getSpecialistById);
// Upload middleware first (uses Cloudinary in production, local in development)
router.post('/', uploadMiddleware, specialistController.createSpecialist);
router.put('/:id', validate(updateSpecialistValidation), specialistController.updateSpecialist);
router.delete('/:id', specialistController.deleteSpecialist);
router.patch('/:id/publish', specialistController.togglePublishStatus);

export default router;

