import {
  createTester, NamedBaseOperation, Options, Query, Tester
} from "../core";

export class $Ne extends NamedBaseOperation<any> {
  private _test!: Tester;
  init() {
    this._test = createTester(this.params, this.options.compare);
  }
  reset() {
    super.reset();
    this.keep = true;
  }
  next(item: any) {
    if (this._test(item)) {
      this.done = true;
      this.keep = false;
    }
  }
}

export const $ne = (
  params: any,
  owneryQuery: Query<any>,
  options: Options,
  name: string
) => new $Ne(params, owneryQuery, options, name);