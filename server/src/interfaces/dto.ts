import { z } from 'zod';

// Event DTOs
export const CreateEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  date: z.string().datetime(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export type CreateEventDTO = z.infer<typeof CreateEventSchema>;
export type UpdateEventDTO = z.infer<typeof UpdateEventSchema>;

// Song DTOs
export const CreateSongSchema = z.object({
  title: z.string().min(1).max(100),
  artist: z.string().min(1).max(100),
  key: z.string().max(10),
  tempo: z.number().min(20).max(300).optional(),
  youtubeUrl: z.string().url().optional(),
});

export const UpdateSongSchema = CreateSongSchema.partial();

export type CreateSongDTO = z.infer<typeof CreateSongSchema>;
export type UpdateSongDTO = z.infer<typeof UpdateSongSchema>;

// User DTOs
export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;