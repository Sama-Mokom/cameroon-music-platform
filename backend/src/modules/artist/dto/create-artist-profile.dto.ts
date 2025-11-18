import { z } from 'zod';

export const CreateArtistProfileSchema = z.object({
  stageName: z
    .string()
    .min(2, 'Stage name must be at least 2 characters')
    .max(100, 'Stage name must not exceed 100 characters')
    .optional(),
  bio: z
    .string()
    .max(1000, 'Bio must not exceed 1000 characters')
    .optional(),
  genres: z
    .array(z.string())
    .max(10, 'Maximum 10 genres allowed')
    .optional(),
  tags: z
    .array(z.string())
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
});

export type CreateArtistProfileDto = z.infer<typeof CreateArtistProfileSchema>;
