import * as React from 'react'
import {push} from 'connected-react-router'
import {AnyAction, bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router'
import {IClientState} from '../../controllers'
import {Button, Menu, MenuDivider, MenuItem, Popover, Position} from '@blueprintjs/core'
import {
  getImportRecords,
  getTaxonomyTreeFull,
  IImportRecord,
  getArchaealEnzymeDistributionForChart,
  getBacterialEnzymeDistributionForChart, SamplesActions, getSamples
} from '../../controllers/samples'
import {DBActions} from '../../controllers/database'
import {Connection} from 'typeorm'
import {IBarData, ITaxonomyForSunburst} from '../../utils/interfaces'
import {UBinSunburst} from "../../components/uBinSunburst"
import {ThunkAction} from 'redux-thunk'
import {UBinBarChart} from '../../components/uBinBarChart'
import {UBinScatter} from '../../components/uBinScatter'

interface IProps extends RouteComponentProps {
}

interface IPropsFromState {
  connection: Connection | undefined
  importRecords: IImportRecord[]
  taxonomyTreeFull: ITaxonomyForSunburst[] | undefined
  archaealEnzymeDistribution: IBarData[]
  bacterialEnzymeDistribution: IBarData[]
  samples: any[]
}

interface IActionsFromState {
  changePage(page: string): void
  startDb(): void
  getImportData(recordId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateSelectedTaxonomy(taxonomyId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  refreshImports(): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
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
          <div style={{width: '100%'}}>
            <Popover content={sampleMenu} position={Position.RIGHT_BOTTOM}>
              <Button icon='settings' text='Data Settings/Import' />
            </Popover>
          </div>
          {this.props.taxonomyTreeFull &&
          <div style={{width: '100%', display: 'flex'}}>
            <div style={{width: '30%'}}>
              <UBinScatter data={this.props.samples}/>
            </div>
            <div style={{width: '40%'}}>
              <UBinSunburst data={{ children: this.props.taxonomyTreeFull}} clickEvent={this.props.updateSelectedTaxonomy}/>
            </div>
            <div style={{width: '30%', height: 'inherit'}}>
              <UBinBarChart data={this.props.archaealEnzymeDistribution} title='Archaeal Single Copy Genes'/>
              <UBinBarChart data={this.props.bacterialEnzymeDistribution} title='Bacterial Single Copy Genes'/>
            </div>
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
  archaealEnzymeDistribution: getArchaealEnzymeDistributionForChart(state),
  bacterialEnzymeDistribution: getBacterialEnzymeDistributionForChart(state)
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      // changeFilter: SamplesActions.setFilter,
      changePage: push,
      startDb: DBActions.startDatabase,
      refreshImports: DBActions.refreshImports,
      getImportData: recordId => DBActions.getImportData(recordId),
      updateSelectedTaxonomy: taxonomyIds => SamplesActions.updateSelectedTaxonomy(taxonomyIds)
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
