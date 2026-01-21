import { z } from 'zod';

// Event DTOs
export const CreateEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  date: z.string().datetime(),
  createdBy: z.string().uuid(),
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
  createdBy: z.string().uuid(),
});

export const UpdateSongSchema = CreateSongSchema.partial();

export type CreateSongDTO = z.infer<typeof CreateSongSchema>;
export type UpdateSongDTO = z.infer<typeof UpdateSongSchema>;

const UserRoleSchema = z.enum(['admin', 'user']).optional();

// User DTOs
export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: UserRoleSchema,
});

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

// Blockout DTOs
export const CreateBlockoutSchema = z.object({
  userId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().max(500).optional(),
});

export const UpdateBlockoutSchema = CreateBlockoutSchema.partial();

export type CreateBlockoutDTO = z.infer<typeof CreateBlockoutSchema>;
export type UpdateBlockoutDTO = z.infer<typeof UpdateBlockoutSchema>;

// Org/Team DTOs
const MemberFunctionSchema = z.enum([
  'vocalist',
  'bass',
  'piano',
  'guitar',
  'other',
]);

export const CreateOrgSchema = z.object({
  name: z.string().min(1).max(120),
  orgCode: z.string().min(1).max(120).optional(),
});

export const UpdateOrgSchema = CreateOrgSchema.partial();

export const CreateTeamSchema = z.object({
  name: z.string().min(1).max(120),
});

export const UpdateTeamSchema = CreateTeamSchema.partial();

export const AddOrgMemberSchema = z.object({
  teamId: z.string().uuid(),
});

export const UpdateOrgMemberSchema = z.object({
  teamId: z.string().uuid(),
});

export const AddTeamMemberSchema = z
  .object({
    userId: z.string().uuid(),
    role: UserRoleSchema,
    memberFunction: MemberFunctionSchema.optional(),
  })
  // .refine(
  //   (data) =>
  //     data.role === 'admin' ? data.memberFunction === undefined : true,
  //   {
  //     message: 'memberFunction is only allowed for member role',
  //     path: ['memberFunction'],
  //   }
  // )
  // .refine(
  //   (data) =>
  //     data.role === 'member' ? data.memberFunction !== undefined : true,
  //   {
  //     message: 'memberFunction is required for member role',
  //     path: ['memberFunction'],
  //   }
  // );

export const UpdateTeamMemberSchema = z
  .object({
    // role: OrgRoleSchema.optional(),
    // memberFunction: MemberFunctionSchema.optional(),
  })
  // .refine(
  //   (data) =>
  //     data.role === 'admin' ? data.memberFunction === undefined : true,
  //   {
  //     message: 'memberFunction is only allowed for member role',
  //     path: ['memberFunction'],
  //   }
  // )
  // .refine(
  //   (data) =>
  //     data.role === 'member' ? data.memberFunction !== undefined : true,
  //   {
  //     message: 'memberFunction is required for member role',
  //     path: ['memberFunction'],
  //   }
  // );

export type CreateOrgDTO = z.infer<typeof CreateOrgSchema>;
export type UpdateOrgDTO = z.infer<typeof UpdateOrgSchema>;
export type CreateTeamDTO = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamDTO = z.infer<typeof UpdateTeamSchema>;
export type AddOrgMemberDTO = z.infer<typeof AddOrgMemberSchema>;
export type UpdateOrgMemberDTO = z.infer<typeof UpdateOrgMemberSchema>;
export type AddTeamMemberDTO = z.infer<typeof AddTeamMemberSchema>;
export type UpdateTeamMemberDTO = z.infer<typeof UpdateTeamMemberSchema>;
