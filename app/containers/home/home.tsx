import * as React from 'react'
import {push} from 'connected-react-router'
import {bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router'
import {IClientState} from '../../controllers'
import {Button, Callout, Menu, MenuDivider, MenuItem, Popover, Position} from '@blueprintjs/core';
import {getImportRecords, getTaxonomyTreeFull, IImportRecord, SamplesActions} from '../../controllers/samples';
import {DBActions} from '../../controllers/database';
import {Connection} from 'typeorm';
import {ITaxonomyAssociativeArray} from "../../utils/interfaces";

interface IProps extends RouteComponentProps {
}

interface IPropsFromState {
  connection: Connection | undefined
  importRecords: IImportRecord[]
  taxonomyTreeFull: ITaxonomyAssociativeArray | undefined
}

interface IActionsFromState {
  changePage(page: string): void
  startDb(): void
  getTaxonomies(connection: Connection, recordId: number): void
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
    console.log('load sampel data', recordId)
    if (this.props.connection) {
      this.props.getTaxonomies(this.props.connection, recordId)
    }
  }

  public componentDidMount(): void {
    // this.props.startDb()
  }

  render(): JSX.Element {

    const sampleMenu = (
      <Menu>
        <MenuItem icon='ninja' text='A Ninja' disabled={true}/>
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
        <Popover content={sampleMenu} position={Position.RIGHT_BOTTOM}>
          <Button icon='settings' text='Data Settings/Import' />
        </Popover>
        <Callout title={'Home!'}>
          Hallo!
          <p>{this.props.location.key}</p>
        </Callout>
      </div>
    )
  }
}

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  importRecords: getImportRecords(state),
  connection: state.database.connection,
  taxonomyTreeFull: getTaxonomyTreeFull(state)
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      changeFilter: SamplesActions.setFilter,
      changePage: push,
      startDb: DBActions.startDatabase,
      getTaxonomies: (connection, recordId) => DBActions.getTaxonomiesForImport(connection, recordId)
    },
    dispatch,
  )

export const Home = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CHome),
)
