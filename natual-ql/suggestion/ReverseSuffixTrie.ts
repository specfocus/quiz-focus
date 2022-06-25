import { TRIE_VALUE_INDEX } from '../constants/trie'
import { isAlphaNum } from '../validators/token'
import { applyToSynonym } from '../utils/operator'

export class ReverseSuffixTrie {
  constructor(index, value) {
    this[index] = value
  }

  addToReverseSuffixTrie(synonyms) {
    for (const synonym of synonyms) {
      applyToSynonym(synonym, (s) => {
        for (let j = 1; j < s.length; j++) {
          let node = this
          for (let i = j - 1; i >= 0; i--) {
            const ch = s.charAt(i)
            if (!node[ch]) {
              node[ch] = { [TRIE_VALUE_INDEX]: [] }
            }
            node = node[ch]
          }
          if (isAlphaNum(s.charAt(0))) {
            if (!node[' ']) {
              node[' '] = { [TRIE_VALUE_INDEX]: [] }
            }
            node = node[' ']
          }
          node[TRIE_VALUE_INDEX].push(synonym.label)
        }
      })
    }
  }

  findSuffixes(s) {
    const result = []
    const resultSet = {}
    let node = this
    for (let i = s.length - 1; i >= 0; i--) {
      const ch = s.charAt(i)
      const newNode = node[ch]
      if (!newNode) break
      node = newNode
      const position = ch === ' ' ? i + 1 : i
      for (const label of node[TRIE_VALUE_INDEX]) {
        if (typeof resultSet[label] !== 'number') {
          resultSet[label] = position
          result.push({ label, position })
        }
      }
    }
    return result
  }
}