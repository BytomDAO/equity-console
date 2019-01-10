import { getParamValue} from "./selectors"
import _ from "lodash"
import math from "mathjs"

export const strToHexCharCode = (str) => {
  if (str === "")
    return ""
  var hexCharCode: string[] = []
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push((str.charCodeAt(i)).toString(16))
  }
  return hexCharCode.join("")
}

export const addType = (clauseObject) => {
  const action: any[] = []
  if(clauseObject.values !== null ){
    action.push(lockUnlockType(clauseObject.values))
  }
  else{
    for (const condValue of clauseObject.cond_values){
      const object =condValue
      object.type  = 'ifElse'

      object.false_body = lockUnlockType(object.false_body)
      object.true_body = lockUnlockType(object.true_body)
      action.push(object)
    }
  }
  return action
}

export const lockUnlockType = (oldArray) => {
  const newArray =[]
  for(const value of oldArray){
    const object = value
    if('program' in value){
      object.type = 'lock'
    }else{
      object.type = 'unlock'
    }
    newArray.push(object)
  }
  return newArray
}

export const addParamType = (param) => {
  if (param instanceof Buffer) {
    return { "string": param.toString('hex') }
  }

  if (typeof param === 'string') {
    return { "string": param }
  }

  if (typeof param === 'number') {
    return { "integer": param }
  }

  if (typeof param === 'boolean') {
    return { 'boolean': param }
  }
  throw 'unsupported argument type ' + (typeof param)
}

export const calculation = (params, expr, state) => {
  let stringExpr = expr
  for(const param of params){
    const value = getParamValue(param.name)(state)
    stringExpr = _.replace(stringExpr, new RegExp(param.name,"g"), value)
  }
  stringExpr =  _.replace(stringExpr, /&&/g, "and")
  stringExpr =  _.replace(stringExpr, /\|\|/g, "or")

  stringExpr = _.replace(stringExpr,/\(((\(.+\))|[0-9]+) \/ ((\(.+\))|[0-9]+)\)/g, (x) => 'floor'+x)
  return math.eval(stringExpr)
}
