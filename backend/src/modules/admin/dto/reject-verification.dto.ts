import { z } from 'zod';

export const RejectVerificationSchema = z.object({
  verificationId: z.string().uuid('Invalid verification ID'),
  rejectionReason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must not exceed 500 characters'),
});

export type RejectVerificationDto = z.infer<typeof RejectVerificationSchema>;
