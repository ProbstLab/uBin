import { Action } from 'redux'
import { IFile } from 'files';
import {IValueMap} from "common";

export interface IFileTreeState {
  fileTree?: IFile[]
  addedFiles: IValueMap<IFile>
  isImportingFiles: boolean
}

export enum fileTreeActions {
  setFiles = 'files.set-files',
  addFile = 'files.add',
  removeAddedFile = 'files.added-remove',
  openFile = 'files.open',
  populateFileTree = 'files.populate',
  initFileTree = 'files.init-filetree',
  importFile = 'files.import',
  importFileFulfilled = 'files.import_FULFILLED',
  importFilePending = 'files.import_PENDING',
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

export interface IImportFileFulfilled extends Action {
  type: fileTreeActions.importFileFulfilled
  payload: any
}
export interface IImportFilePending extends Action {
  type: fileTreeActions.importFilePending
  payload: any
}
