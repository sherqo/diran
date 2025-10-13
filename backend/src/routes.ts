import { healthRoutes, authRoutes, userRoutes } from '#features';
import express from 'express';

// Create API router with all v1 routes
const apiRouter = express.Router();

// Mount all routes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/user', userRoutes);

export default apiRouter;
