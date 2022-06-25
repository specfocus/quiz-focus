import { addToTrie, findByPrefixInTrie } from '../utils/trie'

export class ValueTrie {
  addToValuesTrie(synonyms) {
    for (const column of synonyms) {
      if (column.values) {
        for (const value of column.values) {
          addToTrie(this, value.toLowerCase(), { column, value })
        }
      }
    }
  }

  findByValuePrefix(valuePrefix) {
    return findByPrefixInTrie(this, valuePrefix)
  }
}