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
  [samplesActions.getTaxonomiesFulfilled]: samples.getTaxonomiesFulfilled,
  [samplesActions.getTaxonomiesForImportFulfilled]: samples.getTaxonomiesForImportFulfilled,
  [samplesActions.getEnzymeDistributionFulfilled]: samples.getEnzymeDistributionFulfilled,
  [samplesActions.getAllEnzymeTypesFulfilled]: samples.getAllEnzymeTypesFulfilled,
  [samplesActions.getSamplesFulfilled]: samples.getSamplesFulfilled,
  [samplesActions.getBinsFulfilled]: samples.getBinsFulfilled,
  [samplesActions.setImportedRecord]: samples.setImportedRecord,
  [samplesActions.setDomain]: samples.setDomain,
  [samplesActions.setDomainX]: samples.setDomainX,
  [samplesActions.setDomainY]: samples.setDomainY,
  [samplesActions.setBinFilter]: samples.setBinFilter,
  [samplesActions.setBinView]: samples.setBinView,
  [samplesActions.removeFilters]: samples.removeFilters,
  [samplesActions.resetDomain]: samples.resetDomain,
  [samplesActions.resetGC]: samples.resetGC,
  [samplesActions.resetCoverage]: samples.resetCoverage,
  [samplesActions.resetTaxonomies]: samples.resetTaxonomies,
  [samplesActions.resetBin]: samples.resetBin,
  [samplesActions.setSelectedTaxonomy]: samples.setSelectedTaxonomy,
  [samplesActions.addExcludedTaxonomy]: samples.addExcludedTaxonomy,
  [samplesActions.setConsensus]: samples.setConsensus,
  [samplesActions.setConsensusName]: samples.setConsensusName,
  [samplesActions.setSampleName]: samples.setSampleName,
  [samplesActions.setGCAverage]: samples.setGCAverage,
  [samplesActions.setCoverageAverage]: samples.setCoverageAverage,
  [samplesActions.setTotalLength]: samples.setTotalLength,
  [samplesActions.setSavingBins]: samples.setSavingBins,
  [samplesActions.setNewBinToData]: samples.setNewBinToData,
  [samplesActions.setReloadSamples]: samples.setReloadSamples,
  [samplesActions.setSelectedCount]: samples.setSelectedCount,
})

export const fileTreeReducer = createReducer(files.getInitialState(), {
  [fileTreeActions.populateFileTree]: files.populateFileTree,
  [fileTreeActions.initFileTree]: files.initFileTree,
  [fileTreeActions.openFile]: files.openFile,
  [fileTreeActions.addFile]: files.addFile,
  [fileTreeActions.removeAddedFile]: files.removeAddedFiles,
  [fileTreeActions.importFilePending]: files.importFilePending,
  [fileTreeActions.importFileFulfilled]: files.importFileFulfilled,
  [fileTreeActions.setImportName]: files.setImportName,
  [fileTreeActions.saveExportFilePending]: files.saveExportFilePending,
  [fileTreeActions.saveExportFileRejected]: files.saveExportFileRejected,
  [fileTreeActions.saveExportFileFulfilled]: files.saveExportFileFulfilled,
})

export const dbReducer = createReducer(db.getInitialState(), {
  [dbActions.connectDatabaseFulfilled]: db.connectDatabaseFulfilled,
  [dbActions.getSamplesPending]: db.getSamplesPending,
  [dbActions.getSamplesPendingDone]: db.getSamplesPending,
  [dbActions.getTaxonomiesForImportPending]: db.getTaxonomiesPending,
  [dbActions.getTaxonomiesForImportPendingDone]: db.getTaxonomiesPending,
  [dbActions.saveBinPending]: db.setSaveBinPending,
  [dbActions.saveBinRejected]: db.setSaveBinRejected,
  [dbActions.saveBinFulfilled]: db.setSaveBinFulfilled,
  [dbActions.deleteBinPending]: db.setDeleteBinPending,
  [dbActions.deleteBinRejected]: db.setDeleteBinRejected,
  [dbActions.deleteBinFulfilled]: db.setDeleteBinFulfilled,
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
