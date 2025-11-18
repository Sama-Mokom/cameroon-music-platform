import { z } from 'zod';

// Helper to transform empty strings to undefined
const optionalString = (schema: z.ZodString) =>
  z.preprocess((val) => (val === '' ? undefined : val), schema.optional());

export const UpdateArtistProfileSchema = z.object({
  stageName: optionalString(
    z
      .string()
      .min(2, 'Stage name must be at least 2 characters')
      .max(100, 'Stage name must not exceed 100 characters'),
  ),
  bio: optionalString(
    z.string().max(1000, 'Bio must not exceed 1000 characters'),
  ),
  genres: z
    .array(z.string())
    .max(10, 'Maximum 10 genres allowed')
    .optional(),
  tags: z
    .array(z.string())
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  phoneNumber: optionalString(
    z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  ),
});

export type UpdateArtistProfileDto = z.infer<typeof UpdateArtistProfileSchema>;
