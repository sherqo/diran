import { healthRoutes, authRoutes, userRoutes } from '#features';
import express, { Router } from 'express';

// Create API router with all v1 routes
const apiRouter: Router = express.Router();

// Mount all routes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/user', userRoutes);

export default apiRouter;
