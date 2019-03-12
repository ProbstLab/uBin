import {Action} from 'redux'
import { RouterState } from 'connected-react-router'

import { ISamplesState, Controller as samples, samplesActions } from './samples'
import {Controller as files, fileTreeActions, IFileTreeState} from './files'
import {Controller as db, dbActions, IDBState} from './database'

export interface IClientState {
  fileTree: IFileTreeState
  samples: ISamplesState
  database: IDBState
  router: RouterState
}

export const samplesReducer = createReducer(samples.getInitialState(), {
  [samplesActions.getImportsPending]: samples.getImportsPending,
  [samplesActions.getImportsFulfilled]: samples.getImportsFulfilled,
  [samplesActions.getTaxonomiesForImportFulfilled]: samples.getTaxonomiesForImportFulfilled,
  [samplesActions.getEnzymeDistributionFulfilled]: samples.getEnzymeDistributionFulfilled,
  [samplesActions.setImportedRecord]: samples.setImportedRecord,
  [samplesActions.getSamplesFulfilled]: samples.getSamplesFulfilled,
  [samplesActions.setScatterDomain]: samples.setScatterDomain,
  [samplesActions.removeFilters]: samples.removeFilters,
})

export const fileTreeReducer = createReducer(files.getInitialState(), {
  [fileTreeActions.populateFileTree]: files.populateFileTree,
  [fileTreeActions.initFileTree]: files.initFileTree,
  [fileTreeActions.openFile]: files.openFile,
  [fileTreeActions.addFile]: files.addFile,
  [fileTreeActions.removeAddedFile]: files.removeAddedFiles,
  [fileTreeActions.importFilePending]: files.importFilePending,
  [fileTreeActions.importFileFulfilled]: files.importFileFulfilled,
})

export const dbReducer = createReducer(db.getInitialState(), {
  [dbActions.connectDatabaseFulfilled]: db.connectDatabaseFulfilled,
  [dbActions.getSamplesPending]: db.getSamplesPending,
  [dbActions.getSamplesPendingDone]: db.getSamplesPending,
  [dbActions.getTaxonomiesForImportPending]: db.getTaxonomiesPending,
  [dbActions.getTaxonomiesForImportPendingDone]: db.getTaxonomiesPending,
})

// Utils
type TCaseReducer<TState> = (state: TState, action: Action) => TState

interface IHandlers<TState> {
  [type: string]: TCaseReducer<TState>
}

export function createReducer<TState>(
  initialState: TState,
  handlers: IHandlers<TState>,
): (state: TState, action: Action) => TState {
  return function reducer(state: TState = initialState, action: Action): TState {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}
