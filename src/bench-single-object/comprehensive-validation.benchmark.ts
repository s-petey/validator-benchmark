import { Schema } from '@effect/schema'
import cronometro from 'cronometro'
import { parse } from 'valibot'
import * as ajv from '../schemas/ajv.js'
import * as effect from '../schemas/effectSchema.js'
import * as joi from '../schemas/joi.js'
import * as myzod from '../schemas/myzod.js'
import * as valibot from '../schemas/valibot.js'
import * as yup from '../schemas/yup.js'
import * as zod from '../schemas/zod.js'
import { user } from './user.js'

cronometro(
  {
    ajv: function () {
      ajv.detailsSchema(user)
    },
    joi: function () {
      joi.detailsSchema.validate(user)
    },
    myzod: function () {
      myzod.detailsSchema.try(user)
    },
    yup: function () {
      yup.detailsSchema.isValidSync(user, { strict: true })
    },
    zod: function () {
      zod.detailsSchema.safeParse(user)
    },
    effect: function () {
      Schema.decodeSync(effect.detailsSchema)(user)
    },
    valibot: function () {
      parse(valibot.detailsSchema, user)
    }
  },
  {
    iterations: 10_000_000,
    errorThreshold: 0,
    warmup: true,
    print: {
      colors: false,
      compare: true,
      compareMode: 'base'
    }
  },
  (err, results) => {
    if (err) {
      throw err
    }
    console.log(JSON.stringify(results, null, 2))
  }
)
