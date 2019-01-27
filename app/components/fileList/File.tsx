import * as React from 'react'
import { IFile } from 'files'
import {Icon} from '@blueprintjs/core';

interface IProps {
  file: IFile
}

interface IActions {
  removeAddedFile(file: IFile): void
}

type TProps = IProps & IActions

export class File extends React.Component<TProps> {

  removeFile = (event: React.MouseEvent<HTMLElement>): void => this.props.removeAddedFile(this.props.file)

  render(): JSX.Element {
    const { file } = this.props
    return (
      <li className='bp3-tree-node'>
        <div className='bp3-tree-node-content bp3-tree-node-content-0'>
          <Icon icon='document' className='bp3-tree-node-icon'/>
          <span className='bp3-tree-node-label'>{file.label}</span>
          <span className='bp3-tree-node-secondary-label'>
          <Icon icon='delete' className='hoverIcon' onClick={this.removeFile}/>
        </span>
        </div>
      </li>
    )
  }
}
