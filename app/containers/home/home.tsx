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
  getArchaealEnzymeDistributionForChart,
  getBacterialEnzymeDistributionForChart, SamplesActions, getSamples, getScatterDomain, getImportRecordsState,
} from '../../controllers/samples'
import {DBActions, getSamplesStatePending} from '../../controllers/database'
import {Connection} from 'typeorm'
import {IBarData, ITaxonomyForSunburst} from '../../utils/interfaces'
import {UBinSunburst} from '../../components/uBinSunburst'
import {ThunkAction} from 'redux-thunk'
import {UBinScatter} from '../../components/uBinScatter'
import {IScatterDomain} from 'samples'
import {SampleMenu} from '../../components/sampleMenu'
import {GCCoverageBarCharts} from '../../components/gCCoverageBarCharts'
import {EnzymeDistributionBarCharts} from '../../components/enzymeDistributionBarCharts'

interface IProps extends RouteComponentProps {
}

interface IPropsFromState {
  connection: Connection | undefined
  importRecords: IImportRecord[]
  taxonomyTreeFull?: ITaxonomyForSunburst[]
  archaealEnzymeDistribution: IBarData[]
  bacterialEnzymeDistribution: IBarData[]
  samples: any[]
  scatterDomain?: IScatterDomain
  importRecordsState: {pending: boolean, loaded: boolean}
  samplesPending: boolean
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
  applyFilters(): void
  resetFilters(): void
}

const homeStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'left',
  margin: '0',
} as React.CSSProperties

type TProps = IProps & IPropsFromState & IActionsFromState

class CHome extends React.Component<TProps> {

  public componentDidMount(): void {
    this.props.refreshImports()
  }

  render(): JSX.Element {

    const showScatter = (isReady: boolean): any => {
      if (isReady) {
        return <UBinScatter data={this.props.samples} domainChangeHandler={this.props.updateScatterDomain} domain={this.props.scatterDomain}/>
      } else {
        return <Spinner size={20}/>
      }
    }
    const getCharts = (): JSX.Element => {

      if (this.props.samplesPending) {
        return (
          <div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', height: '80vh', width: '100%'}}>
            <Spinner size={100}/>
          </div>
        )
      } else if (!this.props.samples.length) {
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
                {showScatter(!!this.props.samples.length)}
              </div>
              <div style={{width: '40%'}}>
                {this.props.taxonomyTreeFull &&
                <UBinSunburst data={{ children: this.props.taxonomyTreeFull}} clickEvent={this.props.updateSelectedTaxonomy}/>}
              </div>
            </div>
            <GCCoverageBarCharts samples={this.props.samples} samplesPending={this.props.samplesPending} scatterDomain={this.props.scatterDomain}
                                 setScatterDomainX={this.props.setScatterDomainX} setScatterDomainY={this.props.setScatterDomainY}
                                 domainChangeHandler={this.props.updateScatterDomain}/>
          </div>
          <EnzymeDistributionBarCharts samples={this.props.samples} samplesPending={this.props.samplesPending}
                                       connection={this.props.connection}/>
        </>
      )
    }

    return (
      <div>
        <div style={homeStyle}>
          <div style={{width: '100%', display: 'flex'}}>
            <Popover content={<SampleMenu importRecords={this.props.importRecords} importRecordsState={this.props.importRecordsState}
                                          connection={this.props.connection} getImportData={this.props.getImportData}/>}
                     position={Position.RIGHT_BOTTOM}>
              <Button icon='settings' text='Data Settings/Import' />
            </Popover>
            <ButtonGroup style={{marginLeft: '12px'}}>
              <Button icon='filter' intent='success' text='Apply filters' onClick={() => this.props.applyFilters()}/>
              <Button rightIcon='filter-remove' text='Reset filters' onClick={() => this.props.resetFilters()}/>
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
  archaealEnzymeDistribution: getArchaealEnzymeDistributionForChart(state),
  bacterialEnzymeDistribution: getBacterialEnzymeDistributionForChart(state),
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
      applyFilters: SamplesActions.applyFilters,
      resetFilters: SamplesActions.resetFilters,
      // getTaxonomies: (connection, recordId) => DBActions.getTaxonomiesForImport(connection, recordId)
    },
    dispatch,
  )

export const Home = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CHome),
)
