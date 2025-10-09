import express from 'express';
import { authRoutes } from '../../modules/auth';
import { userRoutes } from '../../modules/user';
import healthRoutes from './health.js';

// Create API router with all v1 routes
const apiRouter = express.Router();

// Mount all routes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/user', userRoutes);

export default apiRouter;
