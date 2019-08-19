import { Action } from 'redux'
import { IFile } from 'files';
import {IValueMap} from "common";
import {IFastaDict} from '../../typings/fasta'

export interface IFileTreeState {
  fileTree?: IFile[]
  addedFiles: IValueMap<IFile>
  isImportingFiles: boolean
  isImportingFastaFile: boolean
  importName?: string
  exportState?: string
  fastaDict?: IFastaDict
}

export enum fileTreeActions {
  setFiles = 'files.set-files',
  addFile = 'files.add',
  removeAddedFile = 'files.added-remove',
  openFile = 'files.open',
  populateFileTree = 'files.populate',
  initFileTree = 'files.init-filetree',
  importFile = 'files.import',
  importFilePending = 'files.import_PENDING',
  importFileFulfilled = 'files.import_FULFILLED',
  importFastaFile = 'files.importFasta',
  importFastaFilePending = 'files.importFasta_PENDING',
  importFastaFileFulfilled = 'files.importFasta_FULFILLED',
  importFastaFileRejected = 'files.importFasta_REJECTED',
  setImportName = 'files.setImportName',
  saveExportFile = 'files.saveExportFile',
  saveExportFilePending = 'files.saveExportFile_PENDING',
  saveExportFileRejected = 'files.saveExportFile_REJECTED',
  saveExportFileFulfilled = 'files.saveExportFile_FULFILLED',
}

export interface IOpenFile extends Action {
  type: fileTreeActions.openFile
  file: IFile
}

export interface IAddFile extends Action {
  type: fileTreeActions.addFile
  file: IFile
}

export interface IRemoveAddedFile extends Action {
  type: fileTreeActions.removeAddedFile
  file: IFile
}

export interface IPopulateFileTree extends Action {
  type: fileTreeActions.populateFileTree
  file: IFile
}

export interface IInitFileTree extends Action {
  type: fileTreeActions.initFileTree
  dir: string
}

export interface IImportFile extends Action {
  type: fileTreeActions.importFile
  payload: Promise<any>
}
export interface IImportFilePending extends Action {
  type: fileTreeActions.importFilePending
  payload: any
}
export interface IImportFileFulfilled extends Action {
  type: fileTreeActions.importFileFulfilled
  payload: any
}

export interface IImportFastaFile extends Action {
  type: fileTreeActions.importFastaFile
  payload: Promise<any>
}
export interface IImportFastaFilePending extends Action {
  type: fileTreeActions.importFastaFilePending
  payload: any
}
export interface IImportFastaFileFulfilled extends Action {
  type: fileTreeActions.importFastaFileFulfilled
  payload: any
}
export interface IImportFastaFileRejected extends Action {
  type: fileTreeActions.importFastaFileRejected
  payload: any
}

export interface IISetImportName extends Action {
  type: fileTreeActions.setImportName
  importName: string
}

export interface IISaveExportFile extends Action {
  type: fileTreeActions.saveExportFile
  payload: Promise<any>
}
export interface IISaveExportFilePending extends Action {
  type: fileTreeActions.saveExportFilePending
  payload: any
}
export interface IISaveExportFileRejected extends Action {
  type: fileTreeActions.saveExportFileRejected
  payload: any
}
export interface IISaveExportFileFulfilled extends Action {
  type: fileTreeActions.saveExportFileFulfilled
  payload: any
}

