import { Schema } from '@effect/schema';
import cronometro from 'cronometro';
import { safeParse } from 'valibot';
import { writeReport } from '../fileWriter.js';
import * as ajv from '../schemas/ajv.js';
import * as effect from '../schemas/effectSchema.js';
import * as joi from '../schemas/joi.js';
import * as myzod from '../schemas/myzod.js';
import * as valibot from '../schemas/valibot.js';
import * as yup from '../schemas/yup.js';
import * as zod from '../schemas/zod.js';
import * as zod4 from '../schemas/zod4.js';
import * as arktype from '../schemas/arktype.js';
import { users } from './users.js';

cronometro(
  {
    ajv: function () {
      users.forEach((user) => ajv.baseSchema(user));
    },
    joi: function () {
      users.forEach((user) => joi.baseSchema.validate(user));
    },
    myzod: function () {
      users.forEach((user) => myzod.baseSchema.try(user));
    },
    yup: function () {
      users.forEach((user) =>
        yup.baseSchema.isValidSync(user, { strict: true })
      );
    },
    zod: function () {
      users.forEach((user) => zod.baseSchema.safeParse(user));
    },
    zod4: function () {
      users.forEach((user) => zod4.baseSchema.safeParse(user));
    },
    arktype: function () {
      users.forEach((user) => arktype.baseSchema(user));
    },
    effect: function () {
      users.forEach((user) => Schema.decodeEither(effect.detailsSchema)(user));
    },
    valibot: function () {
      users.forEach((user) => safeParse(valibot.detailsSchema, user));
    },
  },
  {
    iterations: 10_000,
    errorThreshold: 0,
    warmup: true,
  },
  (err, results) => {
    if (err) {
      throw err;
    }
    console.log(JSON.stringify(results, null, 2));

    writeReport('many_types', JSON.stringify(results, null, 2));
  }
);
