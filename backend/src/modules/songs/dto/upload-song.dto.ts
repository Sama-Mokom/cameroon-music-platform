import { z } from 'zod';

export const UploadSongSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  genre: z.string().optional(),
});

export type UploadSongDto = z.infer<typeof UploadSongSchema>;
