
import * as React from 'react'
import {Button, InputGroup} from '@blueprintjs/core'
import {Taxonomy} from '../db/entities/Taxonomy'
import {IClientState} from '../controllers'
import {getConsensus, getCoverageAverage, getGCAverage, IImportRecord, SamplesActions} from '../controllers/samples'
import {AnyAction, bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {ThunkAction} from 'redux-thunk'
import {getSavingBinState} from '../controllers/database'
import {UBinToaster} from '../utils/uBinToaster'

interface IPropsFromState {
  consensus?: Taxonomy
  gcAverage?: number
  coverageAverage?: number
  savingBinState?: string
}

interface IActionsFromState {
  setConsensusName(consensusName: string): void
  setSampleName(sampleName: string): void
  saveBin(): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
}

interface IProps {
  dataLoaded: boolean
  activeRecord?: IImportRecord
}

interface IState {
  consensusName: string
  sampleName: string
}

type TProps = IPropsFromState & IActionsFromState & IProps

class CBinNaming extends React.PureComponent<TProps> {
  currConsensusName?: string
  currSampleName?: string
  currSavingBinState?: string

  public state: IState = {
    consensusName: '',
    sampleName: '',
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
    let {savingBinState} = this.props
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
    this.currSavingBinState = savingBinState
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
    let {dataLoaded, gcAverage, coverageAverage, savingBinState} = this.props
    let {consensusName, sampleName} = this.state
    return (
      <>
        <InputGroup disabled={!dataLoaded} onChange={(e: any) => this.handleSampleName(e)} value={sampleName} name={'sample_name'} placeholder={'Name'}/><span style={{padding: '2px'}}></span>
        <InputGroup disabled={!dataLoaded} onChange={(e: any) => this.handleConsensusChange(e)} value={consensusName} name={'consensus'} placeholder={'Consensus'}/><span style={{padding: '2px'}}></span>
        <InputGroup style={{width: '38px'}} disabled={!dataLoaded} readOnly={true} value={gcAverage ? gcAverage.toString() : ''} name={'avg_gc'} placeholder={'GC Avg.'}/><span style={{padding: '2px'}}></span>
        <InputGroup style={{width: '52px'}} disabled={!dataLoaded} readOnly={true} value={coverageAverage ? coverageAverage.toString() : ''} name={'avg_coverage'} placeholder={'Coverage Avg.'}/><span style={{padding: '2px'}}></span>
        <Button style={{minWidth: '80px'}} loading={savingBinState === 'pending'} onClick={this.props.saveBin} intent={'success'} text={'Save Bin'}/>
      </>
    )}
  }

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  consensus: getConsensus(state),
  gcAverage: getGCAverage(state),
  coverageAverage: getCoverageAverage(state),
  savingBinState: getSavingBinState(state),
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      setConsensusName: consensusName => SamplesActions.setConsensusName(consensusName),
      setSampleName: sampleName => SamplesActions.setSampleName(sampleName),
      saveBin: SamplesActions.saveBin,
    },
    dispatch,
  )

export const BinNaming =
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CBinNaming)