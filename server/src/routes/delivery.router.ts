import { Router } from 'express';
import { getDeliveries, createDelivery } from '../controllers/delivery.controller';

const router = Router();

router.get('/', getDeliveries);
router.post('/', createDelivery);

export default router;
