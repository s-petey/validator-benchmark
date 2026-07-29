import { Schema, SchemaGetter } from "effect4";

const emailRegex = /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

export const emailSchema = Schema.String.pipe(
  Schema.decode({ decode: SchemaGetter.trim(), encode: SchemaGetter.passthrough() }),
  Schema.decode({ decode: SchemaGetter.toLowerCase(), encode: SchemaGetter.passthrough() }),
  Schema.check(Schema.isPattern(emailRegex, {
    message: "Email address is invalid",
  })),
  Schema.brand("EmailBrand"),
);

export const baseSchema = Schema.Struct({
  name: Schema.Struct({
    first: Schema.String,
    last: Schema.String,
  }),
  login: Schema.Struct({
    email: Schema.String,
    password: Schema.String,
  }),
  organization_id: Schema.String,
  requested_at: Schema.String,
});

export const detailsSchema = Schema.Struct({
  name: Schema.Struct({
    first: Schema.String.pipe(Schema.check(Schema.isMinLength(1)), Schema.check(Schema.isMaxLength(999))),
    last: Schema.String.pipe(Schema.check(Schema.isMinLength(1)), Schema.check(Schema.isMaxLength(999))),
  }),
  login: Schema.Struct({
    email: emailSchema,
    password: Schema.String.pipe(Schema.check(Schema.isMinLength(12)), Schema.check(Schema.isMaxLength(50))),
  }),
  organization_id: Schema.String.pipe(Schema.check(Schema.isUUID())),
  requested_at: Schema.DateFromString,
});
