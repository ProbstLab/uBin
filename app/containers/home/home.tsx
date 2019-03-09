import * as React from 'react'
import {push} from 'connected-react-router'
import {AnyAction, bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router'
import {IClientState} from '../../controllers'
import {Button, Menu, MenuDivider, MenuItem, Popover, Position, ButtonGroup, Spinner} from '@blueprintjs/core'
import {
  getImportRecords,
  getTaxonomyTreeFull,
  IImportRecord,
  getArchaealEnzymeDistributionForChart,
  getBacterialEnzymeDistributionForChart, SamplesActions, getSamples, getScatterDomain,
} from '../../controllers/samples'
import {DBActions} from '../../controllers/database'
import {Connection} from 'typeorm'
import {IBarData, ITaxonomyForSunburst} from '../../utils/interfaces'
import {UBinSunburst} from '../../components/uBinSunburst'
import {ThunkAction} from 'redux-thunk'
import {UBinBarChart} from '../../components/uBinBarChart'
import {UBinScatter} from '../../components/uBinScatter'
import {UBinZoomBarChart} from '../../components/uBinZoomBarChart'
import {IScatterDomain} from 'samples'

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
}

interface IActionsFromState {
  changePage(page: string): void
  startDb(): void
  getImportData(recordId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateSelectedTaxonomy(taxonomyId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  refreshImports(): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateScatterDomain(scatterDomain: IScatterDomain): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  setScatterDomain(scatterDomain: IScatterDomain): void
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

  public loadSampleData(recordId: number): void {
    if (this.props.connection) {
      this.props.getImportData(recordId)
    }
  }

  public componentDidMount(): void {
    this.props.refreshImports()
  }

  render(): JSX.Element {
    const sampleMenu = (
      <Menu>
        <MenuItem icon='menu' text='Menu' disabled={true}/>
        <MenuDivider />
        <MenuItem icon='database' text='Import Records'>
          { this.props.importRecords.length ? this.props.importRecords.map((record: IImportRecord, index: number) =>
            <MenuItem key={index} icon='pulse' text={record.name} onClick={() => this.loadSampleData(record.id)} />) :
            <MenuItem text='No samples imported yet'/>}
        </MenuItem>
      </Menu>
    )

    return (
      <div>
        <div style={homeStyle}>
          <div style={{width: '100%', display: 'flex'}}>
            <Popover content={sampleMenu} position={Position.RIGHT_BOTTOM}>
              <Button icon='settings' text='Data Settings/Import' />
            </Popover>
            <ButtonGroup style={{marginLeft: '12px'}}>
              <Button icon='filter' intent='success' text='Apply filters' onClick={() => this.props.applyFilters()}/>
              <Button rightIcon='filter-remove' text='Reset filters' onClick={() => this.props.resetFilters()}/>
            </ButtonGroup>
          </div>
          {this.props.taxonomyTreeFull &&
          <div style={{width: '100%', display: 'flex'}}>
            <div style={{width: '70%'}}>
              <div style={{width: '100%', display: 'flex'}}>
                <div style={{width: '50%', height: '400px'}}>
                  {this.props.samples.length &&
                  <UBinScatter data={this.props.samples} domainChangeHandler={this.props.updateScatterDomain} domain={this.props.scatterDomain}/>}
                  {!this.props.samples.length && <Spinner size={50}/>}
                </div>
                <div style={{width: '50%'}}>
                  <UBinSunburst data={{ children: this.props.taxonomyTreeFull}} clickEvent={this.props.updateSelectedTaxonomy}/>
                </div>
              </div>
              { false &&
              <div style={{width: '100%', display: 'flex'}}>
                <div style={{width: '50%', height: '500px'}}>
                  <UBinZoomBarChart data={this.props.samples} title='GC/Length' xName='gc' yName='length'/>
                </div>
                <div style={{width: '50%', height: '500px'}}>
                  <UBinZoomBarChart data={this.props.samples} title='Coverage/Length' xName='coverage' yName='length'/>
                </div>
              </div> }
            </div>
            { false &&
            <div style={{width: '30%', height: 'inherit'}}>
              <div style={{height: '400px'}}>
                <UBinBarChart data={this.props.archaealEnzymeDistribution} title='Archaeal Single Copy Genes' xName='name' yName='amount'/>
              </div>
              <div style={{height: '400px'}}>
                <UBinBarChart data={this.props.bacterialEnzymeDistribution} title='Bacterial Single Copy Genes' xName='name' yName='amount'/>
              </div>
            </div> }
          </div>}
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
