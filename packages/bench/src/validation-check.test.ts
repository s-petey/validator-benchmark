import { strictEqual } from 'node:assert';
import { describe, test } from 'node:test';
import { users } from './bench-many-objects/users.js';
import { user } from './bench-single-object/user.js';
import * as ajv from './schemas/ajv.js';
import * as joi from './schemas/joi.js';
import * as myzod from './schemas/myzod.js';
import * as yup from './schemas/yup.js';
import * as zod from './schemas/zod.js';
import * as effect from './schemas/effectSchema.js';
import * as valibot from './schemas/valibot.js';
import { parse } from 'valibot';
import { Schema } from '@effect/schema';

describe('Single object bench, check if object pass the validation', () => {
  describe('ajv', () => {
    test('base', () => {
      strictEqual(ajv.baseSchema(user), true);
    });
    test('details', () => {
      strictEqual(ajv.detailsSchema(user), true);
    });
  });

  describe('joi', () => {
    test('base', () => {
      strictEqual(!joi.baseSchema.validate(user).error, true);
    });
    test('details', () => {
      strictEqual(!joi.detailsSchema.validate(user).error, true);
    });
  });

  describe('myzod', () => {
    test('base', () => {
      strictEqual(!(myzod.baseSchema.try(user) instanceof Error), true);
    });
    test('details', () => {
      strictEqual(!(myzod.detailsSchema.try(user) instanceof Error), true);
    });
  });

  describe('yup', () => {
    test('base', () => {
      strictEqual(yup.baseSchema.isValidSync(user, { strict: true }), true);
    });
    test('details', () => {
      strictEqual(yup.detailsSchema.isValidSync(user, { strict: true }), true);
    });
  });

  describe('zod', () => {
    test('base', () => {
      strictEqual(!zod.baseSchema.safeParse(user).error, true);
    });
    test('details', () => {
      strictEqual(!zod.detailsSchema.safeParse(user).error, true);
    });
  });

  describe('effect', () => {
    test('base', () => {
      strictEqual(!!Schema.decodeSync(effect.baseSchema)(user), true);
    });
    test('details', () => {
      strictEqual(!!Schema.decodeSync(effect.detailsSchema)(user), true);
    });
  });

  describe('valibot', () => {
    test('base', () => {
      strictEqual(!!parse(valibot.baseSchema, user), true);
    });
    test('details', () => {
      strictEqual(!!parse(valibot.detailsSchema, user), true);
    });
  });
});

describe('Many objects bench, check if all objects pass the validation', () => {
  describe('ajv', () => {
    test('base', () => {
      strictEqual(
        users
          .map((user) => ajv.baseSchema(user))
          .every((result) => result === true),
        true
      );
    });
    test('details', () => {
      strictEqual(
        users
          .map((user) => ajv.detailsSchema(user))
          .every((result) => result === true),
        true
      );
    });
  });

  describe('joi', () => {
    test('base', () => {
      strictEqual(
        users
          .map((user) => joi.baseSchema.validate(user))
          .every((result) => !result.error),
        true
      );
    });
    test('details', () => {
      strictEqual(
        users
          .map((user) => joi.detailsSchema.validate(user))
          .every((result) => !result.error),
        true
      );
    });
  });

  describe('myzod', () => {
    test('base', () => {
      strictEqual(
        users
          .map((user) => myzod.baseSchema.try(user))
          .every((result) => !(result instanceof Error)),
        true
      );
    });
    test('details', () => {
      strictEqual(
        users
          .map((user) => myzod.detailsSchema.try(user))
          .every((result) => !(result instanceof Error)),
        true
      );
    });
  });

  describe('yup', () => {
    test('base', () => {
      strictEqual(
        users
          .map((user) => yup.baseSchema.isValidSync(user, { strict: true }))
          .every((result) => result === true),
        true
      );
    });
    test('details', () => {
      strictEqual(
        users
          .map((user) => yup.detailsSchema.isValidSync(user, { strict: true }))
          .every((result) => result === true),
        true
      );
    });
  });

  describe('zod', () => {
    test('base', () => {
      strictEqual(
        users
          .map((user) => zod.baseSchema.safeParse(user))
          .every((result) => !result.error),
        true
      );
    });
    test('details', () => {
      strictEqual(
        users
          .map((user) => zod.detailsSchema.safeParse(user))
          .every((result) => !result.error),
        true
      );
    });
  });

  describe('effect', () => {
    test('base', () => {
      strictEqual(
        users
          .map((user) => Schema.decodeSync(effect.baseSchema)(user))
          .every((result) => !!result),
        true
      );
    });
    test('details', () => {
      strictEqual(
        users
          .map((user) => Schema.decodeSync(effect.detailsSchema)(user))
          .every((result) => !!result),
        true
      );
    });
  });

  describe('valibot', () => {
    test('base', () => {
      strictEqual(
        users
          .map((user) => parse(valibot.baseSchema, user))
          .every((result) => !!result),
        true
      );
    });
    test('details', () => {
      strictEqual(
        users
          .map((user) => parse(valibot.detailsSchema, user))
          .every((result) => !!result),
        true
      );
    });
  });
});
