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
  SamplesActions,
  getArchaealEnzymeDistributionForChart,
  getBacterialEnzymeDistributionForChart
} from '../../controllers/samples'
import {DBActions} from '../../controllers/database'
import {Connection} from 'typeorm'
import {ITaxonomyForSunburst} from '../../utils/interfaces'
import {UBinSunburst} from "../../components/uBinSunburst"
import {ThunkAction} from 'redux-thunk'
import {IVisData} from '../../utils/interfaces'
import {UBinBarChart} from '../../components/uBinBarChart'


interface IProps extends RouteComponentProps {
}

interface IPropsFromState {
  connection: Connection | undefined
  importRecords: IImportRecord[]
  taxonomyTreeFull: ITaxonomyForSunburst[] | undefined
  archaealEnzymeDistribution: IVisData[]
  bacterialEnzymeDistribution: IVisData[]
}

interface IActionsFromState {
  changePage(page: string): void
  startDb(): void
  getImportData(recordId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  // getTaxonomies(connection: Connection, recordId: number): void
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
    // this.props.startDb()
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
      <div style={homeStyle}>
        <div style={{width: '100%'}}>
          <Popover content={sampleMenu} position={Position.RIGHT_BOTTOM}>
            <Button icon='settings' text='Data Settings/Import' />
          </Popover>
        </div>
        {this.props.taxonomyTreeFull && <UBinSunburst data={{ children: this.props.taxonomyTreeFull}}/>}
        <UBinBarChart data={this.props.archaealEnzymeDistribution} title='Archaeal Single Copy Genes'/>
        <UBinBarChart data={this.props.bacterialEnzymeDistribution} title='Bacterial Single Copy Genes'/>
      </div>
    )
  }
}

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  importRecords: getImportRecords(state),
  connection: state.database.connection,
  taxonomyTreeFull: getTaxonomyTreeFull(state),
  archaealEnzymeDistribution: getArchaealEnzymeDistributionForChart(state),
  bacterialEnzymeDistribution: getBacterialEnzymeDistributionForChart(state)
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      changeFilter: SamplesActions.setFilter,
      changePage: push,
      startDb: DBActions.startDatabase,
      getImportData: recordId => DBActions.getImportData(recordId)
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
