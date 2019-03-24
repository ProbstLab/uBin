import {
  IGetEnzymeDistributionFulfilled,
  IGetImportsFulfilled,
  IGetTaxonomiesForImportFulfilled,
  ISetImportedRecord,
  samplesActions,
  IGetSamplesFulfilled,
  ISetScatterDomain,
  ISetTaxonomyId,
  IRemoveFilters,
  IGetImportsPending,
  ISetScatterDomainX,
  ISetScatterDomainY,
  IGetAllEnzymeTypesFulfilled, IGetBinsFulfilled, ISetBinFilter, IResetDomain
} from './interfaces'
import {ThunkAction, ThunkDispatch} from 'redux-thunk'
import {IClientState} from '../index'
import {AnyAction} from 'redux'
import {Connection} from 'typeorm'
import {getDBConnection} from '../database/selectors'
import {DBActions} from '../database'
import {ISampleFilter, IScatterDomain} from 'samples'
import {getImportRecordId} from './selectors'
import {Bin} from '../../db/entities/Bin'

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
  static getAllEnzymeTypesFulfilled(payload: any): IGetAllEnzymeTypesFulfilled {
    return {type: samplesActions.getAllEnzymeTypesFulfilled, payload}
  }
  static getSamplesFulfilled(payload: any): IGetSamplesFulfilled {
    return {type: samplesActions.getSamplesFulfilled, payload}
  }
  static getBinsFulfilled(payload: any): IGetBinsFulfilled {
    return {type: samplesActions.getBinsFulfilled, payload}
  }
  // Filters
  static removeFilters(): IRemoveFilters {
    return {type: samplesActions.removeFilters}
  }
  static resetDomain(): IResetDomain {
    return {type: samplesActions.resetDomain}
  }
  static setImportedRecord(recordId: number): ISetImportedRecord {
    return {type: samplesActions.setImportedRecord, recordId}
  }
  static setTaxonomyId(taxonomyId: number): ISetTaxonomyId {
    return {type: samplesActions.setTaxonomyId, taxonomyId}
  }
  static setScatterDomain(scatterDomain: IScatterDomain): ISetScatterDomain {
    return {type: samplesActions.setScatterDomain, scatterDomain}
  }
  static setScatterDomainX(domain: [number, number]): ISetScatterDomainX {
    return {type: samplesActions.setScatterDomainX, domain}
  }
  static setScatterDomainY(domain: [number, number]): ISetScatterDomainY {
    return {type: samplesActions.setScatterDomainY, domain}
  }
  static setBinFilter(bin: Bin): ISetBinFilter {
    return {type: samplesActions.setBinFilter, bin}
  }

  static updateSelectedTaxonomy(taxonomyId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        let recordId: number | undefined = getState().samples.recordId
        if (connection && recordId) {
          Promise.all([
            dispatch(SamplesActions.setTaxonomyId(taxonomyId)),
          ]).then(() =>
          Promise.all([dispatch(DBActions.getImportData(recordId || 0))]).then(() => resolve()))
        } else {
          resolve()
        }
      })
    }
  }

  static updateScatterDomain(scatterDomain: IScatterDomain): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        Promise.all([dispatch(SamplesActions.setScatterDomain(scatterDomain))]).then(
          () => {
            let filters: ISampleFilter = getState().samples.filters
            let recordId = getImportRecordId(getState())
            if (connection && recordId) {
              Promise.all([dispatch(DBActions.getTaxonomiesForImport(connection, recordId, filters))]).then(() => resolve())
            } else {
              resolve()
            }
          }
        )
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
          ]).then(() => {
            if (connection && recordId) {
              Promise.all([dispatch(DBActions.getTaxonomiesForImport(connection, recordId))]).then(() => resolve())
            } else {
              resolve()
            }
          })
        } else {
          resolve()
        }
      })
    }
  }


  static setSelectedBin(bin: Bin): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        Promise.all([dispatch(SamplesActions.resetDomain()), dispatch(SamplesActions.setBinFilter(bin))]).then(
          () => {
            let filters: ISampleFilter = getState().samples.filters
            let recordId = getImportRecordId(getState())
            if (connection && recordId) {
              Promise.all([dispatch(DBActions.getTaxonomiesForImport(connection, recordId, filters))]).then(() => resolve())
            } else {
              resolve()
            }
          }
        )
      })
    }
  }
}