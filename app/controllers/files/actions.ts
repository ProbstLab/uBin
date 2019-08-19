import {
  fileTreeActions,
  IAddFile,
  IImportFile,
  IImportFileFulfilled,
  IImportFilePending,
  IInitFileTree,
  IISaveExportFile,
  IISetImportName,
  IOpenFile,
  IPopulateFileTree,
  IRemoveAddedFile,
  IISaveExportFilePending,
  IISaveExportFileRejected,
  IISaveExportFileFulfilled,
  IImportFastaFilePending,
  IImportFastaFileFulfilled,
  IImportFastaFile,
  IImportFastaFileRejected,
} from './interfaces'
import {IFile} from 'files'
import {Connection} from 'typeorm'
import {importFiles} from '../../utils/fileImport'
import {importFastaFile} from '../../utils/fastaFileImport'
import {exportData} from '../../utils/fileExport'
import {Taxonomy} from '../../db/entities/Taxonomy'
import {Bin} from '../../db/entities/Bin'
import {IValueMap} from 'common'
import {IGenericAssociativeArray} from '../../utils/interfaces'

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

  static importFastaFile(file: string): IImportFastaFile {
    return {type: fileTreeActions.importFastaFile, payload: importFastaFile(file)}
  }
  static importFastaFilePending(payload: any): IImportFastaFilePending {
    return {type: fileTreeActions.importFastaFilePending, payload}
  }
  static importFastaFileFulfilled(payload: any): IImportFastaFileFulfilled {
    return {type: fileTreeActions.importFastaFileFulfilled, payload}
  }
  static importFastaFileRejected(payload: any): IImportFastaFileRejected {
    return {type: fileTreeActions.importFastaFileRejected, payload}
  }

  static setImportName(importName: string): IISetImportName {
    return {type: fileTreeActions.setImportName, importName}
  }

  static saveExportFile(exportDir: string, exportName: string, taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>,
                        recordId: number, connection: Connection, fastaDict?: IGenericAssociativeArray): IISaveExportFile {
    return {type: fileTreeActions.saveExportFile, payload: exportData(exportDir, exportName, taxonomies, bins, recordId, connection, fastaDict)}
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
