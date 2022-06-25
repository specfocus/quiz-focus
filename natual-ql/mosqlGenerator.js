import { TagTypeEnum, getTupleOperatorName } from './syntaxTree';
import { userInputAsValue } from '../state/field';
import { getPrefixBits, isIpAddressType } from '../state/IpAddress';

const bin16 = (obj) => ({ $bin16: obj });
const isBin16 = (obj) => !!obj.$bin16;
const deBin16 = (obj) => obj.$bin16 || obj;

// interface between the client and the api services:
const INDEX_TABLE = 'index';
const TOKEN_COLUMN = 'token';
const DOC_ID_COLUMN = 'doc_id';

const LOOKUP_COLUMNS_GROUPNAME = 'lookup';
const {
  AND1,
  TEXT,
  LPAREN,
  RPAREN,
  COLUMN,
  GROUP,
  GROUPNAME,
  JOIN,
  ASSIGN,
  CALCOP,
  CALCFUNC,
  ALIAS,
  COMMA,
  LPAREN2,
  RPAREN2
} = TagTypeEnum;

const optimum = prefer =>
 args => args[args.reduce((i, arg, j) => (i < 0 || prefer(arg, args[i]) ? j : i), -1)];

const optimumFunction = (ipOptimum, numOptimum) => (args) => {
  if (args.some(isBin16)) {
    return bin16(ipOptimum(args.map(deBin16)));
  }
  if (args.every(arg => !isNaN(Number(arg)))) {
    return numOptimum(...args);
  }
  return undefined;
};
const getMax = optimumFunction(optimum((str1, str2) => str1 > str2), Math.max);
const getMin = optimumFunction(optimum((str1, str2) => str1 < str2), Math.min);

const notOperators = ['<>', 'does not contain', 'does not start with', 'does not end with'];
const operatorGenerators = {
  '=': (args) => (args.length === 1 ? args[0] : { $in: args }),
  '<': (args) => ({ $lt: getMax(args) }),
  '>': (args) => ({ $gt: getMin(args) }),
  '<=': (args) => ({ $lte: getMax(args) }),
  '>=': (args) => ({ $gte: getMin(args) }),
  '<>': (args) => (args.length === 1 ? { $ne: args[0] } : { $nin: args }),
  between: (args) => ({ $gte: getMin(args), $lte: getMax(args) }),
  'not between': (args) => ({ $or: [{ $lt: getMin(args) }, { $gt: getMax(args) }] }),
  contains: (args) => (args.length === 1 ?
    { $contains: args[0] } :
    { $or: args.map(arg => ({ $contains: arg })) }),
  'starts with': (args) => (args.length === 1 ?
    { $startswith: args[0] } :
    { $or: args.map(arg => ({ $startswith: arg })) }),
  'ends with': (args) => (args.length === 1 ?
    { $endswith: args[0] } :
    { $or: args.map(arg => ({ $endswith: arg })) }),
  'does not contain': (args) => (args.length === 1 ?
    { $not_contains: args[0] } :
    { $and: args.map(arg => ({ $not_contains: arg })) }),
  'does not start with': (args) => (args.length === 1 ?
    { $not_startswith: args[0] } :
    { $and: args.map(arg => ({ $not_startswith: arg })) }),
  'does not end with': (args) => (args.length === 1 ?
    { $not_endswith: args[0] } :
    { $and: args.map(arg => ({ $not_endswith: arg })) }),
  'in subnet': (args) => (args.length === 1 ? args[0] : { $or: args }),
  'not in subnet': (args) =>
    (args.length === 1
      ? { $ipCidrne: args[0].$ipCidr }
      : { $and: args.map(arg => ({ $ipCidrne: arg.$ipCidr })) })
};

const noneOperators = {
  '=': { $null: true },
  '<>': { $null: false }
};

function mapValue(tag, column) {
  const type = column.value_type;
  const text = tag.getEscapedText();
  if (type === 'timestamp' && tag.isTimestamp) {
    return userInputAsValue(text, 'timestamp');
  }
  if (isIpAddressType(type)) {
    if (tag.isIP || tag.isIP6) {
      return bin16(userInputAsValue(text, 'ip'));
    }

    if (tag.isIpCIDR || tag.isIp6CIDR) {
      return {
        $ipCidr: {
          ip: userInputAsValue(text, type),
          subnetSize: getPrefixBits(text, type)
        }
      };
    }

    if (tag.isMac) {
      return bin16(userInputAsValue(text, 'mac'));
    }
  }
  return text;
}

function getCefTypesForValues(valueTags) {
  // we currently do not distinguish between int and long
  let canBeInt = true;
  let canBeFloat = true;
  for (const valueTag of valueTags) {
    if (!valueTag.isNone) {
      const val = +valueTag.getEscapedText();
      if (canBeInt && !Number.isSafeInteger(val)) {
        canBeInt = false;
      }
      if (canBeFloat && Number.isNaN(val)) {
        canBeFloat = false;
      }
    }
  }

  const valueCefTypes = ['string'];
  if (canBeInt) {
    valueCefTypes.push('int', 'long');
  }
  if (canBeFloat) {
    valueCefTypes.push('float');
  }
  return valueCefTypes;
}

const isIndexedColumn = (c) => c.cefType === 'string';

class ClauseStack {
  constructor() {
    this.clauses = [];
    this.grow();
  }

  _simplify(clause, selector) {
    const length = clause[selector].length;
    switch (length) {
      case 0:
        return undefined;
      case 1:
        return clause[selector][0];
      default:
        return clause;
    }
  }

  _getOrClause() {
    return this.clauses[this.clauses.length - 2];
  }

  last() {
    return this.clauses[this.clauses.length - 1];
  }

  grow() {
    this.clauses.push({ $or: [] }, { $and: [] });
  }

  shrink() {
    this.reduceLast();
    const orClause = this._simplify(this._getOrClause(this.clauses), '$or');
    this.clauses.splice(-2, 2);
    if (orClause) {
      this.last().$and.push(orClause);
    }
  }

  nested() {
    return this.clauses.length > 2;
  }

  reduceLast(reset = false) {
    const andClause = this._simplify(this.last(), '$and');
    if (andClause) {
      this._getOrClause(this.clauses).$or.push(andClause);
    }
    if (reset) {
      this.clauses[this.clauses.length - 1] = { $and: [] };
    }
  }

  reduceFirst() {
    return this._simplify(this.clauses[0], '$or');
  }

  insertConditions(orConditions) {
    if (orConditions.length > 0) {
      const nestedClause = orConditions.length > 1 ? { $or: orConditions } : orConditions[0];
      this.last().$and.push(nestedClause);
    }
  }
}

const lookupValueType = name => ({// TODO: use args as well
  count: 'int',
  avg: 'float',
  sum: 'float' // TODO: should use parameter types
}[name] || 'float'); // TODO: default float is probably not a good idea

class ExpressionBuilder {
  constructor(database) {
    this.database = database;
  }

  current() {
    return this.tags[this.i];
  }

  next() {
    const result = this.current();
    this.i++;
    return result;
  }

  test(tagType) {
    const tag = this.current();
    return tag && tag.getType() === tagType;
  }

  column() {
    const tag = this.next();
    const { value_type: valueType, id } = this.database.findColumn(tag.getName());
    if (!['float', 'int', 'uint'].includes(valueType)) {
      throw new Error(`Columns of value type "${valueType}" are not supported yet`);
    }
    return { expression: id, valueType, group: false };
  }

  parenthesis() {
    this.next();
    const expression = this.expression();
    if (this.test(RPAREN2)) {
      this.next();
      return expression;
    }
    throw Error('")" expected');
  }

  func() {
    const name = this.next().getName();
    this.next(); // skip LPAREN2
    const args = [];
    while (!this.test(RPAREN2)) {
      args.push(this.expression());
      if (this.test(COMMA)) {
        this.next(); // skip comma
      }
    }
    this.next(); // skip RPAREN
    return {
      expression: { [name.toUpperCase()]: args.map(({ expression }) => expression) },
      valueType: lookupValueType(name, args),
      group: true // TODO:
    };
  }

  unary() {
    const tag = this.current();
    switch (tag.getType()) {
      case COLUMN:
        return this.column();
      case LPAREN2:
        return this.parenthesis();
      case CALCFUNC:
        return this.func();
      default:
        throw new Error(`Calculation expected but found "${tag.getName()}"`);
    }
  }

  multiply() {
    let result = this.unary();
    while (this.test(CALCOP)) {
      const name = this.current().getName();
      if (!['*', '/'].includes(name)) {
        break;
      }
      this.next();
      const right = this.unary();
      result = {
        expression: { [name]: [result.expression, right.expression] },
        valueType: 'float', // TODO: calculate based on args
        group: result.group || right.group
      };
    }
    return result;
  }

  add() {
    let result = this.multiply();
    while (this.test(CALCOP)) {
      const name = this.next().getName();
      const right = this.multiply();
      result = {
        expression: { [name]: [result.expression, right.expression] },
        valueType: 'float', // TODO: calculate based on args
        group: result.group || right.group
      };
    }
    return result;
  }

  expression() {
    return this.add();
  }

  calculation() {
    const result = this.expression();
    const tag = this.current();
    if (tag) {
      throw new Error(`Extra query starting from ${tag.getText()}`);
    }
    return result;
  }

  build(tuple) {
    this.tags = Array.from(tuple.iterTags());
    this.i = 0;
    while (this.next().getType() !== ASSIGN) {
      // skip tokens until ASSIGN
    }
    try {
      return this.calculation();
    } catch (error) {
      return { error };
    }
  }
}

class MoSqlConverter {
  constructor(parseSubQuery, searchData, startTime, endTime, database, limitIndexUse) {
    this.parseSubQuery = parseSubQuery;
    this.searchData = searchData;
    this.startTime = startTime;
    this.endTime = endTime;
    this.database = database;
    this.limitIndexUse = limitIndexUse;
  }

  checkError(node) {
    if (node.error) {
      this.addError(`Fix error in query first: ${node.error}`);
    }
  }

  checkTree(queryTree) {
    for (const tag of queryTree.iterTags()) {
      this.checkError(tag);
    }
    this.checkError(queryTree);
  }

  addError(message) {
    this.status.failed = true;
    this.addMessage(message);
  }

  addWarning(message) {
    this.status.warning = true;
    this.addMessage(message);
  }

  addMessage(message) {
    const { status } = this;
    if (status.message) {
      status.message += `. ${message}`;
    } else {
      status.message = message;
    }
  }

  createUnitCondition(column, value) {
    const { name, field, tableName } = column;
    const key = tableName ? `${tableName}.${name}` : field;
    return { [key]: value };
  }

  combine(conditions, or) {
    switch (conditions.length) {
      case 0:
        return undefined;
      case 1:
        return conditions[0];
      default:
        return { [or ? '$or' : '$and']: conditions };
    }
  }

  createFinalCondition() {
    const { clauses, joinConditions } = this;
    const timeClause = this.createDateTimeClause();
    if (timeClause) {
      clauses.insertConditions([timeClause]);
    }
    joinConditions.forEach(condition => clauses.insertConditions([condition]));
    clauses.reduceLast();
    return clauses.reduceFirst() || {};
  }

  createDateTimeClause() {
    const { startTime, endTime, database } = this;
    const column = database.getTimeColumn();
    if (column && (typeof startTime === 'number' || typeof endTime === 'number')) {
      const timeClause = {};
      if (startTime) {
        timeClause.$gte = startTime;
      }
      if (endTime) {
        timeClause.$lte = endTime;
      }
      return this.createUnitCondition(column, timeClause);
    }
    return undefined;
  }

  generateIndexQuery(value) {
    const where = this.createDateTimeClause() || {};
    where[TOKEN_COLUMN] = value;
    return {
      type: 'select',
      table: INDEX_TABLE,
      columns: [DOC_ID_COLUMN],
      where
      // TODO: limit
    };
  }

  generateIntersect(v, generator) {
    const { database } = this;
    const idColumn = database.getIdColumn();
    const conditions = v
      .getEscapedText()
      .split(' ')
      .filter(Boolean)
      .map(t =>
        this.createUnitCondition(idColumn, { $in: this.generateIndexQuery(generator([t])) })
      );
    return this.combine(conditions);
  }

  convertQuery(tree, textIndex, nameStack) {
    const clauses = new ClauseStack();
    const joins = [];
    this.textIndex = textIndex;
    this.joinConditions = [];
    this.clauses = clauses;
    this.joins = joins;
    this.tableColumns = [];
    const { status } = this;
    status.message = '';
    this.convertSubQuery(tree, nameStack);
    if (!status.failed) {
      status[textIndex ? 'query2' : 'query'] = this.createFinalCondition();
      status.joins = joins;
      status.tableColumns = this.tableColumns.length > 0 ? this.tableColumns : undefined;
    }
  }

  toMoSql(tree) {
    const nameStack = [this.searchData.getSearchName()];
    this.status = { failed: false, warning: false };
    this.convertQuery(tree, false, nameStack);
    if (!this.status.failed) {
      this.convertQuery(tree, true, nameStack);
    }
    return this.status;
  }

  convertNestedSearch(nestedSearch, nameStack) {
    if (nameStack.includes(nestedSearch.name)) {
      this.addError(`Cannot run because search "${nestedSearch.name}" references itself`);
      return;
    }
    const nestedTree = this.parseSubQuery(nestedSearch.query);
    this.convertSubQuery(nestedTree, nameStack.concat(nestedSearch.name));
  }

  convertConditions(columns, operatorName, valueTags, useTextIndex) {
    const nonNoneValues = valueTags
      .filter((tag) => !tag.isNone);

    const conditions = [];
    if (nonNoneValues.length > 0) {
      const generator = operatorGenerators[operatorName];
      let nonIndexed;
      if (useTextIndex) {
        nonIndexed = columns.filter(c => !isIndexedColumn(c));
        const indexColumns = columns.filter(isIndexedColumn);
        nonNoneValues.forEach(v => {
          const andConditions = [];
          const indexClause = this.generateIntersect(v, generator);
          if (indexClause) {
            andConditions.push(indexClause);
          }
          const fieldConditions = indexColumns.map(column =>
            this.createUnitCondition(column, generator([mapValue(v, column)]))
          );
          const fieldsCondition = this.combine(fieldConditions, true);
          if (fieldsCondition) {
            andConditions.push(fieldsCondition);
          }
          const compoundClause = this.combine(andConditions);
          if (compoundClause) {
            conditions.push(compoundClause);
          }
        });
      } else {
        nonIndexed = columns;
      }
      nonIndexed.forEach((column) => conditions.push(this.createUnitCondition(
        column,
        generator(nonNoneValues.map(v => mapValue(v, column)))
      )));
    }

    const nullConditions = [];
    if (valueTags.find(tag => tag.isNone)) {
      const noneOperator = noneOperators[operatorName];
      if (noneOperator) {
        // TODO: nicer check
        const activeConditions = noneOperator.$null ? conditions : nullConditions;
        columns.forEach(column =>
          activeConditions.push(this.createUnitCondition(column, noneOperator))
        );
      }
    }

    if (nullConditions.length === 0 && notOperators.includes(operatorName)) {
      // force NULL values in the result
      const noneOperator = noneOperators['='];
      columns.forEach(column =>
        conditions.push(this.createUnitCondition(column, noneOperator))
      );
    }

    this.clauses.insertConditions(conditions);
    this.clauses.insertConditions(nullConditions);
  }

  addJoinCondition(tuple, joinTag) {
    const { database, joins, joinConditions } = this;
    const type = database.findJoin(joinTag.getName()).dbOperation;

    const join = { type, on: {} };
    joins.push(join);

    let lookupColumn;
    let mainColumn;
    tuple
      .filter(COLUMN)
      .map(tag => database.findColumn(tag.getName()))
      .filter(Boolean)
      .forEach(column => {
        if (column.tableName) {
          lookupColumn = column;
          join.target = column.tableName;
          if (type === 'left') {
            joinConditions.push(this.createUnitCondition(lookupColumn, noneOperators['=']));
          }
        } else {
          mainColumn = column;
        }
      });
    if (lookupColumn && mainColumn) {
      join.on[lookupColumn.name] = mainColumn.field;
    }
  }

  processCustomColumn(tuple) {
    const alias = tuple.find(ALIAS);
    const escapedText = alias.getEscapedText();
    const { group, expression, valueType, error } =
      new ExpressionBuilder(this.database).build(tuple);
    if (error) {
      this.addError(`Fix error in custom calculation: ${error.message}`);
    }
    // TODO: start using state objects in searchParser directory
    this.tableColumns.push({
      header: escapedText,
      alias: escapedText,
      expression,
      group,
      valueType
    });
  }

  convertTuple(tuple, nameStack) {
    if (tuple.find(ASSIGN)) {
      this.processCustomColumn(tuple);
      return;
    }

    const join = tuple.find(JOIN);
    if (join) {
      this.addJoinCondition(tuple, join);
      return;
    }

    let columns = tuple
      .filter(COLUMN)
      .map(t => this.database.findColumn(t.getName()))
      .filter(c => c);
    tuple.filter(GROUPNAME).forEach((groupname) => {
      const vt = groupname.getName();
      columns.push(...this.database.filterColumns(c => c.value_type === vt
        && c.groupName !== LOOKUP_COLUMNS_GROUPNAME));
    });

    let any = false;
    tuple.filter(GROUP).forEach((group) => {
      const nextTag = group.getNext();
      if (!nextTag || nextTag.getType() !== GROUPNAME) {
        any = true;
      }
    });

    const valueTags = tuple.filter(TEXT);

    let nestedSearch;
    if (!any && columns.length === 0 && valueTags.length === 1) {
      const vTag = valueTags[0];
      const searchName = vTag.getText().substring(vTag.isReference ? 1 : 0);
      nestedSearch = this.searchData.findSearch(searchName);
    }

    if (nestedSearch) {
      this.convertNestedSearch(nestedSearch, nameStack);
    } else {
      const operatorName = getTupleOperatorName(tuple);

      const operatorTypes = this.database.getOperatorCefTypes(operatorName);
      let useTextIndex = this.textIndex
        && operatorTypes.includes('string')
        && !notOperators.includes(operatorName);
      if (any || columns.length === 0) {
        const typeSet = new Set(getCefTypesForValues(valueTags));
        const cefTypeSet = new Set(operatorTypes.filter(x => typeSet.has(x)));
        useTextIndex &= cefTypeSet.has('string');
        this.addWarning('Searching values without specifying columns can be slow');
        columns.push(...this.database.filterColumns(c => cefTypeSet.has(c.cefType)));
        if (useTextIndex) {
          columns = columns.filter((c) => !isIndexedColumn(c));
        }
      } else {
        useTextIndex &= (columns.filter(isIndexedColumn).length > 0) && !this.limitIndexUse;
      }
      this.convertConditions([...new Set(columns)], operatorName, valueTags, useTextIndex);
    }
  }

  convertSubQuery(queryTree, nameStack) {
    this.checkTree(queryTree);
    const { clauses, status } = this;
    if (!status.failed) {
      clauses.grow();
      for (const tuple of queryTree.iterTuples()) {
        const andTag = tuple.find(AND1);
        if (andTag) {
          if (andTag.getName() === 'or') {
            clauses.reduceLast(true);
          }
        } else if (tuple.find(LPAREN)) {
          clauses.grow();
        } else if (tuple.find(RPAREN)) {
          if (clauses.nested()) {
            clauses.shrink();
          }
        } else {
          this.convertTuple(tuple, nameStack);
          if (status.failed) {
            return;
          }
        }
      }
      clauses.shrink();
    }
  }
}

const MAX_NON_TRUNCATED_LENGTH = 200;

function toMoSql(tree, searchData, parseSubQuery, startTime, endTime, database, limitIndexUse) {
  const result = new MoSqlConverter(
    parseSubQuery,
    searchData,
    startTime,
    endTime,
    database,
    limitIndexUse
  ).toMoSql(tree);
  const { query, query2, joins, message, tableColumns } = result;
  return {
    ...result,
    asQueryObject: (table) => ({
      query,
      query2,
      joins,
      tableColumns,
      table: table ? table.getId() : ''
    }),
    truncatedMessage: () => (message ? message.substring(0, MAX_NON_TRUNCATED_LENGTH) : message)
  };
}

exports.toMoSql = toMoSql;

