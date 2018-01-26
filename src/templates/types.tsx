export type SourceMap = { [s: string]: string }

export type TemplateState = {
  sourceMap: SourceMap,
  idList: string[],
  protectedIdList: string[],
  source: string
}
