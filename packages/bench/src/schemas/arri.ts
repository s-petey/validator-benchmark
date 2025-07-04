import { a } from "@arrirpc/schema";

/* Warning this is a very basic schema.
 * It may be faster than others, but is missing major validation features.
 */

export const baseSchema = a.object({
  name: a.object({
    first: a.string(),
    last: a.string(),
  }),
  login: a.object({
    email: a.string(),
    password: a.string(),
  }),
  organization_id: a.string(),
  requested_at: a.string(),
});

export const detailsSchema = a.object({
  name: a.object({
    // Currently doesn't support max / min
    // or any sort of custom logic validation post
    // object / value definition it seems
    // https://github.com/modiimedia/arri/issues/158
    first: a.string(), //.min(1).max(999),
    last: a.string(), //.min(1).max(999),
  }),
  login: a.object({
    email: a.string(), //.email(),
    password: a.string(), //.min(12).max(50),
  }),
  organization_id: a.string(), //.uuid(),
  requested_at: a.string(), // a.timestamp(),
});

// type User = a.infer<typeof User>;
