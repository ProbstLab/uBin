import * as React from 'react'
import {push} from 'connected-react-router'
import {AnyAction, bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router'
import {IClientState} from '../../controllers'
import {Button, Popover, Position, ButtonGroup, Spinner, Icon} from '@blueprintjs/core'
import {
  getImportRecords,
  getTaxonomyTreeFull,
  IImportRecord,
  SamplesActions,
  getSamples,
  getScatterDomain,
  getImportRecordsState,
  getBacterialEnzymeTypes,
  getArchaealEnzymeTypes, getBins, getSelectedBin,
} from '../../controllers/samples'
import {DBActions, getSamplesStatePending} from '../../controllers/database'
import {Connection} from 'typeorm'
import {ITaxonomyForSunburst} from '../../utils/interfaces'
import {UBinSunburst} from '../../components/uBinSunburst'
import {ThunkAction} from 'redux-thunk'
import {UBinScatter} from '../../components/uBinScatter'
import {IBin, IScatterDomain} from 'samples'
import {SampleMenu} from '../../components/sampleMenu'
import {GCCoverageBarCharts} from '../../components/gCCoverageBarCharts'
import {EnzymeDistributionBarCharts} from '../../components/enzymeDistributionBarCharts'
import {BinMenu} from '../../components/binMenu'
import {Bin} from '../../db/entities/Bin'

interface IProps extends RouteComponentProps {
}

interface IPropsFromState {
  connection: Connection | undefined
  importRecords: IImportRecord[]
  taxonomyTreeFull?: ITaxonomyForSunburst[]
  archaealEnzymeTypes: string[]
  bacterialEnzymeTypes: string[]
  samples: any[]
  scatterDomain?: IScatterDomain
  importRecordsState: {pending: boolean, loaded: boolean}
  samplesPending: boolean
  bins: Bin[]
  selectedBin?: IBin
}

interface IActionsFromState {
  changePage(page: string): void
  startDb(): void
  getImportData(recordId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateSelectedTaxonomy(taxonomyId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  refreshImports(): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateScatterDomain(scatterDomain: IScatterDomain): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  setScatterDomain(scatterDomain: IScatterDomain): void
  setScatterDomainX(domain: [number, number]): void
  setScatterDomainY(domain: [number, number]): void
  setSelectedBin(bin: Bin): void
  applyFilters(): void
  resetFilters(): void
}

const homeStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'left',
  margin: '0',
  marginTop: '64px',
} as React.CSSProperties

type TProps = IProps & IPropsFromState & IActionsFromState

class CHome extends React.Component<TProps> {

  public componentDidMount(): void {
    this.props.refreshImports()
  }

  render(): JSX.Element {
    let { samples, samplesPending, taxonomyTreeFull, scatterDomain, archaealEnzymeTypes, bacterialEnzymeTypes,
          updateSelectedTaxonomy, updateScatterDomain, setScatterDomainX, setScatterDomainY, connection, importRecords,
          importRecordsState, getImportData, resetFilters, bins, selectedBin} = this.props
    const showScatter = (isReady: boolean): any => {
      if (isReady) {
        return <UBinScatter data={samples} domainChangeHandler={updateScatterDomain} domain={scatterDomain} bin={selectedBin}/>
      } else {
        return <Spinner size={20}/>
      }
    }
    const getCharts = (): JSX.Element => {
      if (samplesPending) {
        return (
          <div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', height: '80vh', width: '100%'}}>
            <Spinner size={100}/>
          </div>
        )
      } else if (!samples.length) {
        return (
          <div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', height: '80vh', width: '100%'}}>
            <h2>Click on <span style={{backgroundColor: '#efefef', borderRadius: '4px', padding: '6px', margin: '6px', fontSize: 'initial', fontWeight: 400}}>
              <Icon icon={'import'}/> Import</span> to import your datasets and get started!</h2>
          </div>
        )
      }
      return (
        <>
          <div style={{width: '70%'}}>
            <div style={{width: '100%', display: 'flex'}}>
              <div style={{width: '50%'}}>
                {showScatter(!!samples.length)}
              </div>
              <div style={{width: '40%', marginTop: '30px'}}>
                {taxonomyTreeFull &&
                <UBinSunburst data={{ children: taxonomyTreeFull}} clickEvent={updateSelectedTaxonomy}/>}
              </div>
            </div>
            <GCCoverageBarCharts samples={samples} samplesPending={samplesPending} scatterDomain={scatterDomain}
                                 setScatterDomainX={setScatterDomainX} setScatterDomainY={setScatterDomainY}
                                 domainChangeHandler={updateScatterDomain} bin={selectedBin}/>
          </div>
          <EnzymeDistributionBarCharts samples={samples} samplesPending={samplesPending} domain={scatterDomain} bin={selectedBin}
                                       archaealLabels={archaealEnzymeTypes} bacterialLabels={bacterialEnzymeTypes}/>
        </>
      )
    }

    const getBinDropdown = (): JSX.Element => {
      return (
        <Popover content={<BinMenu bins={bins} setSelectedBin={this.props.setSelectedBin}/>} position={Position.BOTTOM}>
          <Button intent={'primary'} disabled={!bins.length} rightIcon={'layout-group-by'} text='Select Bin'/>
        </Popover>
      )
    }

    return (
      <div>
        <div style={homeStyle}>
          <div style={{width: '100%', display: 'flex'}}>
            <Popover content={<SampleMenu importRecords={importRecords} importRecordsState={importRecordsState}
                                          connection={connection} getImportData={getImportData}/>}
                     position={Position.RIGHT_BOTTOM}>
              <Button icon='settings' text='Data Settings/Import' />
            </Popover>
            <ButtonGroup style={{marginLeft: '12px'}}>
              <Button intent={'warning'} icon={'filter-remove'} text='Reset filters' onClick={() => resetFilters()}/>
              {getBinDropdown()}
            </ButtonGroup>
          </div>

          <div style={{width: '100%', display: 'flex'}}>
            {getCharts()}
          </div>
        </div>
      </div>

    )
  }
}

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  importRecords: getImportRecords(state),
  connection: state.database.connection,
  taxonomyTreeFull: getTaxonomyTreeFull(state),
  samples: getSamples(state),
  samplesPending: getSamplesStatePending(state),
  importRecordsState: getImportRecordsState(state),
  scatterDomain: getScatterDomain(state),
  archaealEnzymeTypes: getArchaealEnzymeTypes(state),
  bacterialEnzymeTypes: getBacterialEnzymeTypes(state),
  bins: getBins(state),
  selectedBin: getSelectedBin(state),
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      changePage: push,
      startDb: DBActions.startDatabase,
      refreshImports: DBActions.refreshImports,
      getImportData: recordId => DBActions.getImportData(recordId),
      updateSelectedTaxonomy: taxonomyIds => SamplesActions.updateSelectedTaxonomy(taxonomyIds),
      setScatterDomain: scatterDomain => SamplesActions.setScatterDomain(scatterDomain),
      setScatterDomainX: scatterDomainX => SamplesActions.setScatterDomainX(scatterDomainX),
      setScatterDomainY: scatterDomainY => SamplesActions.setScatterDomainY(scatterDomainY),
      updateScatterDomain: scatterDomain => SamplesActions.updateScatterDomain(scatterDomain),
      setSelectedBin: binId => SamplesActions.setSelectedBin(binId),
      applyFilters: SamplesActions.applyFilters,
      resetFilters: SamplesActions.resetFilters,
    },
    dispatch,
  )

export const Home = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CHome),
)
