import { Action } from 'redux'
// import { IValueMap } from 'common'
// import { ISample } from 'samples'
import {ITaxonomyForSunburst} from '../../utils/interfaces'
import {Enzyme} from '../../db/entities/Enzyme'
import {ISampleFilter, IDomain} from 'samples'
import {Bin} from '../../db/entities/Bin'
import {Taxonomy} from '../../db/entities/Taxonomy'

export interface IImportRecord {
  id: number
  name: string
}

export interface ISamplesState {
  filters: ISampleFilter
  samples?: any[]
  importRecords: IImportRecord[]
  taxonomies?: Taxonomy[]
  enzymeDistribution?: Enzyme[]
  enzymeTypes?: Enzyme[]
  selectedTaxonomy?: ITaxonomyForSunburst
  recordId?: number
  bins: Bin[]
  importRecordsPending: boolean
  importsLoaded: boolean
}

export enum samplesActions {
  getImportsPending = 'database.getImports_PENDING',
  getImportsFulfilled = 'database.getImports_FULFILLED',
  getTaxonomiesFulfilled = 'database.getTaxonomies_FULFILLED',
  getTaxonomiesForImportFulfilled = 'database.getTaxonomiesForImport_FULFILLED',
  getEnzymeDistributionFulfilled = 'database.getEnzymeDistribution_FULFILLED',
  getAllEnzymeTypesFulfilled = 'database.getAllEnzymeTypes_FULFILLED',
  getSamplesFulfilled = 'database.getSamples_FULFILLED',
  getBinsFulfilled = 'database.getBins_FULFILLED',
  setImportedRecord = 'database.setImportedRecord',
  setDomain = 'samples.setDomain',
  setDomainX = 'samples.setDomainX',
  setDomainY = 'samples.setDomainY',
  setSelectedTaxonomy = 'samples.setSelectedTaxonomy',
  removeFilters = 'samples.removeFilters',
  resetDomain = 'samples.resetDomain',
  setBinFilter = 'samples.setBinFilter',
  setBinView = 'samples.setBinView',
}
export interface IGetImportsPending extends Action {
  type: samplesActions.getImportsPending
  payload: any
}
export interface IGetImportsFulfilled extends Action {
  type: samplesActions.getImportsFulfilled
  payload: any
}

export interface IGetTaxonomiesForImportFulfilled extends Action {
  type: samplesActions.getTaxonomiesForImportFulfilled
  payload: any
}
export interface IGetTaxonomiesFulfilled extends Action {
  type: samplesActions.getTaxonomiesFulfilled
  payload: any
}
export interface IGetEnzymeDistributionFulfilled extends Action {
  type: samplesActions.getEnzymeDistributionFulfilled
  payload: any
}
export interface IGetAllEnzymeTypesFulfilled extends Action {
  type: samplesActions.getAllEnzymeTypesFulfilled
  payload: any
}
export interface IGetSamplesFulfilled extends Action {
  type: samplesActions.getSamplesFulfilled
  payload: any
}
export interface IGetBinsFulfilled extends Action {
  type: samplesActions.getBinsFulfilled
  payload: any
}

export interface IRemoveFilters extends Action {
  type: samplesActions.removeFilters
}
export interface IResetDomain extends Action {
  type: samplesActions.resetDomain
}

export interface ISetImportedRecord extends Action {
  type: samplesActions.setImportedRecord
  recordId: number
}
export interface ISetSelectedTaxonomy extends Action {
  type: samplesActions.setSelectedTaxonomy
  taxonomyId: number | undefined
}

export interface ISetDomain extends Action {
  type: samplesActions.setDomain
  domain: IDomain
}
export interface ISetDomainX extends Action {
  type: samplesActions.setDomainX
  domain: [number, number]
}
export interface ISetDomainY extends Action {
  type: samplesActions.setDomainY
  domain: [number, number]
}
export interface ISetBinFilter extends Action {
  type: samplesActions.setBinFilter
  bin: Bin
}
export interface ISetBinView extends Action {
  type: samplesActions.setBinView
  binView: boolean
}