import { type } from "arktype";

export const baseSchema = type({
  name: type({
    first: "string",
    last: "string",
  }),
  login: type({
    email: "string",
    password: "string",
  }),
  organization_id: "string",
  requested_at: "string",
});

export const detailsSchema = type({
  name: type({
    first: "0 < string <= 999",
    last: "0 < string <= 999",
  }),
  login: type({
    email: "string.email",
    password: "12 <= string < 50",
  }),
  organization_id: "string.uuid",
  requested_at: "string.date",
});
