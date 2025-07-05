import { a } from "@arrirpc/schema";
import { Value } from "@sinclair/typebox/value";
import { type } from "arktype";
import { Schema } from "effect";
import { parse } from "valibot";
import { users } from "../bench-many-objects/users.js";
import { user } from "../bench-single-object/user.js";
import { detailsSchema as ajvDetailsSchema } from "../schemas/ajv.js";
import { detailsSchema as arktypeDetailsSchema } from "../schemas/arktype.js";
import { detailsSchema as arriDetailsSchema } from "../schemas/arri.js";
import { detailsSchema as effectDetailsSchema } from "../schemas/effectSchema.js";
import { detailsSchema as myzodDetailsSchema } from "../schemas/myzod.js";
import { detailsSchema as typeboxDetailsSchema } from "../schemas/typebox.js";
import { detailsSchema as valibotDetailsSchema } from "../schemas/valibot.js";
import { detailsSchema as yupDetailsSchema } from "../schemas/yup.js";
import { detailsSchema as zodDetailsSchema } from "../schemas/zod.js";
import { detailsSchema as zod4DetailsSchema } from "../schemas/zod4.js";

// import { detailsSchema as joiDetailsSchema } from '../schemas/joi.js';

type ValidatorResource = {
  href: string;
  name: string;
  singleAction: () => void;
  multipleActions: () => void;
};

export const validators = [
  {
    href: "https://www.npmjs.com/package/ajv",
    name: "ajv",
    singleAction() {
      ajvDetailsSchema(user);
    },
    multipleActions() {
      users.forEach((user) => ajvDetailsSchema(user));
    },
  },
  {
    href: "https://arktype.io/",
    name: "ArkType",
    singleAction() {
      const result = arktypeDetailsSchema(user);
      if (result instanceof type.errors) {
        throw result;
      }
    },
    multipleActions() {
      users.forEach((user) => {
        const result = arktypeDetailsSchema(user);
        if (result instanceof type.errors) {
          throw result;
        }
      });
    },
  },
  {
    href: "https://www.npmjs.com/package/@arrirpc/schema",
    name: "arri",
    singleAction() {
      a.parse(arriDetailsSchema, user);
    },
    multipleActions() {
      users.forEach((user) => a.parse(arriDetailsSchema, user));
    },
  },
  {
    href: "https://effect.website/docs/schema/introduction/",
    name: "effect",
    singleAction() {
      Schema.decodeSync(effectDetailsSchema)(user);
    },
    multipleActions() {
      users.forEach((user) => Schema.decodeSync(effectDetailsSchema)(user));
    },
  },
  // TODO: Figure out why JOI errors...
  // {
  //   href: 'https://www.npmjs.com/package/joi',
  //   name: 'joi',
  //   singleAction() {
  //     joiDetailsSchema.validate(user);
  //   },
  //   multipleActions() {
  //     users.forEach((user) => joiDetailsSchema.validate(user));
  //   },
  // },
  {
    href: "https://www.npmjs.com/package/myzod",
    name: "myzod",
    singleAction() {
      myzodDetailsSchema.try(user);
    },
    multipleActions() {
      users.forEach((user) => myzodDetailsSchema.try(user));
    },
  },
  {
    href: "https://github.com/sinclairzx81/typebox",
    name: "typebox",
    singleAction() {
      Value.Parse(typeboxDetailsSchema, user);
    },
    multipleActions() {
      users.forEach((user) => {
        Value.Parse(typeboxDetailsSchema, user);
      });
    },
  },
  {
    href: "https://valibot.dev/",
    name: "valibot",
    singleAction() {
      parse(valibotDetailsSchema, user);
    },
    multipleActions() {
      users.forEach((user) => parse(valibotDetailsSchema, user));
    },
  },
  {
    href: "https://www.npmjs.com/package/yup",
    name: "yup",
    singleAction() {
      yupDetailsSchema.isValidSync(user, { strict: true });
    },
    multipleActions() {
      users.forEach((user) => yupDetailsSchema.isValidSync(user, { strict: true }));
    },
  },
  {
    href: "https://www.npmjs.com/package/zod",
    name: "zod",
    singleAction() {
      zodDetailsSchema.parse(user);
    },
    multipleActions() {
      users.forEach((user) => zodDetailsSchema.parse(user));
    },
  },
  {
    href: "https://www.npmjs.com/package/zod",
    name: "zodV4",
    singleAction() {
      zod4DetailsSchema.parse(user);
    },
    multipleActions() {
      users.forEach((user) => zod4DetailsSchema.parse(user));
    },
  },
] as const satisfies Readonly<ValidatorResource[]>;

export const validatorNames = validators.map((v) => v.name);
