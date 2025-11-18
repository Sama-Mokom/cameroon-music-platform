import { z } from 'zod';

export const ApproveVerificationSchema = z.object({
  verificationId: z.string().uuid('Invalid verification ID'),
});

export type ApproveVerificationDto = z.infer<typeof ApproveVerificationSchema>;
