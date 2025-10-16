import { Router } from 'express';
import { getHealth } from './controller';
import { healthCheckRateLimiter as rl } from '#lib/middleware/rateLimiter';
import timeout from 'connect-timeout';

const router: Router = Router();

router.use(timeout('3s')); // Set a timeout of 3 seconds for all routes in this router

router.get('/', rl, getHealth);

export default router;
