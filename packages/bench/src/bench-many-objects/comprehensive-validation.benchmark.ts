import { a } from "@arrirpc/schema";
import { Value } from "@sinclair/typebox/value";
import cronometro from "cronometro";
import { Schema } from "effect";
import { parse } from "valibot";
import { writeReport } from "../fileWriter.js";
import * as ajv from "../schemas/ajv.js";
import * as arktype from "../schemas/arktype.js";
import * as arri from "../schemas/arri.js";
import * as effect from "../schemas/effectSchema.js";
import * as joi from "../schemas/joi.js";
import * as myzod from "../schemas/myzod.js";
import * as typebox from "../schemas/typebox.js";
import * as valibot from "../schemas/valibot.js";
import * as yup from "../schemas/yup.js";
import * as zod from "../schemas/zod.js";
import * as zod4 from "../schemas/zod4.js";
import { users } from "./users.js";

cronometro(
  {
    arri: () => {
      users.forEach((user) => a.parse(arri.detailsSchema, user));
    },
    ajv: () => {
      users.forEach((user) => ajv.detailsSchema(user));
    },
    joi: () => {
      users.forEach((user) => joi.detailsSchema.validate(user));
    },
    myzod: () => {
      users.forEach((user) => myzod.detailsSchema.try(user));
    },
    yup: () => {
      users.forEach((user) => yup.detailsSchema.isValidSync(user, { strict: true }));
    },
    zod: () => {
      users.forEach((user) => zod.detailsSchema.safeParse(user));
    },
    zod4: () => {
      users.forEach((user) => zod4.detailsSchema.safeParse(user));
    },
    arktype: () => {
      users.forEach((user) => arktype.detailsSchema(user));
    },
    effect: () => {
      users.forEach((user) => Schema.decodeSync(effect.detailsSchema)(user));
    },
    valibot: () => {
      users.forEach((user) => parse(valibot.detailsSchema, user));
    },
    typebox: () => {
      users.forEach((user) => Value.Parse(typebox.detailsSchema, user));
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

    writeReport("many_comprehensive", JSON.stringify(results, null, 2));
  },
);
