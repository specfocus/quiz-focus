import { applyToSynonym } from '../utils/operator'
import { columnComparer } from '../utils/schema'
import { addToTrie, findByPrefixInTrie } from '../utils/trie'

export class WordPrefixTrie {
  constructor(public prefix: {}, public suffix = undefined) {}

  addToWordPrefixTries(synonyms) {
    for (const synonym of synonyms) {
      applyToSynonym(synonym, s => {
        const lower = s.toLowerCase()
        addToTrie(this.prefix, lower, synonym)
        if (this.suffix) {
          for (let start = 0; start < lower.length; start++) {
            if (lower.charAt(start) === ' ') {
              addToTrie(this.suffix, lower.substring(start + 1), synonym)
            }
          }
        }
      })
    }
  }

  findByPrefix(s) {
    const result1 = findByPrefixInTrie(this.prefix, s)
    result1.sort(columnComparer)
    if (!this.suffix) {
      return result1
    }
    const resultSet = new Set(result1)
    const result2 = findByPrefixInTrie(this.suffix, s).filter(
      r => !resultSet.has(r),
    )
    result2.sort(columnComparer)
    return result1.concat(result2)
  }
}
