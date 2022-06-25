import { Operator } from '../types/Operator'
import { extendCase } from '../utils/operator'

export const logicSynonyms: Operator[] = extendCase([
  {
    label: 'and',
    field: 'and',
    synonyms: ['&&', '&', 'connecting to', 'with', 'for']
  },
  {
    label: 'or',
    field: 'or',
    synonyms: ['||', '|']
  }
])