import * as React from 'react'
import { IFile } from 'files'
import {Icon} from '@blueprintjs/core'

interface IProps {
  file: IFile
  openFile(file: IFile): void
}

export class FileTree extends React.Component<IProps> {

  openFile = (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation()
    this.props.openFile(this.props.file)
  }
  render(): JSX.Element {
    const { file } = this.props
    const { childNodes } = file
    const iconName = !file.isDirectory ? 'document' : file.isExpanded ? 'folder-open' : 'folder-close'
    return (
      <li onClick={this.openFile}>
        <span>
          <Icon icon={ iconName }/> { file.label }
        </span>
        { !file.isDirectory &&
          <span style={{float: 'right'}}>
          {/*<Button icon='add' minimal={true} small={true}>Add</Button>*/}
            <Icon icon='add' className='hoverIcon' iconSize={16}/>
          </span>
        }
        {childNodes && (<ul className='file-tree'>
        { childNodes.map((child: IFile) => (
         <FileTree key={child.id} file={child} openFile={this.props.openFile}/>
        ))}
        </ul>)}
      </li>
    )
  }
}
