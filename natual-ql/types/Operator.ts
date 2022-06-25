export interface Operator {
  label: string
  field: string
  synonyms?: string[]
  cefTypes?: string[]
  exactType?: true
  dbOperation?: 'inner' | 'left'
  isGroupname?: true
}