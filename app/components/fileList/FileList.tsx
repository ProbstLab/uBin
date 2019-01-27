import * as React from 'react'
import { IFile } from 'files'
import {File} from "./File";

interface IProps {
  files: IFile[]
}

interface IActions {
  removeAddedFile(file: IFile): void
}

type TProps = IProps & IActions

export class FileList extends React.Component<TProps> {

  render(): JSX.Element {
    const { files } = this.props
    return (
      <ul style={{ margin: '8px'}} className='bp3-tree-node-list bp3-tree-root'>
        { files.map((file: IFile, index: number) => (
          <File file={file} removeAddedFile={this.props.removeAddedFile} key={index}/>
        ))}
      </ul>
    )
  }
}
