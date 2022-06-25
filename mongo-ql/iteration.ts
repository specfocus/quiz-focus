import { AsyncIteration as SimpleAsyncIteration } from '@specfocus/spec-focus/many/iteration';
import sift from 'sift';
import { Query } from './query';

export const join = async <T>(promises: Promise<T>[]): Promise<T[]> => {
  const result: T[] = [];
  for await (const val of promises) {
    result.push(val);
  }
  return result;
};
export const unique = <T>(val: T, index: number, arr: T[]) => arr.indexOf(val) === index;
export const distinct = <T>(arr: T[]): T[] => arr.filter(unique);
export const array = async <T>(
  iterable: Promise<AsyncIterable<T> | AsyncIterator<T>>,
  filter?: Query<T>
) => new AsyncIteration<T>(await iterable).array(filter);
export const find = async <T>(
  iterable: Promise<AsyncIterable<T> | AsyncIterator<T>>,
  query: Query<T>
) => new AsyncIteration<T>(await iterable).find(query);
export const first = async <T>(
  iterable: Promise<AsyncIterable<T> | AsyncIterator<T>>
) => new AsyncIteration<T>(await iterable).first();
export const last = async <T>(
  iterable: Promise<AsyncIterable<T> | AsyncIterator<T>>
) => new AsyncIteration<T>(await iterable).last();
export const skip = async <T>(
  iterable: Promise<AsyncIterable<T> | AsyncIterator<T>>,
  count: number
) => new AsyncIteration<T>(await iterable).skip(count);
export const take = async <T>(
  iterable: Promise<AsyncIterable<T> | AsyncIterator<T>>,
  count: number,
  filter?: Query<T>
) => new AsyncIteration<T>(await iterable).take(count, filter);

/** TODO: extend from 'spec-focus/iteration */
export class AsyncIteration<T> extends SimpleAsyncIteration<T> {
  constructor(asyncIterable: AsyncIterable<T> | AsyncIterator<T>) {
    super(asyncIterable);
  }

  async array(filter?: Query<T>): Promise<T[]> {
    // @ts-ignorex
    const test = sift(filter || {});
    const result: any = [];
    for (; ;) {
      const { done, value } = await super.asyncIterator.next();

      if (done) {
        break;
      }

      // @ts-ignore
      if (!filter || test(value)) {
        result.push(value);
      }
    }
    return result;
  }

  iterable(filter?: Query<T>): AsyncIterable<T> {
    // @ts-ignore
    const test = sift(filter || {});
    async function* make(asyncIterator: AsyncIterator<T>): AsyncGenerator<T> {
      for (; ;) {
        const { done, value } = await asyncIterator.next();

        if (done) {
          break;
        }

        // @ts-ignore
        if (!filter || test(value)) {
          yield value;
        }
      }
    }
    return make(super.asyncIterator);
  }

  async find(query: Query<T>): Promise<T | undefined> {
    // @ts-ignore
    const test = sift(query);
    let result: T | undefined;
    for (; ;) {
      const { done, value } = await super.asyncIterator.next();

      if (done) {
        break;
      }
      // @ts-ignore
      if (test(value)) {
        result = value;
        break;
      }
    }

    return result;
  }

  async first(): Promise<T | undefined> {
    const { done, value } = await super.asyncIterator.next();

    if (done) {
      return;
    }

    return value;
  }

  async last(): Promise<T | undefined> {
    let result: T | undefined;
    for (; ;) {
      const { done, value } = await super.asyncIterator.next();

      if (done) {
        break;
      }

      result = value;
    }
    return result;
  }

  async next(): Promise<T | undefined> {
    const { done, value } = await super.asyncIterator.next();

    if (done) {
      return;
    }

    return value;
  }

  async skip(count: number): Promise<AsyncIteration<T>> {
    for (let i = 0; i < count; i++) {
      const { done, value } = await super.asyncIterator.next();

      if (done) {
        break;
      }
    }
    return this;
  }

  async take(count: number, filter?: Query<T>): Promise<T[]> {
    // @ts-ignore
    const test = sift(filter || {});
    const result: any[] = [];
    for (let i = 0; i < count;) {
      const { done, value } = await super.asyncIterator.next();

      if (done) {
        break;
      }

      // @ts-ignore
      if (!filter || test(value)) {
        result.push(value);
        i++;
      }
    }
    return result;
  }
}
