import { Schema } from '@effect/schema';
import { parse } from 'valibot';
import { users } from '../bench-many-objects/users.js';
import { user } from '../bench-single-object/user.js';
import { detailsSchema as ajvDetailsSchema } from '../schemas/ajv.js';
import { detailsSchema as effectDetailsSchema } from '../schemas/effectSchema.js';
import { detailsSchema as myzodDetailsSchema } from '../schemas/myzod.js';
import { detailsSchema as valibotDetailsSchema } from '../schemas/valibot.js';
import { detailsSchema as yupDetailsSchema } from '../schemas/yup.js';
import { detailsSchema as zodDetailsSchema } from '../schemas/zod.js';
import { detailsSchema as arktypeDetailsSchema } from '../schemas/arktype.js';
// import { detailsSchema as joiDetailsSchema } from '../schemas/joi.js';

type ValidatorResource = {
  href: string;
  name: string;
  singleAction: () => void;
  multipleActions: () => void;
};

export const validators = [
  {
    href: 'https://www.npmjs.com/package/ajv',
    name: 'ajv',
    singleAction() {
      ajvDetailsSchema(user);
    },
    multipleActions() {
      users.forEach((user) => ajvDetailsSchema(user));
    },
  } satisfies ValidatorResource,
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
    href: 'https://www.npmjs.com/package/yup',
    name: 'yup',
    singleAction() {
      yupDetailsSchema.isValidSync(user, { strict: true });
    },
    multipleActions() {
      users.forEach((user) =>
        yupDetailsSchema.isValidSync(user, { strict: true })
      );
    },
  } satisfies ValidatorResource,
  {
    href: 'https://www.npmjs.com/package/zod',
    name: 'zod',
    singleAction() {
      zodDetailsSchema.safeParse(user);
    },
    multipleActions() {
      users.forEach((user) => zodDetailsSchema.safeParse(user));
    },
  } satisfies ValidatorResource,
  {
    href: 'https://www.npmjs.com/package/myzod',
    name: 'myzod',
    singleAction() {
      myzodDetailsSchema.try(user);
    },
    multipleActions() {
      users.forEach((user) => myzodDetailsSchema.try(user));
    },
  } satisfies ValidatorResource,
  {
    href: 'https://valibot.dev/',
    name: 'valibot',
    singleAction() {
      parse(valibotDetailsSchema, user);
    },
    multipleActions() {
      users.forEach((user) => parse(valibotDetailsSchema, user));
    },
  } satisfies ValidatorResource,
  {
    href: 'https://effect.website/docs/schema/introduction/',
    name: '@effect/schema',
    singleAction() {
      Schema.decodeSync(effectDetailsSchema)(user);
    },
    multipleActions() {
      users.forEach((user) => Schema.decodeSync(effectDetailsSchema)(user));
    },
  } satisfies ValidatorResource,

  {
    href: 'https://arktype.io/',
    name: 'ArkType',
    singleAction() {
      arktypeDetailsSchema(user);
    },
    multipleActions() {
      users.forEach((user) => arktypeDetailsSchema(user));
    },
  } satisfies ValidatorResource,
] as const;
