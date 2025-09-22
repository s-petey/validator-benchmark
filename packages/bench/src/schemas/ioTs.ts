import * as t from "io-ts";

export const baseSchema = t.type({
  name: t.type({
    first: t.string,
    last: t.string,
  }),
  login: t.type({
    email: t.string,
    password: t.string,
  }),
  organization_id: t.string,
  requested_at: t.string,
});

export const detailsSchema = t.type({
  name: t.type({
    first: t.string,
    last: t.string,
  }),
  login: t.type({
    email: t.string,
    password: t.string,
  }),
  organization_id: t.string,
  requested_at: t.string,
});
