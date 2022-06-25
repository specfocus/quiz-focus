import { EnumValue } from './EnumValue'
import { GraphQuery } from './GraphQuery'

export interface GraphQueryFactory {
  new(fnName: string | IAlias, argumentsMap?: IArgumentsMap): GraphQuery;
}

export interface IArgumentsMap {
  [index: string]: string | number | boolean | Object | EnumValue;
}

export interface IAlias {
  [index: string]: string | GraphQuery;
}

export interface IHead {
  fnName: IAlias;
  argumentsMap?: IArgumentsMap;
}

export interface IBody {
  attr: IAlias;
  argumentsMap?: IArgumentsMap;
}

export interface ISelection extends IArgumentsMap {
  _filter?: Object;
}