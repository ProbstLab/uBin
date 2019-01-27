import { Action } from 'redux'
import { IValueMap } from 'common'
import { ISampleFilter, ISample } from 'samples'

export interface IImportRecord {
  id: number
  name: string
}

export interface ISamplesState {
  filter: ISampleFilter
  samples?: IValueMap<ISample>
  importRecords: IImportRecord[]
}

export enum samplesActions {
  setSampleFilter = 'samples.set-filter',
  getImportsFulfilled = 'database.getImports_FULFILLED',
}

export interface ISetSampleFilter extends Action {
  type: samplesActions.setSampleFilter
  filter: ISampleFilter
}
export interface IGetImportsFulfilled extends Action {
  type: samplesActions.getImportsFulfilled
  payload: any
}
