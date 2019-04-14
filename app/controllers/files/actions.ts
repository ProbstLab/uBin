import {
  fileTreeActions,
  IAddFile,
  IImportFile,
  IImportFileFulfilled, IImportFilePending,
  IInitFileTree, IISaveExportFile, IISetImportName,
  IOpenFile,
  IPopulateFileTree,
  IRemoveAddedFile,
  IISaveExportFilePending, IISaveExportFileRejected, IISaveExportFileFulfilled,
} from './interfaces'
import {IFile} from 'files'
import {Connection} from "typeorm"
import {importFiles} from '../../utils/fileImport'
import {exportData} from '../../utils/fileExport'
import {Taxonomy} from '../../db/entities/Taxonomy'
import {Bin} from '../../db/entities/Bin'
import {IValueMap} from "common"

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

  static saveExportFile(exportDir: string, exportName: string, taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>,
                        recordId: number, connection: Connection): IISaveExportFile {
    return {type: fileTreeActions.saveExportFile, payload: exportData(exportDir, exportName, taxonomies, bins, recordId, connection)}
  }
  static saveExportFilePending(payload: any): IISaveExportFilePending {
    return {type: fileTreeActions.saveExportFilePending, payload}
  }
  static saveExportFileRejected(payload: any): IISaveExportFileRejected {
    return {type: fileTreeActions.saveExportFileRejected, payload}
  }
  static saveExportFileFulfilled(payload: any): IISaveExportFileFulfilled {
    return {type: fileTreeActions.saveExportFileFulfilled, payload}
  }
}
