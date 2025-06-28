import typia from 'typia';

export interface BaseSchema {
  name: {
    first: string;
    last: string;
  };
  login: {
    email: string;
    password: string;
  };
  organization_id: string;
  requested_at: string;
}

export interface DetailsSchema {
  name: {
    first: string & typia.tags.MinLength<1> & typia.tags.MaxLength<999>;
    last: string & typia.tags.MinLength<1> & typia.tags.MaxLength<999>;
  };
  login: {
    email: string & typia.tags.Format<'email'>;
    password: string & typia.tags.MinLength<12> & typia.tags.MaxLength<50>;
  };
  organization_id: string & typia.tags.Format<'uuid'>;
  requested_at: string & typia.tags.Format<'date-time'>;
}

// Validation functions using typia
export const validateBaseSchema = typia.createAssert<BaseSchema>();
export const isBaseSchema = (val: unknown) => typia.is<BaseSchema>(val);
export const validateDetailsSchema = typia.createAssert<DetailsSchema>();
export const isDetailsSchema = (val: unknown) => typia.is<DetailsSchema>(val);
