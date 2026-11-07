import { z } from 'zod';

/**
 * Zod enum for allowed delivery statuses.
 */
export const deliveryStatusEnum = z.enum(
  ['pending', 'in_transit', 'delayed', 'delivered', 'cancelled'],
  {
    message: "Status must be one of: 'pending', 'in_transit', 'delayed', 'delivered', 'cancelled'",
  }
);

/**
 * Zod enum for allowed priority levels.
 */
export const priorityLevelEnum = z.enum(
  ['low', 'normal', 'high', 'urgent'],
  {
    message: "Priority must be one of: 'low', 'normal', 'high', 'urgent'",
  }
);

/**
 * Schema for validating POST /api/deliveries request body.
 */
export const createDeliverySchema = z.object({
  trackingCode: z
    .string({ message: 'Tracking code is required' })
    .trim()
    .min(1, 'Tracking code cannot be empty'),

  customerName: z
    .string({ message: 'Customer name is required' })
    .trim()
    .min(1, 'Customer name cannot be empty'),

  customerPhone: z
    .string({ message: 'Customer phone is required' })
    .trim()
    .min(1, 'Customer phone cannot be empty'),

  destinationAddress: z
    .string({ message: 'Destination address is required' })
    .trim()
    .min(1, 'Destination address cannot be empty'),

  destinationCity: z
    .string({ message: 'Destination city is required' })
    .trim()
    .min(1, 'Destination city cannot be empty'),

  driverId: z.string().nullable().optional(),
  driverName: z.string().nullable().optional(),

  status: deliveryStatusEnum.optional(),
  priority: priorityLevelEnum.optional(),

  eta: z
    .string({ message: 'Estimated time of arrival (ETA) is required' })
    .trim()
    .min(1, 'ETA must be a valid date/time string'),

  packagesCount: z
    .number({ message: 'Packages count is required' })
    .int('Packages count must be an integer')
    .min(1, 'Packages count must be at least 1'),

  weightKg: z
    .number({ message: 'Weight (kg) is required' })
    .min(0, 'Weight (kg) cannot be negative'),

  notes: z.string().trim().optional(),
});

/**
 * Schema for validating PATCH /api/deliveries/:id request body.
 * All fields are optional, but at least one valid field must be provided in the payload.
 */
export const updateDeliverySchema = createDeliverySchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Update payload cannot be empty. Please provide at least one field to update.',
    }
  );

/**
 * Schema for validating route parameters like /api/deliveries/:id
 */
export const deliveryParamsSchema = z.object({
  id: z
    .string({ message: 'Delivery ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid delivery ID format. Must be a 24-character hexadecimal ObjectId.'),
});

// Inferred TypeScript DTO types from Zod schemas
export type CreateDeliveryDTO = z.infer<typeof createDeliverySchema>;
export type UpdateDeliveryDTO = z.infer<typeof updateDeliverySchema>;
export type DeliveryParamsDTO = z.infer<typeof deliveryParamsSchema>;
