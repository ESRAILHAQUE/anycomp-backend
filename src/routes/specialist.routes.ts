import { Router } from 'express';
import { SpecialistController } from '../controllers/specialist.controller';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();
const specialistController = new SpecialistController();

// Validation rules
const createSpecialistValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('base_price').isNumeric().withMessage('Base price must be a number'),
  body('duration_days').isInt().withMessage('Duration days must be an integer'),
];

const updateSpecialistValidation = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('is_draft').optional().isBoolean().withMessage('is_draft must be a boolean'),
];

// Routes
router.get('/', specialistController.getAllSpecialists);
router.get('/:id', specialistController.getSpecialistById);
router.post('/', validate(createSpecialistValidation), specialistController.createSpecialist);
router.put('/:id', validate(updateSpecialistValidation), specialistController.updateSpecialist);
router.delete('/:id', specialistController.deleteSpecialist);
router.patch('/:id/publish', specialistController.togglePublishStatus);

export default router;

