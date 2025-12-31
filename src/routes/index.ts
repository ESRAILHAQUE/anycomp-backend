import { Router } from 'express';
import specialistRoutes from './specialist.routes';

const router = Router();

// API routes
router.use('/specialists', specialistRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;

