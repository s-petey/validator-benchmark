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
import { users } from './users.js'

cronometro(
  {
    ajv: function () {
      users.forEach((user) => ajv.detailsSchema(user))
    },
    joi: function () {
      users.forEach((user) => joi.detailsSchema.validate(user))
    },
    myzod: function () {
      users.forEach((user) => myzod.detailsSchema.try(user))
    },
    yup: function () {
      users.forEach((user) =>
        yup.detailsSchema.isValidSync(user, { strict: true })
      )
    },
    zod: function () {
      users.forEach((user) => zod.detailsSchema.safeParse(user))
    },
    effect: function () {
      users.forEach((user) => Schema.decodeSync(effect.detailsSchema)(user))
    },
    valibot: function () {
      users.forEach((user) => parse(valibot.detailsSchema, user))
    }
  },
  {
    iterations: 10_000,
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
