import { Operator } from '../types/Operator'
import { extendCase } from '../utils/operator'

export const binaryOperatorSynonyms: Operator[] = extendCase([
  {
    label: 'in between',
    field: 'between',
    synonyms: ['ibt', 'is between', 'between'],
    cefTypes: ['int', 'long', 'float', 'bin16'],
    exactType: true
  }, {
    label: 'is not between',
    field: 'not between',
    synonyms: ['nibt', 'not in between', 'not between'],
    cefTypes: ['int', 'long', 'float', 'bin16'],
    exactType: true
  }
])