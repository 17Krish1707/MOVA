import { Router } from 'express';
import {
  getDeliveries,
  createDelivery,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
} from '../controllers/delivery.controller';

const router = Router();

router.get('/', getDeliveries);
router.post('/', createDelivery);

router.get('/:id', getDeliveryById);
router.patch('/:id', updateDelivery);
router.delete('/:id', deleteDelivery);

export default router;
