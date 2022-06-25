import { Schema } from '../schema/Schema'
import { SyntaxTree } from '../syntax/SyntaxTree'
import { SyntaxTreeChecker } from '../syntax/SyntaxTreeChecker'

export const checkSemantics = (syntaxTree: SyntaxTree, searchData, database: Schema) =>
  new SyntaxTreeChecker(database, syntaxTree, searchData).checkTree()