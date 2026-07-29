import { a } from "@arrirpc/schema";
import { Value } from "@sinclair/typebox/value";
import { type } from "arktype";
import { Either, Schema } from "effect";
import { Schema as SchemaV4 } from "effect4";
import { parse } from "valibot";
import { users } from "../bench-many-objects/users.js";
import { user } from "../bench-single-object/user.js";
import { detailsSchema as ajvDetailsSchema } from "../schemas/ajv.js";
import { detailsSchema as arktypeDetailsSchema } from "../schemas/arktype.js";
import { detailsSchema as arriDetailsSchema } from "../schemas/arri.js";
import { detailsSchema as effectDetailsSchema } from "../schemas/effectSchema.js";
import { detailsSchema as effectV4DetailsSchema } from "../schemas/effectSchema4.js";
import { detailsSchema as ioTsDetailsSchema } from "../schemas/ioTs.js";
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
  npmPackageName: string;
  singleAction: () => void;
  multipleActions: () => void;
};

export const validators = [
  {
    href: "https://www.npmjs.com/package/ajv",
    name: "ajv",
    npmPackageName: "ajv",
    singleAction() {
      ajvDetailsSchema(user);
    },
    multipleActions() {
      users.forEach((user) => {
        ajvDetailsSchema(user);
      });
    },
  },
  {
    href: "https://arktype.io/",
    name: "ArkType",
    npmPackageName: "arktype",
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
    npmPackageName: "@arrirpc/schema",
    singleAction() {
      a.parse(arriDetailsSchema, user);
    },
    multipleActions() {
      users.forEach((user) => {
        a.parse(arriDetailsSchema, user);
      });
    },
  },
  {
    href: "https://effect.website/docs/schema/introduction/",
    name: "effect",
    npmPackageName: "effect",
    singleAction() {
      Schema.decodeSync(effectDetailsSchema)(user);
    },
    multipleActions() {
      users.forEach((user) => {
        Schema.decodeSync(effectDetailsSchema)(user);
      });
    },
  },
  {
    href: "https://effect.website/docs/schema/introduction/",
    name: "effectV4",
    npmPackageName: "effect4",
    singleAction() {
      SchemaV4.decodeSync(effectV4DetailsSchema)(user);
    },
    multipleActions() {
      users.forEach((user) => {
        SchemaV4.decodeSync(effectV4DetailsSchema)(user);
      });
    },
  },
  {
    // Note it looks like IO-TS is now moved to schema and the peer dependency FP-TS is depricated
    // in favor of Effect -- https://x.com/MichaelArnaldi/status/1672228793631506432
    href: "https://github.com/gcanti/io-ts",
    name: "io-ts",
    npmPackageName: "io-ts",
    singleAction() {
      const result = ioTsDetailsSchema.decode(user);
      // @ts-expect-error -- Left type is unknown -- Ignoring...
      if (Either.isLeft(result)) {
        throw result.left;
      }
    },
    multipleActions() {
      users.forEach((user) => {
        const result = ioTsDetailsSchema.decode(user);
        // @ts-expect-error -- Left type is unknown -- Ignoring...
        if (Either.isLeft(result)) {
          throw result.left;
        }
      });
    },
  },
  // TODO: Figure out why JOI errors...
  // {
  //   href: 'https://www.npmjs.com/package/joi',
  //   name: 'joi',
  //   npmPackageName: "joi",
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
    npmPackageName: "myzod",
    singleAction() {
      myzodDetailsSchema.try(user);
    },
    multipleActions() {
      users.forEach((user) => {
        myzodDetailsSchema.try(user);
      });
    },
  },
  {
    href: "https://github.com/sinclairzx81/typebox",
    name: "typebox",
    npmPackageName: "@sinclair/typebox",
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
    npmPackageName: "valibot",
    singleAction() {
      parse(valibotDetailsSchema, user);
    },
    multipleActions() {
      users.forEach((user) => {
        parse(valibotDetailsSchema, user);
      });
    },
  },
  {
    href: "https://www.npmjs.com/package/yup",
    name: "yup",
    npmPackageName: "yup",
    singleAction() {
      yupDetailsSchema.isValidSync(user, { strict: true });
    },
    multipleActions() {
      users.forEach((user) => {
        yupDetailsSchema.isValidSync(user, { strict: true });
      });
    },
  },
  {
    href: "https://v3.zod.dev/",
    name: "zod",
    npmPackageName: "zod3",
    singleAction() {
      zodDetailsSchema.parse(user);
    },
    multipleActions() {
      users.forEach((user) => {
        zodDetailsSchema.parse(user);
      });
    },
  },
  {
    href: "https://zod.dev/v4",
    name: "zodV4",
    npmPackageName: "zod",
    singleAction() {
      zod4DetailsSchema.parse(user);
    },
    multipleActions() {
      users.forEach((user) => {
        zod4DetailsSchema.parse(user);
      });
    },
  },
] as const satisfies Readonly<ValidatorResource[]>;

export type Validator = (typeof validators)[number];

export const validatorNames = validators.map((v) => v.name);
