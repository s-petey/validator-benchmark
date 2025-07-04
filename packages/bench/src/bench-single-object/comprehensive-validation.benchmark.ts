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
import { user } from "./user.js";

cronometro(
  {
    arri: () => {
      a.parse(arri.detailsSchema, user);
    },
    ajv: () => {
      ajv.detailsSchema(user);
    },
    joi: () => {
      joi.detailsSchema.validate(user);
    },
    myzod: () => {
      myzod.detailsSchema.try(user);
    },
    yup: () => {
      yup.detailsSchema.isValidSync(user, { strict: true });
    },
    zod: () => {
      zod.detailsSchema.safeParse(user);
    },
    zod4: () => {
      zod4.detailsSchema.safeParse(user);
    },
    arktype: () => {
      arktype.detailsSchema(user);
    },
    typebox: () => {
      Value.Parse(typebox.detailsSchema, user);
    },
    effect: () => {
      Schema.decodeSync(effect.detailsSchema)(user);
    },
    valibot: () => {
      parse(valibot.detailsSchema, user);
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
    writeReport("single_comprehensive", JSON.stringify(results, null, 2));
  },
);
