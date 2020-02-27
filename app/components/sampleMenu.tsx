
import * as React from 'react'
import {Menu, MenuDivider, MenuItem, Spinner} from '@blueprintjs/core'
import {IImportRecord} from '../controllers/samples'
import {ThunkAction} from 'redux-thunk'
import {IClientState} from '../controllers'
import {AnyAction} from 'redux'
import {Connection} from 'typeorm'

interface IProps {
  importRecords: IImportRecord[]
  importRecordsState: {pending: boolean, loaded: boolean}
}

interface IActionsFromState {
  getImportData(recordId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
}

interface IPropsFromState {
  connection: Connection | undefined
}

type TProps = IProps & IPropsFromState & IActionsFromState

export class SampleMenu extends React.PureComponent<TProps> {

  public getImportData(): JSX.Element | JSX.Element[] {
    let { importRecordsState, importRecords } = this.props
    if (!importRecordsState.pending && importRecordsState.loaded && !importRecords.length) {
      return <MenuItem text='No data has been imported yet'/>
    } else if (importRecords.length && !importRecordsState.pending){
      let multipliedRecords = this.props.importRecords
      multipliedRecords = [...multipliedRecords, ...multipliedRecords, ...multipliedRecords, ...multipliedRecords, ...multipliedRecords, ...multipliedRecords,
        ...multipliedRecords, ...multipliedRecords, ...multipliedRecords, ...multipliedRecords, ...multipliedRecords, ...multipliedRecords]
      return (multipliedRecords.map((record: IImportRecord, index: number) =>
        <MenuItem key={index} icon='pulse' text={record.name} onClick={() => this.loadSampleData(record.id)} />))
    }
    return <MenuItem text={<Spinner size={20}/>}/>
  }

  public loadSampleData(recordId: number): void {
    if (this.props.connection) {
      this.props.getImportData(recordId)
    }
  }

  render(): JSX.Element {
    return (
      <Menu className={'record-select'}>
        <MenuItem icon='menu' text='Menu' disabled={true}/>
        <MenuDivider />
        <MenuItem icon='database' text='Import Records'>
          {this.getImportData()}
        </MenuItem>
      </Menu>
    )}
  }