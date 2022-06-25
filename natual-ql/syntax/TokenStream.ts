import { tokenEOF, tokenERROR, tokenTEXT } from '../constants/syntax'
import { TRIE_VALUE_INDEX } from '../constants/trie'
import { Context, contextDefault } from './Context'
import { isAlphaNum, isWS } from '../validators/token'

export class TokenStream {
  private _contexts: Context[]
  private _input
  private _maxPos
  private _prefetched
  private _prefetchedContext
  private _pos

  constructor(contexts: Context[], input: string) {
    this._contexts = contexts
    this._input = input
    this._maxPos = input.length
    this._prefetched = []
    this._prefetchedContext = contextDefault
    this._pos = 0
  }

  _skipWS(position) {
    let p = position
    while (p < this._maxPos) {
      if (!isWS(this._input[p])) {
        break
      }
      p++
    }
    return p
  }

  _makeToken(s, e, t) {
    this._pos = e
    return {
      start: s,
      end: e,
      type: t,
      getText: () => this._input.substring(s, e),
    }
  }

  _readText(context, position) {
    let p = position
    let ch = this._input[p]
    const s = p

    if (ch === "'" || ch === '"') {
      p++
      while (p < this._maxPos && this._input[p] !== ch) {
        p++
      }

      if (p === this._maxPos) {
        return this._makeToken(s, s + 1, tokenERROR)
      }

      p++
      return this._makeToken(s, p, tokenTEXT)
    }

    let nodes = []
    let newNodes = []
    let prevWS = true

    let candidate
    while (p < this._maxPos) {
      ch = this._input[p]

      for (const node of nodes) {
        if (node[ch]) {
          newNodes.push(node[ch])
        }
      }

      if (candidate !== undefined && newNodes.length === 0) {
        break
      }

      const alphaNum = isAlphaNum(ch)
      if ((!alphaNum || prevWS) && this._contexts[context][ch]) {
        newNodes.push(this._contexts[context][ch])
      }
      const tmp = nodes
      nodes = newNodes
      newNodes = tmp
      newNodes.length = 0

      for (const node of nodes) {
        if (
          node[TRIE_VALUE_INDEX] !== undefined &&
          !(alphaNum && p + 1 < this._maxPos && isAlphaNum(this._input[p + 1]))
        ) {
          const q = p - node[TRIE_VALUE_INDEX].token.length
          if (candidate === undefined || candidate.end < p) {
            candidate = { start: q, end: p }
          }
        }
      }

      p++
      prevWS = isWS(ch)
    }

    if (candidate !== undefined) {
      let q = candidate.start
      while (q > 0 && isWS(this._input[q])) {
        q--
      }
      return this._makeToken(s, q + 1, tokenTEXT)
    }

    while (p > 1 && isWS(this._input[p - 1])) {
      p--
    }
    return this._makeToken(s, p, tokenTEXT)
  }

  _readToken(context) {
    let p = this._pos

    const s = this._skipWS(p)

    if (s === this._maxPos) {
      return this._makeToken(s, s, tokenEOF)
    }

    p = s
    let q
    let t

    let node = this._contexts[context]
    while (p < this._maxPos) {
      const ch = this._input[p]
      node = node[ch]
      if (!node) break

      p++

      if (
        node[TRIE_VALUE_INDEX] !== undefined &&
        !(p < this._maxPos && isAlphaNum(ch) && isAlphaNum(this._input[p]))
      ) {
        q = p
        t = node[TRIE_VALUE_INDEX].type
      }
    }

    if (t !== undefined) {
      this._pos = q
      return this._makeToken(s, q, t)
    }

    return this._readText(context, s)
  }

  advance(context = contextDefault) {
    if (this._prefetched.length > 0) {
      if (this._prefetchedContext === context) {
        return this._prefetched.shift()
      }

      this.backtrack(this._prefetched[0])
    }
    return this._readToken(context)
  }

  lookahead(n = 1, context = contextDefault) {
    if (this._prefetchedContext !== context && this._prefetched.length > 0) {
      this.backtrack(this._prefetched[0])
      this._prefetched.splice(0, this._prefetched.length)
    }
    this._prefetchedContext = context

    if (
      this._prefetched.length > 0 &&
      n >= this._prefetched.length &&
      this._prefetched[this._prefetched.length - 1].type === tokenEOF
    ) {
      return this._prefetched[this._prefetched.length - 1]
    }

    const shift = n - this._prefetched.length
    for (let i = 0; i < shift; i++) {
      const token = this._readToken(this._prefetchedContext)
      this._prefetched.push(token)
      if (token.type === tokenEOF) {
        return token
      }
    }
    return this._prefetched[n - 1]
  }

  backtrack(invalidToken) {
    this._prefetched.splice(0, this._prefetched.length)
    this._prefetchedContext = contextDefault
    let p = invalidToken.start - 1
    while (p > 0 && isWS(this._input[p])) {
      p--
    }
    this._pos = p + 1
  }
}
