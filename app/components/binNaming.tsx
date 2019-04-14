
import * as React from 'react'
import {remote} from 'electron'
import {Button, Dialog, InputGroup, Classes, ProgressBar} from '@blueprintjs/core'
import {Taxonomy} from '../db/entities/Taxonomy'
import {IClientState} from '../controllers'
import {getBinsMap, getConsensus, getCoverageAverage, getGCAverage, IImportRecord, SamplesActions} from '../controllers/samples'
import {AnyAction, bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {ThunkAction} from 'redux-thunk'
import {getSavingBinState} from '../controllers/database'
import {UBinToaster} from '../utils/uBinToaster'
import {FileTreeActions, getExportState} from '../controllers/files'
import {Bin} from '../db/entities/Bin'
import {IValueMap} from "common"
import {Connection} from 'typeorm'

interface IPropsFromState {
  consensus?: Taxonomy
  gcAverage?: number
  coverageAverage?: number
  savingBinState?: string
  bins?: IValueMap<Bin>
  exportState?: string
  connection?: Connection
}

interface IActionsFromState {
  setConsensusName(consensusName: string): void
  setSampleName(sampleName: string): void
  saveBin(): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  saveExportFile(exportDir: string, exportName: string, taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>, recordId: number, connection: Connection): void
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
  exportFilePath?: string
  exportFileName?: string
}

type TProps = IPropsFromState & IActionsFromState & IProps

class CBinNaming extends React.PureComponent<TProps> {
  currConsensusName?: string
  currSampleName?: string
  currSavingBinState?: string
  currExportState?: string

  public state: IState = {
    consensusName: '',
    sampleName: '',
    isOpen: false,
  }

  private handleOpen = () => this.setState({ isOpen: true })
  private handleClose = () => this.setState({ isOpen: false })
  private handleExportFileNameChange = (name: string) => this.setState({ exportFileName: name })
  private openDirBrowser = (): void => {
    const dirPath: string[]|undefined = remote.dialog.showOpenDialog({properties: ['openDirectory']})
    if (dirPath && dirPath.length) {
      this.setState({exportFilePath: dirPath[0]})
    }
  }
  private startExport = (): void => {
    let {saveExportFile, bins, taxonomies, activeRecord, connection} = this.props
    let {exportFilePath, exportFileName} = this.state
    if (exportFilePath && exportFileName && taxonomies && bins && activeRecord && connection) {
      saveExportFile(exportFilePath, exportFileName, taxonomies, bins, activeRecord.id, connection)
    }
  }

  public componentWillMount(): void {
    let {consensus} = this.props
    if (consensus) {
      this.setState({consensusName: consensus.name})
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
    }
  }
  public componentDidUpdate(): void {
    let {savingBinState, exportState} = this.props
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
    let {dataLoaded, gcAverage, coverageAverage, savingBinState, exportState} = this.props
    let {consensusName, sampleName, exportFilePath, exportFileName, isOpen} = this.state
    return (
      <>
        <InputGroup disabled={!dataLoaded} onChange={(e: any) => this.handleSampleName(e)} value={sampleName} name={'sample_name'} placeholder={'Name'}/><span style={{padding: '2px'}}></span>
        <InputGroup disabled={!dataLoaded} onChange={(e: any) => this.handleConsensusChange(e)} value={consensusName} name={'consensus'} placeholder={'Consensus'}/><span style={{padding: '2px'}}></span>
        <InputGroup style={{width: '38px'}} disabled={!dataLoaded} readOnly={true} value={gcAverage ? gcAverage.toString() : ''} name={'avg_gc'} placeholder={'GC Avg.'}/><span style={{padding: '2px'}}></span>
        <InputGroup style={{width: '52px'}} disabled={!dataLoaded} readOnly={true} value={coverageAverage ? coverageAverage.toString() : ''} name={'avg_coverage'} placeholder={'Coverage Avg.'}/><span style={{padding: '2px'}}></span>
        <Button style={{minWidth: '80px'}} disabled={!dataLoaded} loading={savingBinState === 'pending'} onClick={this.props.saveBin} intent={'success'} text={'Save Bin'}/>
        <Button style={{minWidth: '80px', marginLeft: '4px'}} rightIcon={'export'} onClick={this.handleOpen} text={'Export'}/>
        <Dialog
          icon='export'
          onClose={this.handleClose}
          title='Export'
          isOpen={isOpen}>
          <div className={Classes.DIALOG_BODY}>
            <InputGroup style={{margin: '4px 0'}} value={exportFileName ? exportFileName : ''} placeholder={'Type in your file name...'} onChange={(e: any) => this.handleExportFileNameChange(e.target.value)}/>
            <InputGroup readOnly={true} placeholder={exportFilePath ? exportFilePath : 'Choose directory...'} rightElement={
              <Button text={'Browse'} onClick={this.openDirBrowser}/>
            }/>
            <Button style={{marginTop: '10px'}} disabled={!exportFilePath || !exportFileName} intent={'primary'} text={'Save'}
                    onClick={() => this.startExport()}/>
          </div>
          {!!exportState && exportState === 'pending' &&
          <div className={Classes.DIALOG_FOOTER}>
              <ProgressBar intent={'primary'}/>
          </div>
          }
        </Dialog>
        </>
    )}
  }

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  consensus: getConsensus(state),
  gcAverage: getGCAverage(state),
  coverageAverage: getCoverageAverage(state),
  savingBinState: getSavingBinState(state),
  bins: getBinsMap(state),
  exportState: getExportState(state),
  connection: state.database.connection,
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      setConsensusName: consensusName => SamplesActions.setConsensusName(consensusName),
      setSampleName: sampleName => SamplesActions.setSampleName(sampleName),
      saveExportFile: (exportDir: string, exportName: string, taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>, recordId: number, connection: Connection) =>
                      FileTreeActions.saveExportFile(exportDir, exportName, taxonomies, bins, recordId, connection),
      saveBin: SamplesActions.saveBin,
    },
    dispatch,
  )

export const BinNaming =
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CBinNaming)