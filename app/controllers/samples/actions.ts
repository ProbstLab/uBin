import {
  IGetEnzymeDistributionFulfilled,
  IGetImportsFulfilled,
  IGetTaxonomiesForImportFulfilled,
  ISetImportedRecord,
  samplesActions,
  IGetSamplesFulfilled, ISetScatterDomain, ISetTaxonomyIds, IRemoveFilters, IGetImportsPending
} from './interfaces'
import {ThunkAction, ThunkDispatch} from 'redux-thunk'
import {IClientState} from '../index'
import {AnyAction} from 'redux'
import {Connection} from 'typeorm'
import {getDBConnection} from '../database/selectors'
import {DBActions} from '../database'
import {ISampleFilter, IScatterDomain} from 'samples'
import {getImportRecordId} from './selectors'

export class SamplesActions {
  static getImportsPending(payload: any): IGetImportsPending {
    return {type: samplesActions.getImportsPending, payload}
  }
  static getImportsFulfilled(payload: any): IGetImportsFulfilled {
    return {type: samplesActions.getImportsFulfilled, payload}
  }
  static getTaxonomiesForImportFulfilled(payload: any): IGetTaxonomiesForImportFulfilled {
    return {type: samplesActions.getTaxonomiesForImportFulfilled, payload}
  }
  static getEnzymeDistributionFulfilled(payload: any): IGetEnzymeDistributionFulfilled {
    return {type: samplesActions.getEnzymeDistributionFulfilled, payload}
  }
  static getSamplesFulfilled(payload: any): IGetSamplesFulfilled {
    return {type: samplesActions.getSamplesFulfilled, payload}
  }
  // Filters
  static removeFilters(): IRemoveFilters {
    return {type: samplesActions.removeFilters}
  }
  static setImportedRecord(recordId: number): ISetImportedRecord {
    return {type: samplesActions.setImportedRecord, recordId}
  }
  static setTaxonomyIds(taxonomyIds: number[]): ISetTaxonomyIds {
    return {type: samplesActions.setTaxonomyIds, taxonomyIds}
  }
  static setScatterDomain(scatterDomain: IScatterDomain): ISetScatterDomain {
    return {type: samplesActions.setScatterDomain, scatterDomain}
  }

  static updateSelectedTaxonomy(taxonomyIds: number[]): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        let recordId: number | undefined = getState().samples.recordId
        if (connection && recordId) {
          Promise.all([
            dispatch(SamplesActions.setTaxonomyIds(taxonomyIds)),
            dispatch(DBActions.getEnzymeDistribution(connection, recordId, taxonomyIds)),
            dispatch(DBActions.getSamples(connection, recordId, taxonomyIds)),
          ]).then(() => resolve())
        } else {
          resolve()
        }
      })
    }
  }

  static updateScatterDomain(scatterDomain: IScatterDomain): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    console.log("updateScatterDomain")
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())

        Promise.all([dispatch(SamplesActions.setScatterDomain(scatterDomain))]).then(
          () => {
            let filters: ISampleFilter = getState().samples.filters
            let recordId = getImportRecordId(getState())
            console.log("then do more things", recordId, connection)
            if (connection && recordId) {
              console.log("then get taxonomies")
              Promise.all([dispatch(DBActions.getTaxonomiesForImport(connection, recordId, filters))]).then(() => resolve())
            } else {
              resolve()
            }
          }
        )
      })
    }
  }

  static applyFilters(): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        let recordId: number | undefined = getState().samples.recordId
        let filters: ISampleFilter = getState().samples.filters
        if (connection && recordId) {
          Promise.all([
            dispatch(DBActions.getEnzymeDistribution(connection, recordId, undefined, filters)),
            dispatch(DBActions.getSamples(connection, recordId, undefined, filters)),
          ]).then(() => resolve())
        } else {
          resolve()
        }
      })
    }
  }
  static resetFilters(): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        let recordId: number | undefined = getState().samples.recordId
        if (connection && recordId) {
          Promise.all([
            dispatch(SamplesActions.removeFilters()),
            dispatch(DBActions.getEnzymeDistribution(connection, recordId, undefined, undefined)),
            dispatch(DBActions.getSamples(connection, recordId, undefined, undefined)),
          ]).then(() => resolve())
        } else {
          resolve()
        }
      })
    }
  }
}