import { Router } from 'express';
import { getHealth } from './controller';
import { healthCheckRateLimiter } from '#lib/middleware/rateLimiter';

const router: Router = Router();

router.get('/', healthCheckRateLimiter, getHealth);

export default router;
