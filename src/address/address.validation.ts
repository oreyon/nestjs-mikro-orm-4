import { z, ZodType } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    contactId: z.number().positive().min(1),
    street: z.string().min(1).max(255).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(10).optional(),
  });

  static readonly GET: ZodType = z.object({
    contactId: z.number().positive().min(1),
    addressId: z.number().positive().min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive().min(1),
    contactId: z.number().positive().min(1),
    street: z.string().min(1).max(255).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(10).optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    contactId: z.number().positive().min(1),
    addressId: z.number().positive().min(1),
  });
}
