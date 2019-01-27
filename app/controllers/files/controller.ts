import {
  IAddFile,
  IFileTreeState,
  IImportFileFulfilled,
  IInitFileTree,
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

  // fs.readdir(dir, (err, items) => {
  //   if (!err) {
  //     items.map((label: string) => {
  //       const fullPath = dir + label
  //       fs.stat(fullPath, (err, stats) => {
  //         if (!err) {
  //           nodes.push({ id: stats.ino, isDirectory: stats.isDirectory(), label: label, filePath: fullPath })
  //         }
  //       })
  //     })
  //   } else {
  //     console.log('err: ', err)
  //   }
  // })
  return files
}

// export const generateFileTreeObjectAsync = (dir: string): Promise<IFile[]> => {
//   dir = dir.endsWith('/') ? dir : dir + '/'
//   return readDirAsync(dir)
//     .then((fileNamesArr: any[]) => {
//       const fileStatPromises = fileNamesArr.map((fileName: string) => {
//         const fullPath = dir + fileName
//         return statAsync(fullPath)
//           .then((stats: Stats) => {
//             let file: IFile = {
//               filePath: '', isDirectory: stats.isDirectory(),
//               label: fileName, id: stats.gid.toString() }
//             fs.access(fullPath, fs.constants.R_OK, generateFileTreeObjectErr => {
//               file.readPerm = !generateFileTreeObjectErr
//             })
//             return file
//           })
//       })
//       return Promise.all(fileStatPromises)
//     })
// }

// const generateFileTreeObject = (dir: string) : Promise<any[]> => {
//   dir = dir.endsWith('/') ? dir : dir + '/'
//   return readDirAsync(dir)
//     .then((fileNamesArr : any[]) => {
//       const fileStatPromises = fileNamesArr.map((label : string) => {
//         const fullPath = dir + label;
//         return statAsync(fullPath)
//           .then((stats : Stats) : any => {
//             fs.access(fullPath, fs.constants.R_OK, (err) => {
//               if (!err) {
//                 const file: IFile = {
//                   id: fullPath, filePath: fullPath,
//                   isFile: stats.isFile(), nodes: [], label: label
//                 }
//                 if (!file.isFile) {
//                   return generateFileTreeObject(file.filePath)
//                     .then(fileNamesSubArr => {
//                       file.nodes = fileNamesSubArr
//                     })
//                 }
//                 return file
//               }
//             })
//           })IPopulate{FileTree
//       })
//       return Promise.all(fileStatPromises)
//     })
// }

export const initFileTree = (state: IFileTreeState, action: IInitFileTree): IFileTreeState => {
  // const nodes: Promise<IFile[]> = generateFileTreeObjectAsync(action.dir)
  // console.log('Val: ', nodes.then((val: IFile[]) => ({ val })))
  // console.log('Stuff: ', generateFileTreeObject(action.dir))
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
    isImportingFiles: true
  }
}
export const importFileFulfilled = (state: IFileTreeState, action: IImportFileFulfilled): IFileTreeState => {
  return {
    ...state,
    isImportingFiles: false
  }
}
