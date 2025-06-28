import { describe, test, expect } from 'vitest';
import { users } from './bench-many-objects/users.js';
import { user } from './bench-single-object/user.js';
import * as ajv from './schemas/ajv.js';
import * as joi from './schemas/joi.js';
import * as myzod from './schemas/myzod.js';
import * as yup from './schemas/yup.js';
import * as zod from './schemas/zod.js';
import * as zod4 from './schemas/zod4.js';
import * as arktype from './schemas/arktype.js';
import * as effect from './schemas/effectSchema.js';
import * as valibot from './schemas/valibot.js';
import * as arri from './schemas/arri.js';
import { parse } from 'valibot';
import { Schema } from 'effect';
import { ArkErrors } from 'arktype';
import { a } from '@arrirpc/schema';

describe('Single object bench, check if object pass the validation', () => {
  describe('arri', () => {
    test('base', () => {
      expect(a.validate(arri.baseSchema, user)).toBe(true);
    });
    test('details', () => {
      expect(a.validate(arri.detailsSchema, user)).toBe(true);
    });
  });

  describe('ajv', () => {
    test('base', () => {
      expect(ajv.baseSchema(user)).toBe(true);
    });
    test('details', () => {
      expect(ajv.detailsSchema(user)).toBe(true);
    });
  });

  describe('joi', () => {
    test('base', () => {
      expect(!joi.baseSchema.validate(user).error).toBe(true);
    });
    test('details', () => {
      expect(!joi.detailsSchema.validate(user).error).toBe(true);
    });
  });

  describe('myzod', () => {
    test('base', () => {
      expect(!(myzod.baseSchema.try(user) instanceof Error)).toBe(true);
    });
    test('details', () => {
      expect(!(myzod.detailsSchema.try(user) instanceof Error)).toBe(true);
    });
  });

  describe('yup', () => {
    test('base', () => {
      expect(yup.baseSchema.isValidSync(user, { strict: true })).toBe(true);
    });
    test('details', () => {
      expect(yup.detailsSchema.isValidSync(user, { strict: true })).toBe(true);
    });
  });

  describe('zod', () => {
    test('base', () => {
      expect(!zod.baseSchema.safeParse(user).error).toBe(true);
    });
    test('details', () => {
      expect(!zod.detailsSchema.safeParse(user).error).toBe(true);
    });
  });

  describe('zod4', () => {
    test('base', () => {
      expect(!zod4.baseSchema.safeParse(user).error).toBe(true);
    });
    test('details', () => {
      expect(!zod4.detailsSchema.safeParse(user).error).toBe(true);
    });
  });

  describe('arktype', () => {
    test('base', () => {
      expect(!(arktype.baseSchema(user) instanceof ArkErrors)).toBe(true);
    });
    test('details', () => {
      expect(!(arktype.detailsSchema(user) instanceof ArkErrors)).toBe(true);
    });
  });

  describe('effect', () => {
    test('base', () => {
      expect(!!Schema.decodeSync(effect.baseSchema)(user)).toBe(true);
    });
    test('details', () => {
      expect(!!Schema.decodeSync(effect.detailsSchema)(user)).toBe(true);
    });
  });

  describe('valibot', () => {
    test('base', () => {
      expect(!!parse(valibot.baseSchema, user)).toBe(true);
    });
    test('details', () => {
      expect(!!parse(valibot.detailsSchema, user)).toBe(true);
    });
  });
});

describe('Many objects bench, check if all objects pass the validation', () => {
  describe('arri', () => {
    test('base', () => {
      expect(
        users
          .map((user) => a.validate(arri.baseSchema, user))
          .every((result) => result === true)
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => a.validate(arri.detailsSchema, user))
          .every((result) => result === true)
      ).toBe(true);
    });
  });

  describe('ajv', () => {
    test('base', () => {
      expect(
        users
          .map((user) => ajv.baseSchema(user))
          .every((result) => result === true)
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => ajv.detailsSchema(user))
          .every((result) => result === true)
      ).toBe(true);
    });
  });

  describe('joi', () => {
    test('base', () => {
      expect(
        users
          .map((user) => joi.baseSchema.validate(user))
          .every((result) => !result.error)
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => joi.detailsSchema.validate(user))
          .every((result) => !result.error)
      ).toBe(true);
    });
  });

  describe('myzod', () => {
    test('base', () => {
      expect(
        users
          .map((user) => myzod.baseSchema.try(user))
          .every((result) => !(result instanceof Error))
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => myzod.detailsSchema.try(user))
          .every((result) => !(result instanceof Error))
      ).toBe(true);
    });
  });

  describe('yup', () => {
    test('base', () => {
      expect(
        users
          .map((user) => yup.baseSchema.isValidSync(user, { strict: true }))
          .every((result) => result === true)
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => yup.detailsSchema.isValidSync(user, { strict: true }))
          .every((result) => result === true)
      ).toBe(true);
    });
  });

  describe('zod', () => {
    test('base', () => {
      expect(
        users
          .map((user) => zod.baseSchema.safeParse(user))
          .every((result) => !result.error)
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => zod.detailsSchema.safeParse(user))
          .every((result) => !result.error)
      ).toBe(true);
    });
  });

  describe('zod4', () => {
    test('base', () => {
      expect(
        users
          .map((user) => zod4.baseSchema.safeParse(user))
          .every((result) => !result.error)
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => zod4.detailsSchema.safeParse(user))
          .every((result) => !result.error)
      ).toBe(true);
    });
  });

  describe('arktype', () => {
    test('base', () => {
      expect(
        users
          .map((user) => arktype.baseSchema(user) instanceof ArkErrors)
          .every((result) => !result)
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => arktype.detailsSchema(user) instanceof ArkErrors)
          .every((result) => !result)
      ).toBe(true);
    });
  });

  describe('effect', () => {
    test('base', () => {
      expect(
        users
          .map((user) => Schema.decodeSync(effect.baseSchema)(user))
          .every((result) => !!result)
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => Schema.decodeSync(effect.detailsSchema)(user))
          .every((result) => !!result)
      ).toBe(true);
    });
  });

  describe('valibot', () => {
    test('base', () => {
      expect(
        users
          .map((user) => parse(valibot.baseSchema, user))
          .every((result) => !!result)
      ).toBe(true);
    });
    test('details', () => {
      expect(
        users
          .map((user) => parse(valibot.detailsSchema, user))
          .every((result) => !!result)
      ).toBe(true);
    });
  });
});
