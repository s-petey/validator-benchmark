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
import { user } from './user.js';

cronometro(
  {
    ajv: function () {
      ajv.baseSchema(user);
    },
    joi: function () {
      joi.baseSchema.validate(user);
    },
    myzod: function () {
      myzod.baseSchema.try(user);
    },
    yup: function () {
      yup.baseSchema.isValidSync(user, { strict: true });
    },
    zod: function () {
      zod.baseSchema.safeParse(user);
    },
    zod4: function () {
      zod4.baseSchema.safeParse(user);
    },
    arktype: function () {
      arktype.baseSchema(user);
    },
    // TODO: I don't know if this was done properly
    effect: function () {
      Schema.decodeEither(effect.detailsSchema)(user);
    },
    valibot: function () {
      safeParse(valibot.detailsSchema, user);
    },
  },
  {
    iterations: 10_000_000,
    errorThreshold: 0,
    warmup: true,
  },
  (err, results) => {
    if (err) {
      throw err;
    }
    console.log(JSON.stringify(results, null, 2));
    writeReport('single_types', JSON.stringify(results, null, 2));
  }
);
