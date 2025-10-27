import { healthRoutes, authRoutes, userRoutes, blockRoutes } from '#features';
import express, { Router } from 'express';

/**
 * in each route file or - simply - request, here's the order:
 *  1. rate limiters - if any - we've a global rate limiter anyways ^_^
 *  2. timeout middleware - MUST - we don't have a global timeout middleware!!
 *  3. Zod schema validation middlewares - if any
 *  4. authentication middleware - if any - for protected routes
 *  5. permission middlewares - if any - for resources access
 *  .
 *  .
 *  finally. controller
 */

// harsh issue:
// what if the timeout stopped the request while sending a response
// or after doing half of some operation??? - TO BE INVESTIGATED :)

// Create API router with all v1 routes
const apiRouter: Router = express.Router();

// Mount all routes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/user', userRoutes);
apiRouter.use('/block', blockRoutes);

export default apiRouter;
