import { Router } from 'express';
import {
  getDeliveries,
  createDelivery,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
} from '../controllers/delivery.controller';
import { validate } from '../middleware';
import {
  createDeliverySchema,
  updateDeliverySchema,
  deliveryParamsSchema,
} from '../schemas';

const router = Router();

router.get('/', getDeliveries);

router.post(
  '/',
  validate(createDeliverySchema),
  createDelivery
);

router.get(
  '/:id',
  validate({ params: deliveryParamsSchema }),
  getDeliveryById
);

router.patch(
  '/:id',
  validate({ params: deliveryParamsSchema, body: updateDeliverySchema }),
  updateDelivery
);

router.delete(
  '/:id',
  validate({ params: deliveryParamsSchema }),
  deleteDelivery
);

export default router;
