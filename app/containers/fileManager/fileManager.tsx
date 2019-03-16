import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { IClientState } from '../../controllers'
import {FileTreeActions, getAddedFiles, getFileTreeAsArray} from '../../controllers/files'
import {Callout, Classes, ITreeNode, Card, Button, Dialog, ProgressBar} from '@blueprintjs/core'
import {IFile} from 'files'
import {UBinTree} from '../../components/uBinTree'
import {FileList} from '../../components/fileList/FileList'
import {Connection} from 'typeorm'

interface IProps extends RouteComponentProps {
}

interface IPropsFromState {
  fileTree: IFile[],
  addedFiles: IFile[],
  isImportingFiles: boolean,
  connection: Connection | undefined
}

interface IActionsFromState {
  initFileTree(dir: string): void
  openFile(file: IFile): void
  addFile(file: IFile): void
  removeAddedFile(file: IFile): void
  startFileImport(addedFiles: IFile[], connection: Connection): void
}

interface IFileManagerState {}

const fileManagerStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'left',
  margin: '0',
  marginTop: '64px',
  height: 'calc(100vh - 74px)',
} as React.CSSProperties

const fileTreeStyle = {
  minWidth: '400px',
  maxWidth: '40%',
  height: '100%',
  overflow: 'scroll',
} as React.CSSProperties

const fileImportStyle = {
  // width: '100%',
} as React.CSSProperties

type TProps = IProps & IPropsFromState & IActionsFromState

class CFileManager extends React.Component<TProps> {

  importingFiles: boolean = false

  public state: IFileManagerState = {}

  public componentDidMount(): void {
    if (!this.props.fileTree.length) {this.props.initFileTree('/home/tim/')}
  }

  render(): JSX.Element {
    const { fileTree } = this.props
    const { addedFiles } = this.props
    return (
      <div style={fileManagerStyle}>
        <Callout title={'Files'} style={fileTreeStyle}>
          <UBinTree
            contents={fileTree}
            onNodeClick={this.handleNodeClick}
            onNodeCollapse={this.handleNodeCollapse}
            onNodeExpand={this.handleNodeExpand}
            className={Classes.ELEVATION_0}
            onNodeDoubleClick={this.addNodeOnDoubleClick}
          />
        </Callout>
        <div style={fileImportStyle}>
          <Card style={{ margin: '8px'}}>
            <h4>Import</h4>
            <Callout intent={'warning'}>
              Add taxonomy file first, then .csv or .txt of second dataset ({2 - addedFiles.length} files remaining)
            </Callout>
            <FileList files={addedFiles} removeAddedFile={this.props.removeAddedFile}/>
            <Button icon='import' disabled={addedFiles.length !== 2} intent='primary'
                    onClick={() => this.toggleDialog(true)}>Import</Button>
          </Card>
          <Dialog isOpen={this.props.isImportingFiles} onClose={() => this.toggleDialog(false)} icon='import'
                  title='Importing Data'>
            <div className={Classes.DIALOG_BODY}>
              <h4>Importing Files...</h4>
              <ProgressBar intent='primary'/>
            </div>
          </Dialog>
        </div>
      </div>
    )
  }

  private handleNodeClick = (nodeData: ITreeNode, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    const originallySelected = nodeData.isSelected
    if (!e.shiftKey) {
      this.forEachNode(this.props.fileTree, n => (n.isSelected = false))
    }
    nodeData.isSelected = originallySelected == null ? true : !originallySelected
    this.setState(this.state)
  }

  private handleNodeCollapse = (nodeData: IFile) => {
    this.props.openFile(nodeData)
    nodeData.isExpanded = false
    this.setState(this.state)
  }

  private handleNodeExpand = (nodeData: IFile) => {
    this.props.openFile(nodeData)
    nodeData.isExpanded = true
    this.setState(this.state)
  }

  private addNodeOnDoubleClick = (nodeData: IFile) => {
    if (!nodeData.isDirectory && this.props.addedFiles.length < 2) {
      this.props.addFile(nodeData)
    }
  }

  private forEachNode(nodes: IFile[] | undefined, callback: (node: IFile) => void): void {
    if (!nodes) {
      return
    }

    for (const node of nodes) {
      callback(node)
      this.forEachNode(node.childNodes, callback)
    }
  }

  private toggleDialog(isOpen: boolean): void {
    if (this.props.connection) {
      this.props.startFileImport(this.props.addedFiles, this.props.connection)
    }
  }
}

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  fileTree: getFileTreeAsArray(state),
  addedFiles: getAddedFiles(state),
  isImportingFiles: state.fileTree.isImportingFiles,
  connection: state.database.connection
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      initFileTree: val => FileTreeActions.initFileTree(val),
      openFile: file => FileTreeActions.openFile(file),
      addFile: file => FileTreeActions.addFile(file),
      removeAddedFile: file => FileTreeActions.removeAddedFile(file),
      startFileImport: (addedFiles, connection) => FileTreeActions.importFile(addedFiles, connection)
    },
    dispatch,
  )

export const FileManager = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CFileManager),
)
