import {
  IAddFile,
  IFileTreeState,
  IImportFileFulfilled,
  IInitFileTree, IISetImportName,
  IOpenFile,
  IPopulateFileTree,
  IRemoveAddedFile,
} from './interfaces'
import * as fs from 'fs'
import { IFile } from 'files'
import { Stats } from 'fs'
import * as mimeType from 'mime-types'
import {Icon} from '@blueprintjs/core'
import * as React from 'react'
import * as _ from 'lodash'

const generateKey = (pre: string): string => {
  return `${ pre }_${ new Date().getTime() }`
}

export const getInitialState = (): IFileTreeState => ({
  addedFiles: {},
  isImportingFiles: false
})

export const populateFileTree = (state: IFileTreeState, action: IPopulateFileTree): IFileTreeState => {
  return {
    ...state,
    // fileTree: {
    //   ...state.fileTree,
    //   [action.file.id]: action.file
    // }
  }
}

export const generateFileTreeObject = (dir: string): IFile[] => {
  dir = dir.endsWith('/') ? dir : dir + '/'
  let files: IFile[] = []
  let filesFound: string[] = fs.readdirSync(dir).filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
  filesFound.map((fileName: string) => {
    const fullPath = dir + fileName
    try {
      const stats: Stats = fs.statSync(fullPath)
      if (stats) {
        if (stats.isFile() && ['text/csv', 'text/plain'].some((a: string) => a === mimeType.lookup(fullPath))){
          files.push({
            id: generateKey(fileName), isDirectory: false, label: fileName,
            filePath: fullPath, isExpanded: false, icon: 'document', isSelected: false,
            secondaryLabel: React.createElement(Icon, {icon: 'add', className: 'hoverIcon', iconSize: 16})})
        } else if (stats.isDirectory()) {
          files.push({
            id: generateKey(fileName), isDirectory: true, label: fileName, isSelected: false,
            filePath: fullPath, isExpanded: false, icon: 'folder-close', hasCaret: true})
        }
      }
    } catch (e) {}
  })
  return files
}

export const initFileTree = (state: IFileTreeState, action: IInitFileTree): IFileTreeState => {
  return {
    ...state,
    fileTree: {
      ...generateFileTreeObject(action.dir),
    },
  }
}

export const openFile = (state: IFileTreeState, action: IOpenFile): IFileTreeState => {
  if (!action.file.isExpanded) {
    action.file.childNodes = generateFileTreeObject(action.file.filePath)
  }
  action.file.isExpanded = !action.file.isExpanded
  return {
    ...state,
  }
}

export const addFile = (state: IFileTreeState, action: IAddFile): IFileTreeState => {
  return {
    ...state,
    addedFiles: {
      ...state.addedFiles,
      [action.file.id]: action.file,
    },
  }
}

export const removeAddedFiles = (state: IFileTreeState, action: IRemoveAddedFile): IFileTreeState => {
  return {
    ...state,
    addedFiles: {
      ..._.pickBy(state.addedFiles, (val, key) => key !== action.file.id),
    },
  }
}

export const importFilePending = (state: IFileTreeState, action: IImportFileFulfilled): IFileTreeState => {
  return {
    ...state,
    isImportingFiles: true,
  }
}
export const importFileFulfilled = (state: IFileTreeState, action: IImportFileFulfilled): IFileTreeState => {
  return {
    ...state,
    isImportingFiles: false,
  }
}

export const setImportName = (state: IFileTreeState, action: IISetImportName): IFileTreeState => {
  return {
    ...state,
    importName: action.importName,
  }
}