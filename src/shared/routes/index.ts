import express from 'express';
import { authRoutes } from '../../modules/auth/index.js';
import { userRoutes } from '../../modules/user/index.js';
import healthRoutes from './health.js';

// Create API router with all v1 routes
const apiRouter = express.Router();

// Mount all routes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/user', userRoutes);

export default apiRouter;
