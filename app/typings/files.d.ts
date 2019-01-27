declare module 'files' {

  import * as IconNames from '@blueprintjs/icons/lib/esm/generated/iconNames'
  type MaybeElement = JSX.Element | false | null | undefined
  type IconName = (typeof IconNames)[keyof typeof IconNames]

  interface IFileBase {
    id: string
    filePath: string
    label: string
    secondaryLabel?: string | MaybeElement
    isExpanded: boolean
    icon?: IconName | MaybeElement
    hasCaret?: boolean
  }

  interface IFile extends IFileBase {
    childNodes?: IFile[]
    isDirectory: boolean
    readPerm?: boolean
    isSelected: boolean
  }

  interface IFileTree {
    id: string
    rootFiles: IFile[]
  }

  interface IFileFilter {
    filtered: string[]
  }

  interface IFileData {
    data: string[]
  }

  const enum FilesActionTypes {
    FETCH_FILES = '@@files/FETCH_FILES',
    FETCH_SUCCESS = '@@files/FETCH_SUCCESS'
  }
}
