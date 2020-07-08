import * as React from 'react'
import { IFile } from 'files'
import {File} from "./File";

// Component to list the files added for import

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
      <ul style={{margin: '20px 0', padding: '4px', border: 'solid #dadada 1px', borderRadius: '4px'}} className='bp3-tree-node-list bp3-tree-root'>
        {!files.length && <li style={{padding: '4px'}}>Double-click on files to add them.</li>}
        { files.map((file: IFile, index: number) => (
          <File file={file} removeAddedFile={this.props.removeAddedFile} key={index}/>
        ))}
      </ul>
    )
  }
}
