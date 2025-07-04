import { FormatRegistry, Type } from "@sinclair/typebox";
import { DefaultErrorFunction, SetErrorFunction } from "@sinclair/typebox/errors";

// ISSUE Registering an email...
// https://github.com/sinclairzx81/typebox/issues/1188#issuecomment-2676992599
// ------------------------------------------------------------------
// FormatRegistry: Register Email Format
// ------------------------------------------------------------------
FormatRegistry.Set("email", (value) =>
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(
    value,
  ),
);

// ------------------------------------------------------------------
// FormatRegistry: Register UUID Format
// ------------------------------------------------------------------
FormatRegistry.Set("uuid", (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

// ------------------------------------------------------------------
// FormatRegistry: Register DateTime Format
// ------------------------------------------------------------------
FormatRegistry.Set("date-time", (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/i.test(value));

// ------------------------------------------------------------------
// SetErrorFunction: Intercept schemas with errorMessage property
// ------------------------------------------------------------------
SetErrorFunction((parameter) => {
  return "errorMessage" in parameter.schema ? parameter.schema.errorMessage : DefaultErrorFunction(parameter);
});

// END stupid custom implementations of these types
// of validation... should be built in to TypeBox.

export const baseSchema = Type.Object({
  name: Type.Object({
    first: Type.String(),
    last: Type.String(),
  }),
  login: Type.Object({
    email: Type.String(),
    password: Type.String(),
  }),
  organization_id: Type.String(),
  requested_at: Type.String(),
});

export const detailsSchema = Type.Object({
  name: Type.Object({
    first: Type.String({ minLength: 1, maxLength: 999 }),
    last: Type.String({ minLength: 1, maxLength: 999 }),
  }),
  login: Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 12, maxLength: 50 }),
  }),
  organization_id: Type.String({ format: "uuid" }),
  requested_at: Type.String({ format: "date-time" }),
});
