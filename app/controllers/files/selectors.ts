import { createSelector } from 'reselect'
// import * as _ from 'lodash'
import { IFileTreeState } from './interfaces'
import { IClientState } from '..'
import { IFile } from 'files'
import {IValueMap} from "common";


const getFileTreeState = (state: IClientState) => state.fileTree

const getFileTreeMap = createSelector(
  getFileTreeState,
  (state: IFileTreeState) => state.fileTree,
)

const getAdddedFilesMap = createSelector(
  getFileTreeState,
  (state: IFileTreeState) => state.addedFiles,
)

// const getFileTreeFilter = createSelector(
//   getFileTreeState,
//   (state: IFileTreeState) => state.filter,

// )

export const getFileTreeAsArray = createSelector(
  getFileTreeMap,
  (fileTree: IFile[]) => {
    if (fileTree){
      return Object.keys(fileTree).map((value: string, index: number) => fileTree[index])
    }
    return []
  },
)


export const getAddedFiles = createSelector(
  getAdddedFilesMap,
  (addedFiles: IValueMap<IFile>) => Object.keys(addedFiles).map(id => addedFiles[id]),
)

export const getAddedFilesArray = createSelector(
  getAdddedFilesMap,
  (addedFiles: IValueMap<IFile>) => Object.keys(addedFiles).map((e, i) => addedFiles[i]),
)

// export const getFilteredFileTree = createSelector(
//   getFileTreeMap,
//   (nodes: IFile[]) => Object.keys(nodes).map(id => nodes[id]),
// )
