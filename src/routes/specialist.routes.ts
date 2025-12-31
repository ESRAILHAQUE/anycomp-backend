import { Router } from 'express';
import { SpecialistController } from '../controllers/specialist.controller';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();
const specialistController = new SpecialistController();

// Validation rules
const createSpecialistValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];

const updateSpecialistValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
];

// Routes
router.get('/', specialistController.getAllSpecialists);
router.get('/:id', specialistController.getSpecialistById);
router.post('/', validate(createSpecialistValidation), specialistController.createSpecialist);
router.put('/:id', validate(updateSpecialistValidation), specialistController.updateSpecialist);
router.delete('/:id', specialistController.deleteSpecialist);
router.patch('/:id/publish', specialistController.togglePublishStatus);

export default router;

