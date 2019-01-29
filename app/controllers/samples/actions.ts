import { ISampleFilter } from 'samples'
import {IGetImportsFulfilled, IGetTaxonomiesForImportFulfilled, ISetSampleFilter, samplesActions} from './interfaces'

export class SamplesActions {
  static setFilter(filter: ISampleFilter): ISetSampleFilter {
    return { filter, type: samplesActions.setSampleFilter }
  }
  static getImportsFulfilled(payload: any): IGetImportsFulfilled {
    return {type: samplesActions.getImportsFulfilled, payload}
  }
  static getTaxonomiesForImportFulfilled(payload: any): IGetTaxonomiesForImportFulfilled {
    return {type: samplesActions.getTaxonomiesForImportFulfilled, payload}
  }
}