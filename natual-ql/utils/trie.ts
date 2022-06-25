import { TRIE_VALUE_INDEX } from '../constants/trie'

export const addToTrie = (trie, key, value) => {
  let node = trie
  for (const ch of key) {
    if (!node[ch]) {
      node[ch] = { [TRIE_VALUE_INDEX]: [] }
    }
    node = node[ch]
  }
  node[TRIE_VALUE_INDEX].push(value)
}

export const findByPrefixInTrie = (trie, key) => {
  if (typeof key !== 'string') {
    return []
  }
  let node = trie
  for (const ch of key.toLowerCase()) {
    if (!node[ch]) {
      return []
    }
    node = node[ch]
  }
  const result = []
  const resultSet = new Set()
  function rec(child) {
    for (const childKey of Object.keys(child)) {
      if (childKey === TRIE_VALUE_INDEX) {
        for (const value of child[childKey]) {
          if (!resultSet.has(value)) {
            result.push(value)
            resultSet.add(value)
          }
        }
      } else if (childKey.length === 1) {
        rec(child[childKey])
      }
    }
  }
  if (node) {
    rec(node)
  }
  return result
}