import { isArray } from '@specfocus/spec-focus/arrays';
import { isNumber } from '@specfocus/spec-focus/numbers';
import { isString } from '@specfocus/spec-focus/strings';
import {
  containsOperation,
  createQueryOperation,
  createTester, EqualsOperation,
  NamedBaseOperation, 
  Options,
  Query,
  QueryOperation,
  Tester
} from "./core";
import { comparable, isFunction, Key } from "./utils";

// https://docs.mongodb.com/manual/reference/operator/query/elemMatch/
class $ElemMatch extends NamedBaseOperation<Query<any>> {
  private _queryOperation!: QueryOperation<any>;
  init() {
    this._queryOperation = createQueryOperation(
      this.params,
      this.owneryQuery,
      this.options
    );
  }
  reset() {
    super.reset();
    this._queryOperation.reset();
  }
  next(item: any) {
    if (isArray(item)) {
      for (let i = 0, { length } = item; i < length; i++) {
        // reset query operation since item being tested needs to pass _all_ query
        // operations for it to be a success
        this._queryOperation.reset();

        // check item
        this._queryOperation.next(item[i], i, item);
        this.keep = this.keep || this._queryOperation.keep;
      }
      this.done = true;
    } else {
      this.done = false;
      this.keep = false;
    }
  }
}



export class $Size extends NamedBaseOperation<any> {
  init() { }
  next(item: any) {
    if (isArray(item) && item.length === this.params) {
      this.done = true;
      this.keep = true;
    }
    // if (parent && parent.length === this.params) {
    //   this.done = true;
    //   this.keep = true;
    // }
  }
}





class $In extends NamedBaseOperation<any> {
  private _testers!: Tester[];
  init() {
    this._testers = this.params.map((value: any) => {
      if (containsOperation(value)) {
        throw new Error(
          `cannot nest $ under ${this.constructor.name.toLowerCase()}`
        );
      }
      return createTester(value, this.options.compare);
    });
  }
  next(item: any, key: Key, owner: any) {
    let done = false;
    let success = false;
    for (let i = 0, { length } = this._testers; i < length; i++) {
      const test = this._testers[i];
      if (test(item)) {
        done = true;
        success = true;
        break;
      }
    }

    this.keep = success;
    this.done = done;
  }
}

class $Nin extends $In {
  next(item: any, key: Key, owner: any) {
    super.next(item, key, owner);
    this.keep = !this.keep;
  }
}

class $Exists extends NamedBaseOperation<boolean> {
  next(item: any, key: Key, owner: any) {
    if (owner.hasOwnProperty(key) === this.params) {
      this.done = true;
      this.keep = true;
    }
  }
}

export const $elemMatch = (
  params: any,
  owneryQuery: Query<any>,
  options: Options,
  name: string
) => new $ElemMatch(params, owneryQuery, options, name);
export const $nin = (
  params: any,
  owneryQuery: Query<any>,
  options: Options,
  name: string
) => new $Nin(params, owneryQuery, options, name);
export const $in = (
  params: any,
  owneryQuery: Query<any>,
  options: Options,
  name: string
) => new $In(params, owneryQuery, options, name);

export const $mod = (
  [mod, equalsValue]: number[],
  owneryQuery: Query<any>,
  options: Options
) =>
  new EqualsOperation(
    (b: any) => <number>comparable(b) % mod === equalsValue,
    owneryQuery,
    options
  );
export const $exists = (
  params: boolean,
  owneryQuery: Query<any>,
  options: Options,
  name: string
) => new $Exists(params, owneryQuery, options, name);
export const $regex = (
  pattern: string,
  owneryQuery: Query<any>,
  options: Options
) =>
  new EqualsOperation(
    new RegExp(pattern, owneryQuery.$options),
    owneryQuery,
    options
  );


const typeAliases: Record<string, (v: any) => boolean> = {
  number: isNumber,
  string: isString,
  bool: (v: any) => typeof v === "boolean",
  array: isArray,
  null: (v: any) => v === null,
  timestamp: (v: any) => v instanceof Date
};

export const $type = (
  clazz: Function | string,
  owneryQuery: Query<any>,
  options: Options
) =>
  new EqualsOperation(
    (b: any) => {
      if (isString(clazz)) {
        if (!typeAliases[clazz]) {
          throw new Error(`Type alias does not exist`);
        }

        return typeAliases[clazz](b);
      }

      return b != null ? b instanceof clazz || b.constructor === clazz : false;
    },
    owneryQuery,
    options
  );


export const $size = (
  params: number,
  ownerQuery: Query<any>,
  options: Options
) => new $Size(params, ownerQuery, options, "$size");
export const $options = () => null;
export const $where = (
  params: string | Function,
  ownerQuery: Query<any>,
  options: Options
) => {
  let test: any;

  if (isFunction(params)) {
    test = params;
  } else if (!process.env.CSP_ENABLED) {
    test = new Function("obj", "return " + params);
  } else {
    throw new Error(
      `In CSP mode, sift does not support strings in "$where" condition`
    );
  }

  return new EqualsOperation((b: any) => test.bind(b)(b), ownerQuery, options);
};
