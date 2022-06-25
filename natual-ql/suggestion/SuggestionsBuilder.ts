import { TRIE_VALUE_INDEX } from '../constants/trie'
import { Schema } from '../schema/Schema'
import { applyToSynonym, testSynonym } from '../utils/operator'
import { isGroupname, sortColumns } from '../utils/schema'
import { merge } from '../utils/suggestion'
import { getValueTypesOfTag } from '../utils/syntax'
import { isAlphaNum } from '../validators/token'
import { ReverseSuffixTrie } from './ReverseSuffixTrie'
import { ValueTrie } from './ValueTrie'
import { WordPrefixTrie } from './WordPrefixTrie'
import { TagTypeEnum } from '../syntax/TagTypeEnum'

export default class SuggestionsBuilder {
  private _database
  private _operatorsIndex
  private _joinIndex
  private _logicIndex
  private _columnNamesIndex
  private _groupnamesIndex
  private _categoryValuesIndex

  private _decorators

  constructor(database: Schema) {
    this._database = database
    this._operatorsIndex = new ReverseSuffixTrie(TRIE_VALUE_INDEX, [])
    this._operatorsIndex.addToReverseSuffixTrie(database.filterUnaryOperators())
    this._operatorsIndex.addToReverseSuffixTrie(
      database.filterBinaryOperators(),
    )

    this._joinIndex = new ReverseSuffixTrie(TRIE_VALUE_INDEX, [])
    this._joinIndex.addToReverseSuffixTrie(database.filterJoin())

    this._logicIndex = new ReverseSuffixTrie(TRIE_VALUE_INDEX, [])
    this._logicIndex.addToReverseSuffixTrie(database.filterLogic())

    this._columnNamesIndex = new WordPrefixTrie({}, {})
    this._columnNamesIndex.addToWordPrefixTries(database.filterColumns())

    this._groupnamesIndex = new WordPrefixTrie({})
    this._groupnamesIndex.addToWordPrefixTries(database.filterGroupnames())

    this._categoryValuesIndex = new ValueTrie()
    this._categoryValuesIndex.addToValuesTrie(database.filterColumns())

    this._decorators = {}
    const addDecorator = (s, ss) => {
      if (s.field !== ss && isAlphaNum(ss)) this._decorators[ss] = s.field
    }
    database
      .filterUnaryOperators()
      .forEach(s => applyToSynonym(s, ss => addDecorator(s, ss)))
  }

  _enrich(result, searchData) {
    if (!result.failed) {
      for (const suggestion of result.options) {
        suggestion.decorator = this._decorators[suggestion.text]
        if (suggestion.text.charAt(0) === '#') {
          const name = suggestion.text.substring(1)
          const search = searchData.findSearch(name)
          if (search && search.preset) {
            suggestion.decorator = 'preset'
          }
        }
      }
    }
    return result
  }

  _build(tree, searchData, tagId, tagOffset) {
    const makeSuggestion = (node, text, replaceText, caretOffset = 0) => ({
      text,
      getUpdate() {
        const position = node.getStart() + replaceText.length - caretOffset
        const newText = tree.replaceText(node, replaceText)
        return { newText, position }
      },
    })

    const database = this._database
    const columnsAndGroupnames = () =>
      database.filterColumns().concat(database.filterGroupnames())
    const lookupColumns = (f = () => true) =>
      database.filterColumns(c => c.tableName).filter(f)
    const columnOrGroupnameText = s =>
      isGroupname(s) ? `any ${s.label}` : s.label
    const allColumnsAndGroupnames = () =>
      sortColumns(columnsAndGroupnames()).map(columnOrGroupnameText)
    const allLookupColumns = f =>
      sortColumns(lookupColumns(f)).map(columnOrGroupnameText)

    const tag = tagId === -1 ? tree.findLastTag() : tree.getTag(tagId)

    if (!tag) {
      if (tagId === -1) {
        const all = allColumnsAndGroupnames()
        return { options: all.map(c => makeSuggestion(tree, `${c}`, ` ${c} `)) }
      }
      return { failed: true }
    }

    const tagType = tag.getType()
    const tuple = tag.getParent()

    const tagText = tag.getText()
    const tagName = tag.getName()
    const escapedText = tag.getEscapedText()
    const tagTextBeforeCaret = tagText.substring(0, tagOffset)
    const tagTextAfterCaret = tagText.substring(tagOffset)
    const escapedTextBeforeCaret = escapedText.substring(
      0,
      tagOffset - (tagText === escapedText ? 0 : 1),
    )
    //  const escapedTextAfterCaret =
    //    escapedText.substring(tagOffset - (tagText === escapedText ? 0 : 1))

    const caretAtSpaceAfterTag = tagOffset > tagText.length
    const spaceBeforeCaret =
      caretAtSpaceAfterTag ||
      (tagTextBeforeCaret.length > 0 &&
        tagTextBeforeCaret[tagTextBeforeCaret.length - 1] === ' ')

    const replacements = (list, clearAfterCaret = true) => ({
      options: list.map(text =>
        makeSuggestion(
          tag,
          `${text}`,
          clearAfterCaret ? ` ${text} ` : ` ${text} ${tagTextAfterCaret}`,
          clearAfterCaret ? 0 : tagTextAfterCaret.length,
        ),
      ),
    })

    const insertions = list => ({
      options: list.map(text =>
        makeSuggestion(
          tag,
          `${text}`,
          `${tagTextBeforeCaret} ${text} ${tagTextAfterCaret}`,
          tagTextAfterCaret.length,
        ),
      ),
    })

    const completeKeyword = (allowReplace, trie) => {
      const text = ` ${tagTextBeforeCaret}`
      const completion = trie.findSuffixes(text)
      return {
        options: completion
          .filter(kp => allowReplace || kp.position >= 2)
          .map(kp =>
            makeSuggestion(
              tag,
              kp.label,
              `${text.substring(0, kp.position)}${
                kp.label
              } ${tagTextAfterCaret}`,
            ),
          ),
      }
    }

    const completeColumn = () => {
      const nextTag = tag.getNext()
      const previousTag = tag.getPrevious()
      const prevPrevTag = previousTag ? previousTag.getPrevious() : undefined
      const postColumnTags = [
        TagTypeEnum.COMMA,
        TagTypeEnum.OPERATOR,
        TagTypeEnum.RANGEOPERATOR,
      ]
      if (
        previousTag &&
        previousTag.getType() === TagTypeEnum.JOIN &&
        prevPrevTag &&
        prevPrevTag.getType() === TagTypeEnum.COLUMN
      ) {
        // col in list lookup_col : return lookupcols only
        const lookupCols = this._columnNamesIndex
          .findByPrefix(escapedTextBeforeCaret)
          .filter(c => c.tableName)
          // lookup cols that match value_type of LHS column
          .filter(
            c =>
              database.findColumn(prevPrevTag.getName()).value_type ===
              c.value_type,
          )
          .map(c => c.label)
        return replacements(lookupCols, false)
      }
      const noEquals =
        tagTextAfterCaret.length === 0 &&
        nextTag &&
        postColumnTags.includes(nextTag.getType())

      let filtered = this._columnNamesIndex.findByPrefix(escapedTextBeforeCaret)
      if (noEquals) {
        const lowercase = escapedTextBeforeCaret.toLowerCase()
        filtered = filtered.filter(
          s => !testSynonym(s, ss => ss.toLowerCase() === lowercase),
        )
      }
      return replacements(
        filtered.map(s => (noEquals ? s.label : `${s.label} =`)),
        false,
      )
    }

    const insertLogic = () =>
      spaceBeforeCaret
        ? insertions(
            database.filterLogic(s => s.field !== tagName).map(s => s.label),
          )
        : { options: [] }

    const defaultReplacements = synonyms =>
      replacements(synonyms.filter(s => s.field !== tagName).map(s => s.label))

    function defaultInsertions(...synonymsList) {
      const result = []
      for (const synonyms of synonymsList) {
        const filtered = synonyms
          .filter(s => s.field !== tagName)
          .map(s => s.label)
        result.push(...insertions(filtered).options)
      }
      return { options: result }
    }

    const values = tuple.filter(TagTypeEnum.TEXT)
    const columns = tuple.filter(TagTypeEnum.COLUMN)
    const columnNames = columns.map(c => c.getName())
    const hasGroupname = tuple.find(TagTypeEnum.GROUPNAME) !== undefined
    const operator = tuple.find(TagTypeEnum.OPERATOR)

    const assignments = list => {
      const prefix = tuple
        .getText()
        .substring(0, tag.getStart() - tuple.getStart())
      return {
        options: list.map(text =>
          makeSuggestion(
            tuple,
            operator
              ? `${text} ${prefix}${tagTextBeforeCaret}`
              : `${text} = ${prefix}${tagTextBeforeCaret}`,
            operator
              ? `${text} ${prefix}${tagTextBeforeCaret} ${tagTextAfterCaret}`
              : ` ${text} = ${prefix}${tagTextBeforeCaret} ${tagTextAfterCaret}`,
            tagTextAfterCaret.length,
          ),
        ),
      }
    }

    const applyToColumnsOfValueType = (actions: (list: any[]) => any, overrideValueTypes?: any) => {
      let shared = overrideValueTypes
      if (!shared) {
        for (const value of values) {
          const valueTypes = getValueTypesOfTag(value, database)
          shared = shared
            ? shared.filter(vt => valueTypes.includes(vt))
            : valueTypes
        }
      }
      if (shared) {
        let filtered = database
          .filterColumns(
            // TODO: should we check undefined for value_type?
            entry =>
              shared.includes(entry.value_type) &&
              !columnNames.includes(entry.field),
          )
          .concat(
            database.filterGroupnames(entry => shared.includes(entry.field)),
          )
        filtered = sortColumns(filtered)
        if (overrideValueTypes) {
          const compare = (x, y) => {
            const getVT = z => (isGroupname(z) ? z.field : z.value_type)
            const vtX = getVT(x.val)
            const vtY = getVT(y.val)
            if (vtX === vtY) {
              return x.idx - y.idx
            }
            return (
              overrideValueTypes.indexOf(vtX) - overrideValueTypes.indexOf(vtY)
            )
          }
          filtered = filtered
            .map((v, i) => ({ val: v, idx: i }))
            .sort(compare)
            .map(vi => vi.val)
        }
        return actions(filtered.map(columnOrGroupnameText))
      }
      return { options: [] }
    }

    const applyToColumnsOfCategoryValue = actions => {
      const filtered = database.filterColumns(
        cs =>
          cs.values &&
          values.every(v => v.hasFlag(cs.field)) &&
          !columnNames.includes(cs.field),
      )
      return actions(sortColumns(filtered).map(s => s.label))
    }

    const applyToCategoryValue = actions => {
      const result = []
      const filtered = database.filterColumns(
        cv => cv.values && tag.hasFlag(cv.field),
      )
      for (const s of sortColumns(filtered)) {
        result.push(...actions(s.values.filter(v => v !== escapedText)).options)
      }
      return { options: result }
    }

    const insertValueOfCategoryType = () => {
      const result = []
      const filtered = database.filterColumns(cs =>
        columnNames.includes(cs.field),
      )
      for (const cs of sortColumns(filtered)) {
        if (cs.values) {
          const valuesToAdd = cs.values.filter(
            v => !values.find(val => val.getText() === v),
          )
          result.push(...insertions(valuesToAdd).options)
        }
      }
      return { options: result }
    }

    const insertMissingEquals = afterTag => {
      const result =
        !operator && values.length > 0
          ? [
              makeSuggestion(
                tag,
                '=',
                afterTag ? `${tagText} =` : `= ${tagText}`,
                0,
              ),
            ]
          : []
      return { options: result }
    }

    const replaceGroupWithColumn = (groupTag, groupnameTag) => {
      const prefix = tuple
        .getText()
        .substring(0, groupTag.getStart() - tuple.getStart())
      const postfix = tuple
        .getText()
        .substring(groupnameTag.getEnd() - tuple.getStart())
      const excludedSuggestion = `any ${groupnameTag.getName()}`
      return applyToColumnsOfValueType(list => ({
        options: list
          .filter(
            text => text !== excludedSuggestion, // TODO: this is unsafe way of filtering
          )
          .map(text =>
            makeSuggestion(
              tuple,
              text,
              `${prefix}${text}${postfix}`,
              postfix.length,
            ),
          ),
      }))
    }

    let resultObj
    switch (tagType) {
      case TagTypeEnum.COLUMN: {
        const previousTag = tag.getPrevious()
        const valueOpColumn =
          values.length > 0 && values[0].getStart() < tag.getStart()
        const demoteCompletion =
          database.findColumn(tagText) ||
          (tagTextAfterCaret.length > 0 &&
            !database.findColumn(tagTextAfterCaret.trim()))

        if (caretAtSpaceAfterTag && valueOpColumn) {
          return insertLogic()
        }

        const columnCompletion = valueOpColumn ? undefined : completeColumn()

        if (previousTag && previousTag.getType() === TagTypeEnum.JOIN) {
          return columnCompletion
        }

        const combinedResult = () => {
          // TODO: column completion can have the same items as other suggestions
          let result = demoteCompletion
            ? merge(resultObj, columnCompletion)
            : merge(columnCompletion, resultObj)
          if (valueOpColumn) {
            result = merge(insertLogic(), result)
          }
          result = merge(insertMissingEquals(true), result)
          return result
        }

        resultObj = applyToColumnsOfValueType(replacements)
        if (resultObj.options.length > 0) {
          return combinedResult()
        }

        resultObj = applyToColumnsOfCategoryValue(replacements)
        if (resultObj.options.length > 0) {
          return combinedResult()
        }

        resultObj = defaultReplacements(sortColumns(database.filterColumns()))
        return combinedResult()
      }
      case TagTypeEnum.TEXT: {
        const completeCategoryValue = () => {
          const result = []
          const filtered = database.filterColumns(
            cv => cv.values && columnNames.includes(cv.field),
          )
          for (const cv of sortColumns(filtered)) {
            const matching = cv.values.filter(val =>
              val.includes(escapedTextBeforeCaret),
            )
            result.push(...replacements(matching, false).options)
          }
          return { options: result }
        }

        const replaceWithKeywords = (addJoins?: any) => {
          const filter = s => testSynonym(s, ss => ss.indexOf(tagText) === 0)
          const result = merge(
            replacements(
              database.filterUnaryOperators(filter).map(s => s.label),
            ),
            replacements(
              database.filterBinaryOperators(filter).map(s => s.label),
            ),
          )
          return addJoins
            ? merge(
                replacements(database.filterJoin(filter).map(s => s.label)),
                result,
              )
            : result
        }

        const replaceWithColumn = () => {
          const previous = tag.getPrevious()
          const candidates = this._columnNamesIndex.findByPrefix(
            `${previous.getText()} ${tagTextBeforeCaret}`,
          )
          const tupleText = tuple.getText()
          const prefix = tupleText.substring(0, previous.getStart())
          const caretOffset = tagTextAfterCaret.length
          const postfix = tupleText.substring(
            tag.getEnd() - caretOffset - tuple.getStart(),
          )
          return {
            options: candidates.map(s =>
              makeSuggestion(
                tuple,
                `${s.label} =`,
                `${prefix} ${s.label} = ${postfix}`,
                caretOffset,
              ),
            ),
          }
        }

        const completeReference = hasHash => {
          const matchText = tagTextBeforeCaret
            .substring(hasHash ? 1 : 0)
            .toLowerCase()
          const name = searchData.getSearchName().toLowerCase()
          const matching = searchData.filterSearches(s => {
            const lowercase = s.name.toLowerCase()
            return lowercase !== name && lowercase.indexOf(matchText) === 0
          })
          return replacements(matching.map(s => `#${s.name}`).sort(), false)
        }

        const replaceReference = hasHash => {
          const filter = [
            searchData.getSearchName().toLowerCase(),
            tagText.substring(hasHash ? 1 : 0).toLowerCase(),
          ]
          const filtered = searchData.filterSearches(
            s => !filter.includes(s.name.toLowerCase()),
          )
          return replacements(filtered.map(s => `#${s.name}`).sort(), true)
        }

        const completeAndAssignCategoryValues = () => {
          const result = []
          if (escapedText.length >= 3 && values.length === 1) {
            for (const pair of this._categoryValuesIndex.findByValuePrefix(
              escapedText,
            )) {
              const { column, value } = pair
              const label = column.label
              result.push(
                makeSuggestion(
                  tuple,
                  `${label} = ${value}`,
                  ` ${label} = ${value} `,
                ),
              )
            }
          }
          return { options: result }
        }

        let partialResultObj
        const replaceLogicForRangeOperator = () => {
          if (!tuple.find(TagTypeEnum.AND2)) {
            // TODO: check to the left
            partialResultObj.options = partialResultObj.options.filter(
              suggestion => suggestion.text === 'and', // TODO: better filtering
            )
          }
        }

        if (columns.length > 0 || hasGroupname) {
          const columnOrGroupname =
            columns.length > 0 ? columns[0] : tuple.find(TagTypeEnum.GROUPNAME)
          const columnOpValue = columnOrGroupname.getStart() < tag.getStart()
          const previousTag = tag.getPrevious()
          const columnValue =
            previousTag &&
            [TagTypeEnum.COLUMN, TagTypeEnum.GROUPNAME].includes(
              previousTag.getType(),
            )

          if (columnValue) {
            resultObj = replaceWithColumn()
            if (resultObj.options.length > 0) {
              return resultObj // TODO: should we add other results?
            }
          }

          partialResultObj = insertLogic()
          replaceLogicForRangeOperator()
          if (columnValue) {
            partialResultObj = merge(
              insertMissingEquals(false),
              partialResultObj,
            )
          }

          if (caretAtSpaceAfterTag && columnOpValue) {
            if (!operator) {
              partialResultObj = merge(
                replaceWithKeywords(true),
                partialResultObj,
              )
            }
            return partialResultObj
          }

          resultObj = applyToCategoryValue(replacements)
          if (resultObj.options.length > 0) {
            return merge(partialResultObj, resultObj)
          }

          if (columnOpValue && operator) {
            partialResultObj = completeKeyword(false, this._logicIndex)
            if (partialResultObj.options.length === 0) {
              partialResultObj = insertLogic()
            }
          } else if (!tuple.find(TagTypeEnum.RANGEOPERATOR)) {
            // can suggest JOIN if COMMA and GROUP are absent
            if (
              !tuple.find(TagTypeEnum.GROUP) &&
              !tuple.find(TagTypeEnum.COMMA)
            ) {
              // TODO: completion for 'any ip eq|' works
              // completion for 'any ip 1.1.1.1 an|' does not
              // suggest both operators and join tokens
              partialResultObj = merge(
                completeKeyword(true, this._operatorsIndex),
                completeKeyword(true, this._joinIndex),
              )
              if (columnValue && partialResultObj.options.length === 0) {
                partialResultObj = insertMissingEquals(false)
              }
            } else {
              // TODO: completion for 'any ip eq|' works
              // completion for 'any ip 1.1.1.1 an|' does not
              partialResultObj = completeKeyword(true, this._operatorsIndex)
              if (columnValue && partialResultObj.options.length === 0) {
                partialResultObj = insertMissingEquals(false)
              }
            }
          } else {
            partialResultObj = completeKeyword(false, this._logicIndex)
            replaceLogicForRangeOperator()
          }

          resultObj = completeCategoryValue()
          if (resultObj.options.length > 0) {
            return merge(resultObj, partialResultObj)
          }

          const previous = tag.getPrevious()
          if (previous && previous.getType() === TagTypeEnum.GROUPNAME) {
            resultObj = replaceWithKeywords()
            if (resultObj.options.length > 0) {
              return resultObj
            }
          }

          return partialResultObj
        }

        if (tuple.find(TagTypeEnum.GROUP)) {
          return { options: [] } // TODO: provide suggestions
        }

        // no columns
        const columnsToComplete = completeColumn()

        if (caretAtSpaceAfterTag && database.findColumn(tagText)) {
          const operatorsList = [
            database.filterUnaryOperators(),
            database.filterBinaryOperators(),
          ]
          const previousTag = tag.getPrevious()
          if (!previousTag || previousTag.getType() !== TagTypeEnum.COMMA) {
            operatorsList.push(database.filterJoin())
          }
          return merge(defaultInsertions(...operatorsList), columnsToComplete)
        }

        partialResultObj = merge(
          completeKeyword(true, this._operatorsIndex),
          columnsToComplete,
        )

        if (tagTextBeforeCaret.length > 0) {
          const found = searchData.findSearch(
            tagText.substring(tag.isReference ? 1 : 0),
          )
          if (tag.isReference) {
            if (found) {
              resultObj = replaceReference(true)
              if (caretAtSpaceAfterTag) {
                resultObj = merge(insertLogic(), resultObj)
              }
              if (resultObj.options.length > 0) {
                return tagTextAfterCaret.length > 0
                  ? resultObj
                  : merge(completeKeyword(false, this._logicIndex), resultObj)
              }
            } else {
              resultObj = merge(
                completeKeyword(false, this._logicIndex),
                completeReference(true),
              )
              if (resultObj.options.length > 0) {
                return resultObj
              }
            }
          } else {
            partialResultObj = merge(
              partialResultObj,
              found ? replaceReference(false) : completeReference(false),
            )
          }
        }

        resultObj = applyToColumnsOfValueType(assignments)
        if (resultObj.options.length > 0) {
          return merge(partialResultObj, resultObj)
        }

        resultObj = applyToColumnsOfCategoryValue(assignments)
        if (resultObj.options.length > 0) {
          return merge(partialResultObj, resultObj)
        }

        partialResultObj = merge(
          partialResultObj,
          completeAndAssignCategoryValues(),
        )
        // Uncomment below section to activate custom calculations
        /*
        if (!tag.isNone && !tag.getPrevious() && !tag.getNext() && tagText.match(/^[A-Z0-9]+$/i)) {
          partialResultObj = merge(partialResultObj, replacements([`${tagTextBeforeCaret} :=`]))
        }
        */
        // TODO: the following string arrays should reside somewhere else
        const valueTypes = tagText.includes('.')
          ? ['hostname', 'domain', 'username']
          : ['username', 'hostname', 'domain']
        partialResultObj = merge(
          partialResultObj,
          applyToColumnsOfValueType(assignments, valueTypes),
        )
        return partialResultObj
      }
      case TagTypeEnum.COMMA:
        // TODO: complete column lists without values
        // TODO: should also work with any and groupnames instead of columns
        if (tuple.find(TagTypeEnum.COLUMN) && tuple.find(TagTypeEnum.TEXT)) {
          const previous = tag.getPrevious()
          if (previous) {
            switch (previous.getType()) {
              case TagTypeEnum.COLUMN:
                resultObj = applyToColumnsOfValueType(insertions)
                if (resultObj.options.length > 0) {
                  return resultObj
                }

                resultObj = applyToColumnsOfCategoryValue(insertions)
                if (resultObj.options.length > 0) {
                  return resultObj
                }

                return insertions(allColumnsAndGroupnames())
              case TagTypeEnum.TEXT:
                return insertValueOfCategoryType()
              default:
            }
          }
        }
        return { options: [] }

      case TagTypeEnum.AND1:
        return caretAtSpaceAfterTag
          ? insertions(allColumnsAndGroupnames())
          : defaultReplacements(database.filterLogic())

      case TagTypeEnum.OPERATOR:
        if (caretAtSpaceAfterTag) {
          resultObj = insertValueOfCategoryType()
          if (resultObj.options.length > 0) {
            return resultObj
          }
          if (
            !hasGroupname &&
            columns.every(c => !database.findColumn(c.getName()))
          ) {
            // looks like "value = |"
            return insertions(allColumnsAndGroupnames())
          }
        }
        return defaultReplacements(database.filterUnaryOperators())

      case TagTypeEnum.JOIN:
        if (caretAtSpaceAfterTag) {
          const previousTag = tag.getPrevious()
          const isLhsValidColumn =
            previousTag &&
            previousTag.getType() === TagTypeEnum.COLUMN &&
            !previousTag.error
          if (isLhsValidColumn) {
            const colValType = database.findColumn(previousTag.getName())
              .value_type
            return insertions(
              allLookupColumns(c => c.value_type === colValType),
            )
          }
          return { failed: true }
        }
        return defaultReplacements(database.filterJoin())

      case TagTypeEnum.RANGEOPERATOR:
        if (caretAtSpaceAfterTag) {
          resultObj = insertValueOfCategoryType()
          if (resultObj.options.length > 0) {
            return resultObj
          }
        }
        return defaultReplacements(database.filterBinaryOperators())

      case TagTypeEnum.CALCFUNC:
        return defaultReplacements(database.filterCalculationFunctions())

      case TagTypeEnum.CALCOP:
        return defaultReplacements(database.filterCalculationOperators())

      case TagTypeEnum.GROUP: {
        if (caretAtSpaceAfterTag) {
          return defaultInsertions(database.filterGroupnames())
        }

        const groupnameTag = tag.getNext()
        resultObj = replaceGroupWithColumn(
          tag,
          !groupnameTag || groupnameTag.getType() !== TagTypeEnum.GROUPNAME
            ? tag
            : groupnameTag,
        )
        if (resultObj.options.length > 0) {
          return resultObj
        }

        return defaultReplacements(database.filterGroups())
      }
      case TagTypeEnum.GROUPNAME: {
        if (caretAtSpaceAfterTag) {
          // TODO: could filter by groupname value types
          return defaultInsertions(
            database.filterUnaryOperators(),
            database.filterBinaryOperators(),
          )
        }
        if (tag.isInvalid) {
          const groupnames = this._groupnamesIndex.findByPrefix(tagText)
          // TODO: should cover the following case: 'any i| 1.1.1.1'
          if (groupnames.length > 0) {
            return replacements(groupnames.map(s => s.label), false)
          }
        }
        const missingEquals =
          values.length > 0 && values[0].getStart() >= tag.getStart()
            ? insertMissingEquals(true)
            : undefined
        if (
          database.findColumn(tagTextAfterCaret) &&
          !database.findGroupname(tagText)
        ) {
          return merge(
            missingEquals,
            replacements(database.filterGroupnames().map(s => s.label), false),
          )
        }
        const groupTag = tag.getPrevious()
        resultObj = replaceGroupWithColumn(
          !groupTag || groupTag.getType() !== TagTypeEnum.GROUP
            ? tag
            : groupTag,
          tag,
        )
        if (resultObj.options.length > 0) {
          return merge(missingEquals, resultObj)
        }

        // TODO: works incorrectly if equals is missing: 'any id| aaa'
        return merge(
          missingEquals,
          defaultReplacements(database.filterGroupnames()),
        )
      }

      default:
        return { options: [] }
    }
  }

  suggestions(tree, searchData, tagId, tagOffset) {
    return this._enrich(
      this._build(tree, searchData, tagId, tagOffset),
      searchData,
    )
  }
}
