import { a } from "@arrirpc/schema";
import { Value } from "@sinclair/typebox/value";
import cronometro from "cronometro";
import { Schema } from "effect";
import { safeParse } from "valibot";
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
      a.validate(arri.baseSchema, user);
    },
    ajv: () => {
      ajv.baseSchema(user);
    },
    joi: () => {
      joi.baseSchema.validate(user);
    },
    myzod: () => {
      myzod.baseSchema.try(user);
    },
    yup: () => {
      yup.baseSchema.isValidSync(user, { strict: true });
    },
    zod: () => {
      zod.baseSchema.safeParse(user);
    },
    zod4: () => {
      zod4.baseSchema.safeParse(user);
    },
    arktype: () => {
      arktype.baseSchema(user);
    },
    // TODO: I don't know if this was done properly
    effect: () => {
      Schema.decodeEither(effect.baseSchema)(user);
    },
    valibot: () => {
      safeParse(valibot.baseSchema, user);
    },
    typebox: () => {
      Value.Check(typebox.baseSchema, user);
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
    writeReport("single_types", JSON.stringify(results, null, 2));
  },
);
