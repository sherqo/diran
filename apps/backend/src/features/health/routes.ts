import { Router } from 'express';
import { getHealth } from './controller';

const router: Router = Router();

router.get('/', getHealth);

export default router;
