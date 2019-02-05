import {
  IGetEnzymeDistributionFulfilled,
  IGetImportsFulfilled,
  IGetTaxonomiesForImportFulfilled,
  ISetImportedRecord,
  samplesActions
} from './interfaces'
import {ThunkAction, ThunkDispatch} from 'redux-thunk'
import {IClientState} from '../index'
import {AnyAction} from 'redux'
import {Connection} from 'typeorm'
import {getDBConnection} from '../database/selectors'
import {DBActions} from '../database'

export class SamplesActions {
  static getImportsFulfilled(payload: any): IGetImportsFulfilled {
    return {type: samplesActions.getImportsFulfilled, payload}
  }
  static getTaxonomiesForImportFulfilled(payload: any): IGetTaxonomiesForImportFulfilled {
    return {type: samplesActions.getTaxonomiesForImportFulfilled, payload}
  }
  static getEnzymeDistributionFulfilled(payload: any): IGetEnzymeDistributionFulfilled {
    return {type: samplesActions.getEnzymeDistributionFulfilled, payload}
  }
  static setImportedRecord(recordId: number): ISetImportedRecord {
    return {type: samplesActions.setImportedRecord, recordId}
  }

  static updateSelectedTaxonomy(taxonomyId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction> {
    console.log("Update!", taxonomyId)
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IClientState): Promise<void> => {
      return new Promise<void>(resolve => {
        let connection: Connection | undefined = getDBConnection(getState())
        let recordId: number | undefined = getState().samples.recordId
        if (connection && recordId) {
          Promise.all([
            dispatch(DBActions.getEnzymeDistribution(connection, recordId, taxonomyId)),
          ]).then(() => resolve())
        } else {
          resolve()
        }
      })
    }
  }
}