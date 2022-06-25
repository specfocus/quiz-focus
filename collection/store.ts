import type { Shape } from '@specfocus/spec-focus/shapes';

export type Document = Shape;

export interface Collection {
  records: Record<number, Document>;
  version: number;
}

export interface CollectionStore {
  [collectionName: string]: Collection;
}