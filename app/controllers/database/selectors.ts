import { createSelector } from 'reselect'
import {IDBState} from './interfaces'
import { IClientState } from '..'

const getDBState = (state: IClientState) => state.database

export const getDBConnection = createSelector(
  getDBState,
  (state: IDBState) => state.connection
)