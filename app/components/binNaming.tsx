
import * as React from 'react'
import {remote} from 'electron'
import {Button, Dialog, InputGroup, Classes, ProgressBar, ButtonGroup, Tooltip, Label} from '@blueprintjs/core'
import {Taxonomy} from '../db/entities/Taxonomy'
import {IClientState} from '../controllers'
import {getBinsMap, getConsensus, getCoverageAverage, getGCAverage, getSelectedBin, IImportRecord, SamplesActions} from '../controllers/samples'
import {AnyAction, bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {ThunkAction} from 'redux-thunk'
import {getDeletingBinState, getSavingBinState} from '../controllers/database'
import {UBinToaster} from '../utils/uBinToaster'
import {FileTreeActions, getExportState, getFastaDict, getFastaImportState} from '../controllers/files'
import {Bin} from '../db/entities/Bin'
import {IValueMap} from 'common'
import {Connection} from 'typeorm'
import {IBin} from 'samples'
import {IGenericAssociativeArray} from '../utils/interfaces'

interface IPropsFromState {
  consensus?: Taxonomy
  gcAverage?: number
  coverageAverage?: number
  savingBinState?: string
  deletingBinState?: string
  bins?: IValueMap<Bin>
  exportState?: string
  fastaDict?: IGenericAssociativeArray
  isImportingFastaFile: boolean
  connection?: Connection
  selectedBin?: IBin
}

interface IActionsFromState {
  setConsensusName(consensusName: string): void
  setSampleName(sampleName: string): void
  saveBin(): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  deleteSelectedBin(bin: Bin): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  saveExportFile(exportDir: string, exportName: string, taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>, activeRecord: IImportRecord,
                 connection: Connection, fastaDict?: IGenericAssociativeArray): void
  importFastaFile(file: string): void
}

interface IProps {
  data?: any[]
  taxonomies?: IValueMap<Taxonomy>
  dataLoaded: boolean
  activeRecord?: IImportRecord
}

interface IState {
  consensusName: string
  sampleName: string
  isOpen: boolean
  isDeleteDialogOpen: boolean
  exportFilePath?: string
  exportFileName?: string
  fastaInputFilePath?: string
}

type TProps = IPropsFromState & IActionsFromState & IProps

class CBinNaming extends React.PureComponent<TProps> {
  currConsensusName?: string
  currSampleName?: string
  currSavingBinState?: string
  currDeletingBinState?: string
  currExportState?: string

  public state: IState = {
    consensusName: '',
    sampleName: '',
    isOpen: false,
    isDeleteDialogOpen: false,
  }

  private handleOpen = () => this.setState({ isOpen: true })
  private handleClose = () => this.setState({ isOpen: false })
  private handleDeleteDialogOpen = () => this.setState({ isDeleteDialogOpen: true })
  private handleDeleteDialogClose = () => this.setState({ isDeleteDialogOpen: false })
  private handleExportFileNameChange = (name: string) => this.setState({ exportFileName: name })
  private openDirBrowser = (): void => {
    const dirPath: string[]|undefined = remote.dialog.showOpenDialog({properties: ['openDirectory']})
    if (dirPath && dirPath.length) {
      this.setState({exportFilePath: dirPath[0]})
    }
  }
  private openFastaBrowser = (): void => {
    let {importFastaFile} = this.props
    const fastaPath: string[]|undefined = remote.dialog.showOpenDialog({properties: ['openFile'],
                                                                                filters: [{name: 'Fasta', extensions: ['fasta']}] })
    if (fastaPath && fastaPath.length) {
      this.setState({fastaInputFilePath: fastaPath[0]})
      importFastaFile(fastaPath[0])
      // console.log(fastaPath[0])
    }
  }
  private startExport = (): void => {
    let {saveExportFile, bins, taxonomies, activeRecord, connection, fastaDict} = this.props
    let {exportFilePath, exportFileName} = this.state
    if (exportFilePath && exportFileName && taxonomies && bins && activeRecord && connection) {
      saveExportFile(exportFilePath, exportFileName, taxonomies, bins, activeRecord, connection, fastaDict)
    }
  }

  private startDeleteBin = (): void => {
    let {deleteSelectedBin, selectedBin} = this.props
    if (selectedBin) {
      deleteSelectedBin(selectedBin as Bin)
    }
  }

  public componentWillMount(): void {
    let {consensus, activeRecord} = this.props
    if (consensus) {
      this.setState({consensusName: consensus.name})
      this.setState({exportFileName: activeRecord ? activeRecord.name : ''})
    }
  }

  public componentWillUpdate(): void {
    let {consensus, activeRecord} = this.props
    if (consensus && consensus.name !== this.currConsensusName) {
      this.currConsensusName = consensus.name
      this.setState({consensusName: consensus.name})
      this.props.setConsensusName(consensus.name)
    }
    if (activeRecord && activeRecord.name !== this.currSampleName) {
      this.currSampleName = activeRecord.name
      this.setState({sampleName: activeRecord.name})
      this.props.setSampleName(activeRecord.name)
      this.setState({exportFileName: activeRecord ? activeRecord.name : ''})
    }
  }
  public componentDidUpdate(): void {
    let {savingBinState, deletingBinState, exportState} = this.props
    if (savingBinState && this.currSavingBinState === 'pending' && savingBinState !== this.currSavingBinState) {
      switch (savingBinState) {
        case 'rejected':
          UBinToaster.show({message: 'Saving bin failed', icon: 'error', intent: 'danger'})
          break
        case 'fulfilled':
          UBinToaster.show({message: 'Bin has been saved!', icon: 'tick', intent: 'success'})
          break
      }
    }
    if (deletingBinState && this.currDeletingBinState === 'pending' && deletingBinState !== this.currDeletingBinState) {
      switch (deletingBinState) {
        case 'rejected':
          UBinToaster.show({message: 'Deleting bin failed', icon: 'error', intent: 'danger'})
          this.handleDeleteDialogClose()
          break
        case 'fulfilled':
          UBinToaster.show({message: 'Bin has been deleted!', icon: 'tick', intent: 'success'})
          this.handleDeleteDialogClose()
          break
      }
    }
    if (exportState && this.currExportState === 'pending' && exportState !== this.currExportState) {
      switch (exportState) {
        case 'rejected':
          UBinToaster.show({message: 'Export failed', icon: 'error', intent: 'danger'})
          break
        case 'fulfilled':
          UBinToaster.show({message: 'Export finished!!', icon: 'tick', intent: 'success'})
          break
      }
    }
    this.currSavingBinState = savingBinState
    this.currDeletingBinState = deletingBinState
    this.currExportState = exportState
  }

  public handleConsensusChange(e: any): void {
    this.setState({consensusName: e.target.value})
    this.props.setConsensusName(e.target.value)
  }
  public handleSampleName(e: any): void {
    this.setState({sampleName: e.target.value})
    this.props.setSampleName(e.target.value)
  }
  render(): JSX.Element {
    let {dataLoaded, gcAverage, coverageAverage, savingBinState, exportState, selectedBin, isImportingFastaFile, activeRecord} = this.props
    let {consensusName, sampleName, exportFilePath, fastaInputFilePath, exportFileName, isOpen, isDeleteDialogOpen} = this.state
    return (
      <>
        <InputGroup disabled={!dataLoaded} onChange={(e: any) => this.handleSampleName(e)} value={sampleName} name={'sample_name'} placeholder={'Name'}/><span style={{padding: '2px'}}></span>
        <InputGroup disabled={!dataLoaded} onChange={(e: any) => this.handleConsensusChange(e)} value={consensusName} name={'consensus'} placeholder={'Consensus'}/><span style={{padding: '2px'}}></span>
        <InputGroup style={{width: '38px'}} disabled={!dataLoaded} readOnly={true} value={gcAverage ? gcAverage.toString() : ''} name={'avg_gc'} placeholder={'GC Avg.'}/><span style={{padding: '2px'}}></span>
        <InputGroup style={{width: '52px'}} disabled={!dataLoaded} readOnly={true} value={coverageAverage ? coverageAverage.toString() : ''} name={'avg_coverage'} placeholder={'Coverage Avg.'}/><span style={{padding: '2px'}}></span>
        <ButtonGroup minimal={true}>
          <Button style={{minWidth: '80px'}} disabled={!dataLoaded} loading={savingBinState === 'pending'} onClick={this.props.saveBin} intent={'success'} text={'Save Bin'}/>
          <Tooltip content={'Delete the currently selected bin.'}>
            <Button disabled={!dataLoaded || !selectedBin} icon={'trash'} intent={'danger'} onClick={this.handleDeleteDialogOpen}/>
          </Tooltip>
        </ButtonGroup>
        <Button minimal={true} style={{minWidth: '80px'}} disabled={!dataLoaded} rightIcon={'export'} onClick={this.handleOpen} text={'Export'}/>

        <Dialog
          icon='export'
          onClose={this.handleClose}
          title='Export'
          isOpen={isOpen}>
          <div className={Classes.DIALOG_BODY}>
            <InputGroup style={{margin: '4px 0'}} value={exportFileName ? exportFileName : activeRecord ? activeRecord.name : ''}
                        placeholder={' Type in your file name...'} onChange={(e: any) => this.handleExportFileNameChange(e.target.value)}/>
            <InputGroup readOnly={true} placeholder={exportFilePath ? exportFilePath : 'Choose directory...'} rightElement={
              <Button text={'Browse'} onClick={this.openDirBrowser}/>
            }/>
            <Label style={{marginTop: '10px'}}>
              .fasta input file (optional)
              <InputGroup readOnly={true} placeholder={fastaInputFilePath ? fastaInputFilePath : 'Choose .fasta file...'} rightElement={
                <Button text={'Browse'} onClick={this.openFastaBrowser}/>
              }/>
            </Label>
            <Button style={{marginTop: '10px'}} disabled={!exportFilePath || !exportFileName} intent={'primary'} text={'Save'}
                    onClick={() => this.startExport()}/>
          </div>
          {((!!exportState && exportState === 'pending') || isImportingFastaFile) &&
          <div className={Classes.DIALOG_FOOTER}>
              <ProgressBar intent={'primary'}/>
          </div>
          }
        </Dialog>

        <Dialog icon={'trash'} onClose={this.handleDeleteDialogClose} title={'Delete Bin'} isOpen={isDeleteDialogOpen}>
          <div className={Classes.DIALOG_BODY}>
            <p>Are you sure that you want to delete<br/>{selectedBin ? selectedBin.name : <b>undefined</b>}?</p>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button text={'Close'} onClick={this.handleDeleteDialogClose}/>
              <Tooltip content={'The selected bin will be permanently deleted!'}>
                <Button intent={'danger'} rightIcon={'trash'} text={'Delete'} onClick={() => this.startDeleteBin()}/>
              </Tooltip>
            </div>
          </div>
        </Dialog>
        </>
    )}
  }

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  consensus: getConsensus(state),
  gcAverage: getGCAverage(state),
  coverageAverage: getCoverageAverage(state),
  savingBinState: getSavingBinState(state),
  deletingBinState: getDeletingBinState(state),
  bins: getBinsMap(state),
  selectedBin: getSelectedBin(state),
  exportState: getExportState(state),
  fastaDict: getFastaDict(state),
  isImportingFastaFile: getFastaImportState(state),
  connection: state.database.connection,
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      setConsensusName: consensusName => SamplesActions.setConsensusName(consensusName),
      setSampleName: sampleName => SamplesActions.setSampleName(sampleName),
      saveExportFile: (exportDir: string, exportName: string, taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>, activeRecord: IImportRecord, connection: Connection, fastaDict?: IGenericAssociativeArray) =>
                      FileTreeActions.saveExportFile(exportDir, exportName, taxonomies, bins, activeRecord, connection, fastaDict),
      importFastaFile: (file: string) => FileTreeActions.importFastaFile(file),
      deleteSelectedBin: SamplesActions.deleteBin,
      saveBin: SamplesActions.saveBin,
    },
    dispatch,
  )

export const BinNaming =
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CBinNaming)