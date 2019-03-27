import {
  fileTreeActions,
  IAddFile,
  IImportFile,
  IImportFileFulfilled, IImportFilePending,
  IInitFileTree, IISetImportName,
  IOpenFile,
  IPopulateFileTree,
  IRemoveAddedFile,
} from './interfaces'
import {IFile} from 'files'
import {Connection} from "typeorm";
import {importFiles} from '../../utils/fileImport';

export class FileTreeActions {
  static populateFileTree(file: IFile): IPopulateFileTree {
    return { file, type: fileTreeActions.populateFileTree }
  }
  static initFileTree(dir: string): IInitFileTree {
    return {dir, type: fileTreeActions.initFileTree }
  }
  static openFile(file: IFile): IOpenFile {
    return {file, type: fileTreeActions.openFile }
  }
  static addFile(file: IFile): IAddFile {
    return {file, type: fileTreeActions.addFile }
  }
  static removeAddedFile(file: IFile): IRemoveAddedFile {
    return {file, type: fileTreeActions.removeAddedFile }
  }
  static importFile(addedFiles: IFile[], connection: Connection, importName: string): IImportFile {
    return {type: fileTreeActions.importFile, payload: importFiles(addedFiles, connection, importName)}
  }
  static importFilePending(payload: any): IImportFilePending {
    return {type: fileTreeActions.importFilePending, payload}
  }
  static importFileFulfilled(payload: any): IImportFileFulfilled {
    return {type: fileTreeActions.importFileFulfilled, payload}
  }
  static setImportName(importName: string): IISetImportName {
    return {type: fileTreeActions.setImportName, importName}
  }
}
