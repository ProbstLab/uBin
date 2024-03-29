import {
  IGetEnzymeDistributionFulfilled,
  IGetImportsFulfilled,
  IGetTaxonomiesForImportFulfilled,
  ISetImportedRecord,
  samplesActions,
  IGetSamplesFulfilled,
  ISetDomain,
  IRemoveFilters,
  IGetImportsPending,
  ISetDomainX,
  ISetDomainY,
  IGetAllEnzymeTypesFulfilled,
  IGetBinsFulfilled,
  ISetBinFilter,
  IResetDomain,
  ISetBinView,
  IGetTaxonomiesFulfilled,
  ISetSelectedTaxonomy,
  IAddExcludedTaxonomy,
  IResetGC,
  IResetCoverage,
  IResetTaxonomies,
  IResetBin,
  ISetConsensus,
  ISetGCAverage,
  ISetCoverageAverage,
  ISetConsensusName,
  ISetSampleName, ISetTotalLength, ISetNewBinToData, ISetReloadSamples, ISetSelectedCount, IRevertFilters,
} from './interfaces'
import {ThunkAction, ThunkDispatch} from 'redux-thunk'
import {IClientState} from '../index'
import {AnyAction} from 'redux'
import {Connection} from 'typeorm'
import {getDBConnection} from '../database/selectors'
import {DBActions} from '../database'
import {IDomain} from 'samples'
// import {getImportRecordId} from './selectors'
import {Bin} from '../../db/entities/Bin'
import {Taxonomy} from '../../db/entities/Taxonomy'
import {UBinToaster} from '../../utils/uBinToaster'
import {getBinName, getImportRecordId, getSamples, getSamplesFilters} from './selectors'
import { IImportRecord } from 'app/utils/interfaces'

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
  static getTaxonomiesFulfilled(payload: any): IGetTaxonomiesFulfilled {
    return {type: samplesActions.getTaxonomiesFulfilled, payload}
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
  static revertFilters(): IRevertFilters {
    return {type: samplesActions.revertFilters}
  }
  static resetDomain(): IResetDomain {
    return {type: samplesActions.resetDomain}
  }
  static resetGC(): IResetGC {
    return {type: samplesActions.resetGC}
  }
  static resetCoverage(): IResetCoverage {
    return {type: samplesActions.resetCoverage}
  }
  static resetTaxonomies(): IResetTaxonomies {
    return {type: samplesActions.resetTaxonomies}
  }
  static resetBin(): IResetBin {
    return {type: samplesActions.resetBin}
  }
  static setImportedRecord(recordId: number): ISetImportedRecord {
    return {type: samplesActions.setImportedRecord, recordId}
  }
  static setSelectedTaxonomy(taxonomy: Taxonomy): ISetSelectedTaxonomy {
    return {type: samplesActions.setSelectedTaxonomy, taxonomy}
  }
  static addExcludedTaxonomy(taxonomy: Taxonomy): IAddExcludedTaxonomy {
    return {type: samplesActions.addExcludedTaxonomy, taxonomy}
  }
  static setDomain(domain: IDomain): ISetDomain {
    return {type: samplesActions.setDomain, domain}
  }
  static setDomainX(domain: [number, number]): ISetDomainX {
    return {type: samplesActions.setDomainX, domain}
  }
  static setDomainY(domain: [number, number]): ISetDomainY {
    return {type: samplesActions.setDomainY, domain}
  }
  static setBinFilter(bin: Bin): ISetBinFilter {
    return {type: samplesActions.setBinFilter, bin}
  }
  static setBinView(binView: boolean): ISetBinView {
    return {type: samplesActions.setBinView, binView}
  }

  static setConsensus(consensus?: Taxonomy): ISetConsensus {
    return {type: samplesActions.setConsensus, consensus}
  }
  static setConsensusName(consensusName: string): ISetConsensusName {
    return {type: samplesActions.setConsensusName, consensusName}
  }
  static setSampleName(sampleName: string): ISetSampleName {
    return {type: samplesActions.setSampleName, sampleName}
  }
  static setGCAverage(avg: number): ISetGCAverage {
    return {type: samplesActions.setGCAverage, avg}
  }
  static setCoverageAverage(avg: number): ISetCoverageAverage {
    return {type: samplesActions.setCoverageAverage, avg}
  }

  static setTotalLength(length: number): ISetTotalLength {
    return {type: samplesActions.setTotalLength, length}
  }

  static setNewBinToData(bin: Bin, ids: number[]): ISetNewBinToData {
    return {type: samplesActions.setNewBinToData, bin, ids}
  }
  static setReloadSamples(reload: boolean): ISetReloadSamples {
    return {type: samplesActions.setReloadSamples, reload}
  }
  static setSelectedCount(selectedCount: number): ISetSelectedCount {
    return {type: samplesActions.setSelectedCount, selectedCount}
  }

  static updateSelectedTaxonomy(taxonomy: Taxonomy): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        let recordId: number | undefined = getState().samples.recordId
        if (connection && recordId) {
          Promise.all([
            dispatch(SamplesActions.setSelectedTaxonomy(taxonomy)),
          ]).then(() => {
            if (connection && recordId) {
              Promise.all([dispatch(DBActions.getImportData(recordId))]).then(() => resolve())
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

  static updateDomain(domain: IDomain): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        Promise.all([dispatch(SamplesActions.setDomain(domain))]).then(() => resolve())
      })
    }
  }

  static updateDomainX(domain: [number, number]): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        Promise.all([dispatch(SamplesActions.setDomainX(domain))]).then(() => resolve())
      })
    }
  }

  static updateDomainY(domain: [number, number]): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        Promise.all([dispatch(SamplesActions.setDomainY(domain))]).then(() => resolve())
      })
    }
  }

  static updateBinView(binView: boolean): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        Promise.all([dispatch(SamplesActions.setBinView(binView))]).then(() => resolve())
      })
    }
  }

  static resetFilters(): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        Promise.all([dispatch(SamplesActions.removeFilters())]).then(() => resolve())
      })
    }
  }

  static setSelectedBin(bin: Bin): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        Promise.all([dispatch(SamplesActions.resetDomain()),
                     dispatch(SamplesActions.resetTaxonomies())])
                    .then(() => Promise.all([
                            dispatch(SamplesActions.setBinFilter(bin)),
                            dispatch(SamplesActions.setBinView(true))]).then(() => resolve()))
      })
    }
  }

  static saveBin(): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let binName = getBinName(getState())
        let data = getSamples(getState())
        let filters = getSamplesFilters(getState())
        let connection = getDBConnection(getState())
        let recordId = getImportRecordId(getState())
        if (connection && recordId) {
          Promise.all([dispatch(DBActions.saveBin(connection, recordId, data, filters, binName, dispatch))])
            .then(() => {
              if (connection && recordId) {
                Promise.all([dispatch(DBActions.getBins(connection, recordId))])
                  .then(() => resolve())
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

  static deleteBin(bin: Bin): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection = getDBConnection(getState())
        let recordId = getImportRecordId(getState())
        if (connection && recordId) {
          Promise.all([
            dispatch(SamplesActions.removeFilters()),
            dispatch(DBActions.deleteBin(connection, bin, dispatch))]
          ).then(() => {
            UBinToaster.show({message: 'Bin has been deleted!', icon: 'tick', intent: 'success'})
            if (connection && recordId) {
              Promise.all([dispatch(DBActions.getBins(connection, recordId))])
                .then(() => resolve())
            } else {
              resolve()
            }
          }).catch(() => {
            UBinToaster.show({message: 'Deleting bin failed', icon: 'error', intent: 'danger'})
          })
        } else {
          resolve()
        }
      })
    }
  }

  static deleteRecord(record: IImportRecord): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection = getDBConnection(getState())
        if (connection && record) {
          Promise.all([
            dispatch(DBActions.deleteRecord(connection, record, dispatch))
          ]).then(() => {
            Promise.all([dispatch(DBActions.refreshImports())])
              .then(() => resolve())
            }
          )} else {
            resolve()
        }
      })
    }
  }
}
