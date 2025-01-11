import { Schema } from '@effect/schema';
import { parse } from 'valibot';
import { users } from '../bench-many-objects/users.js';
import { user } from '../bench-single-object/user.js';
import { detailsSchema as ajvDetailsSchema } from '../schemas/ajv.js';
import { detailsSchema as effectDetailsSchema } from '../schemas/effectSchema.js';
// import { detailsSchema as joiDetailsSchema } from '../schemas/joi.js';
import { detailsSchema as myzodDetailsSchema } from '../schemas/myzod.js';
import { detailsSchema as valibotDetailsSchema } from '../schemas/valibot.js';
import { detailsSchema as yupDetailsSchema } from '../schemas/yup.js';
import { detailsSchema as zodDetailsSchema } from '../schemas/zod.js';

export const manyBenchmarks = {
  ajv() {
    users.forEach((user) => ajvDetailsSchema(user));
  },
  // joi () {
  //   users.forEach((user) => joiDetailsSchema.validate(user));
  // },
  myzod() {
    users.forEach((user) => myzodDetailsSchema.try(user));
  },
  yup() {
    users.forEach((user) =>
      yupDetailsSchema.isValidSync(user, { strict: true })
    );
  },
  zod() {
    users.forEach((user) => zodDetailsSchema.safeParse(user));
  },
  effect() {
    users.forEach((user) => Schema.decodeSync(effectDetailsSchema)(user));
  },
  valibot() {
    users.forEach((user) => parse(valibotDetailsSchema, user));
  },
} as const;

export const singleBenchmarks = {
  ajv() {
    ajvDetailsSchema(user);
  },
  // joi () {
  //   joiDetailsSchema.validate(user);
  // },
  myzod() {
    myzodDetailsSchema.try(user);
  },
  yup() {
    yupDetailsSchema.isValidSync(user, { strict: true });
  },
  zod() {
    zodDetailsSchema.safeParse(user);
  },
  effect() {
    Schema.decodeSync(effectDetailsSchema)(user);
  },
  valibot() {
    parse(valibotDetailsSchema, user);
  },
} as const;
