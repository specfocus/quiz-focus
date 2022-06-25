import { Operator } from '../types/Operator'

export const applyToSynonym = (op: Operator, f: (syn: string) => void) => {
  f(op.field)
  f(op.label)
  if (op.synonyms) op.synonyms.forEach(f)
}

export const testSynonym = (op: any, fn: (syn: string) => boolean) =>
  fn(op.field) || fn(op.label) || (op.synonyms && op.synonyms.some(fn))

export const extendCase = (operators: Operator[]): Operator[] => {
  for (const op of operators) {
    const upper = op.label.toUpperCase()
    if (op.synonyms === undefined) op.synonyms = []
    if (op.synonyms.indexOf(upper) < 0) {
      // add various case options to synonyms
      const copy = op.synonyms.slice(0)
      copy.push(op.label)
      copy.push(op.field)
      op.synonyms.push(upper)
      for (const syn of copy) {
        // IS EQUAL
        op.synonyms.push(syn.toUpperCase())
        // Is equal
        op.synonyms.push(syn[0].toUpperCase() + syn.substring(1))
        // Is Equal
        op.synonyms.push(syn.replace(
          /\S+\s*/g,
          m => (m ? m[0].toUpperCase() + m.substring(1) : m)))
      }
    }
  }
  return operators
}

export const createSynonymMap = (operator, lowercase = false) => {
  const result = {}
  for (const op of operator) {
    applyToSynonym(op, syn => {
      result[lowercase ? syn.toLowerCase() : syn] = op
    })
  }
  return result
}

export const createOperatorCefTypeMap = (...operatorsList: Operator[][]): { [key: string]: string[] } => {
  const result = {}
  for (const operators of operatorsList) {
    for (const op of operators) {
      result[op.field] = op.cefTypes
    }
  }
  return result
}
