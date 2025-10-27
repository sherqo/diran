import { Router } from 'express';
import { getHealth } from './controller';
import { healthCheckRateLimiter as rl } from '#lib/middleware/rateLimiter';
import to from 'connect-timeout';

const router: Router = Router();

router.get('/', rl, to('3s'), getHealth);

export default router;
