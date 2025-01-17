import { Schema } from '@effect/schema'

const emailRegex =
  /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i

const EmailBrand = Symbol.for('EmailBrand')

export const emailSchema = Schema.compose(Schema.Trim, Schema.Lowercase).pipe(
  Schema.pattern(emailRegex, {
    message: () => 'Email address is invalid'
  }),
  Schema.brand(EmailBrand)
)

export const baseSchema = Schema.Struct({
  name: Schema.Struct({
    first: Schema.String,
    last: Schema.String
  }),
  login: Schema.Struct({
    email: Schema.String,
    password: Schema.String
  }),
  organization_id: Schema.String,
  requested_at: Schema.String
})

export const detailsSchema = Schema.Struct({
  name: Schema.Struct({
    first: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(999)),
    last: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(999))
  }),
  login: Schema.Struct({
    email: emailSchema,
    password: Schema.String.pipe(Schema.minLength(12), Schema.maxLength(50))
  }),
  organization_id: Schema.UUID,
  requested_at: Schema.DateFromString
})
