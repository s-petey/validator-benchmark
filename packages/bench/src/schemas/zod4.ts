import * as z from 'zod/v4';
// import type { DetailsUser, User } from '../generate-users.js';

export const baseSchema = z.object({
  name: z.object({
    first: z.string(),
    last: z.string(),
  }),
  login: z.object({
    email: z.string(),
    password: z.string(),
  }),
  organization_id: z.string(),
  requested_at: z.string(),
}); // satisfies z.ZodType<User>;

export const detailsSchema = z.object({
  name: z.object({
    first: z.string().min(1).max(999),
    last: z.string().min(1).max(999),
  }),
  login: z.object({
    email: z.email(),
    password: z.string().min(12).max(50),
  }),
  organization_id: z.uuid(),
  requested_at: z.coerce.date(),
}); // satisfies z.ZodType<DetailsUser>;
