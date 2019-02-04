import { Action } from 'redux'
import { IValueMap } from 'common'
import { ISampleFilter, ISample } from 'samples'
import {IGenericAssociativeArray} from "../../utils/interfaces"
import {Enzyme} from '../../db/entities/Enzyme'

export interface IImportRecord {
  id: number
  name: string
}

export interface ISamplesState {
  filter: ISampleFilter
  samples?: IValueMap<ISample>
  importRecords: IImportRecord[]
  taxonomyTreeFull?: IGenericAssociativeArray
  enzymeDistribution?: Enzyme[]
}

export enum samplesActions {
  setSampleFilter = 'samples.set-filter',
  getImportsFulfilled = 'database.getImports_FULFILLED',
  getTaxonomiesForImportFulfilled = 'database.getTaxonomiesForImport_FULFILLED',
  getEnzymeDistributionFulfilled = 'database.getEnzymeDistribution_FULFILLED',
}

export interface ISetSampleFilter extends Action {
  type: samplesActions.setSampleFilter
  filter: ISampleFilter
}
export interface IGetImportsFulfilled extends Action {
  type: samplesActions.getImportsFulfilled
  payload: any
}
export interface IGetTaxonomiesForImportFulfilled extends Action {
  type: samplesActions.getTaxonomiesForImportFulfilled
  payload: any
}
export interface IGetEnzymeDistributionFulfilled extends Action {
  type: samplesActions.getEnzymeDistributionFulfilled
  payload: any
}
