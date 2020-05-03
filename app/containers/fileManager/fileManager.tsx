import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { IClientState } from '../../controllers'
import {FileTreeActions, getAddedFiles, getFileTreeAsArray} from '../../controllers/files'
import {Callout, Classes, ITreeNode, Card, Button, Dialog, ProgressBar, InputGroup, Tag, RadioGroup, Radio} from '@blueprintjs/core'
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
  startFileImport(addedFiles: IFile[], connection: Connection, importName: string, importSetting?: number): void
}

interface IFileManagerState {
  numFilesRequired: number,
  importName: string,
  importNameLength: number
  importNameLengthReached: boolean
  citationMessageOpen: boolean
  importSetting: number
}

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

  public state: IFileManagerState = {
    numFilesRequired: 2,
    importName: '',
    importNameLength: 6,
    importNameLengthReached: false,
    citationMessageOpen: false,
    importSetting: 0
  }

  public componentDidMount(): void {
    if (!this.props.fileTree.length) {this.props.initFileTree('')}
  }

  componentDidUpdate(prevProps: TProps): void {
    if (prevProps.isImportingFiles && !this.props.isImportingFiles) {
      this.toggleCitationMessage()
    }
  }

  private handleImportNameChange = (value: string) => this.setState({importNameLengthReached: value.length >= this.state.importNameLength,
                                                                    importName: value})

  private handleImportSettingChange = (value: string) => this.setState({importSetting: parseInt(value, 10)})

  render(): JSX.Element {
    const { fileTree, addedFiles } = this.props
    const { numFilesRequired, importNameLength, importNameLengthReached, importName, importSetting } = this.state
    const charactersLeft = <Tag intent={importNameLengthReached ? 'success' : undefined} rightIcon={ importNameLengthReached ? 'tick' : undefined}
                                minimal={true}>{importNameLengthReached ? 'Valid name' : <span>{importNameLength - importName.length} Characters left</span>}</Tag>
    const enableImport = (): boolean => numFilesRequired === addedFiles.length && importNameLengthReached
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
            <Callout intent={(numFilesRequired - addedFiles.length) > 0 ?  'warning' : 'success'}>
              Add your taxonomy file first, then .tsv, .csv or .txt of second dataset ({numFilesRequired - addedFiles.length} files remaining)
            </Callout>
            <Callout style={{marginTop: '6px'}} intent={!importNameLengthReached ? 'warning': 'success'}>
              Choose a name for your import
            </Callout>
            <div style={{marginTop: '16px'}}>
              <InputGroup type={'text'} placeholder={'Name your import'} rightElement={charactersLeft}
                          onChange={(event: any) => this.handleImportNameChange(event.target.value)}/>
            </div>
            <div>
              <h4>Import settings</h4>
              <RadioGroup onChange={(event: any) => this.handleImportSettingChange(event.target.value)} selectedValue={importSetting}>
                <Radio label={'Everything'} value={0}/>
                <Radio label={'Binned scaffolds'} value={1}/>
                <Radio label={'Unbinned scaffolds'} value={2}/>
              </RadioGroup>
            </div>
            <FileList files={addedFiles} removeAddedFile={this.props.removeAddedFile}/>
            <Button icon='import' disabled={!enableImport()} intent='primary'
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

  private toggleCitationMessage(): void {
    let {citationMessageOpen} = this.state
    this.setState({citationMessageOpen: !citationMessageOpen})
  }

  private toggleDialog(isOpen: boolean): void {
    if (this.props.connection && isOpen) {
      this.props.startFileImport(this.props.addedFiles, this.props.connection, this.state.importName, this.state.importSetting)
    }
  }
}

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  fileTree: getFileTreeAsArray(state),
  addedFiles: getAddedFiles(state),
  isImportingFiles: state.fileTree.isImportingFiles,
  connection: state.database.connection,
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      initFileTree: val => FileTreeActions.initFileTree(val),
      openFile: file => FileTreeActions.openFile(file),
      addFile: file => FileTreeActions.addFile(file),
      removeAddedFile: file => FileTreeActions.removeAddedFile(file),
      startFileImport: (addedFiles, connection, importName, importSetting) => FileTreeActions.importFile(addedFiles, connection, importName, importSetting),
    },
    dispatch,
  )

export const FileManager = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CFileManager),
)
