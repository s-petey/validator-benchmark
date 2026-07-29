import { a } from "@arrirpc/schema";
import { Value } from "@sinclair/typebox/value";
import cronometro from "cronometro";
import { Schema } from "effect";
import { Schema as SchemaV4 } from "effect4";
import { safeParse } from "valibot";
import { writeReport } from "../fileWriter.js";
import * as ajv from "../schemas/ajv.js";
import * as arktype from "../schemas/arktype.js";
import * as arri from "../schemas/arri.js";
import * as effect from "../schemas/effectSchema.js";
import * as effectV4 from "../schemas/effectSchema4.js";
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
      users.forEach((user) => {
        a.validate(arri.baseSchema, user);
      });
    },
    ajv: () => {
      users.forEach((user) => {
        ajv.baseSchema(user);
      });
    },
    joi: () => {
      users.forEach((user) => {
        joi.baseSchema.validate(user);
      });
    },
    myzod: () => {
      users.forEach((user) => {
        myzod.baseSchema.try(user);
      });
    },
    yup: () => {
      users.forEach((user) => {
        yup.baseSchema.isValidSync(user, { strict: true });
      });
    },
    zod: () => {
      users.forEach((user) => {
        zod.baseSchema.safeParse(user);
      });
    },
    zod4: () => {
      users.forEach((user) => {
        zod4.baseSchema.safeParse(user);
      });
    },
    arktype: () => {
      users.forEach((user) => {
        arktype.baseSchema(user);
      });
    },
    effect: () => {
      users.forEach((user) => {
        Schema.decodeEither(effect.baseSchema)(user);
      });
    },
    effectV4: () => {
      users.forEach((user) => {
        SchemaV4.decodeResult(effectV4.baseSchema)(user);
      });
    },
    valibot: () => {
      users.forEach((user) => {
        safeParse(valibot.baseSchema, user);
      });
    },
    typebox: () => {
      users.forEach((user) => {
        Value.Parse(typebox.baseSchema, user);
      });
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

    writeReport("many_types", JSON.stringify(results, null, 2));
  },
);
