import * as v from 'valibot'

export const baseSchema = v.object({
  name: v.object({
    first: v.string(),
    last: v.string()
  }),
  login: v.object({
    email: v.string(),
    password: v.string()
  }),
  organization_id: v.string(),
  requested_at: v.string()
})

export const detailsSchema = v.object({
  name: v.object({
    first: v.pipe(v.string(), v.minLength(1), v.maxLength(999)),
    last: v.pipe(v.string(), v.minLength(1), v.maxLength(999))
  }),
  login: v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(12), v.maxLength(50))
  }),
  organization_id: v.pipe(v.string(), v.uuid()),
  requested_at: v.pipe(v.string(), v.isoTimestamp())
})
