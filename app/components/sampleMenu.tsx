
import * as React from 'react'
import {connect} from 'react-redux'
import {AnyAction, bindActionCreators, Dispatch} from 'redux'
import {ThunkAction} from 'redux-thunk'
import {Connection} from 'typeorm'
import {Menu, MenuDivider, MenuItem, Spinner, Icon, Dialog, Classes, Button, Tooltip} from '@blueprintjs/core'
import {IClientState} from '../controllers'
import {DBActions} from '../controllers/database'
import {IImportRecord, SamplesActions} from '../controllers/samples'
import {getDeletingRecordState} from '../controllers/database'
import {UBinToaster} from '../utils/uBinToaster'

interface IProps {
  importRecords: IImportRecord[]
  importRecordsState: {pending: boolean, loaded: boolean}
}

interface IActionsFromState {
  getImportData(recordId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  deleteRecord(record: IImportRecord): void
}

interface IPropsFromState {
  connection: Connection | undefined
  deletingRecordState?: string
}

interface IState {
  isDeleteDialogOpen: boolean
  record?: IImportRecord
}

type TProps = IProps & IPropsFromState & IActionsFromState

class CSampleMenu extends React.PureComponent<TProps> {
  currDeletingRecordState?: string

  public state: IState = {
    isDeleteDialogOpen: false,
  }

  public componentDidUpdate(): void {
    let {deletingRecordState} = this.props
    if (deletingRecordState && this.currDeletingRecordState === 'pending' && deletingRecordState !== this.currDeletingRecordState) {
      switch (deletingRecordState) {
        case 'rejected':
          UBinToaster.show({message: 'Deleting sample record failed', icon: 'error', intent: 'danger'})
          this.handleDeleteDialogClose()
          break
        case 'fulfilled':
          UBinToaster.show({message: 'Sample record has been deleted!', icon: 'tick', intent: 'success'})
          this.handleDeleteDialogClose()
          break
        default:
          break
      }
    }
    this.currDeletingRecordState = deletingRecordState
  }

  public getImportData(): JSX.Element | JSX.Element[] {
    let { importRecordsState, importRecords } = this.props
    if (!importRecordsState.pending && importRecordsState.loaded && !importRecords.length) {
      return <MenuItem text='No data has been imported yet'/>
    } else if (importRecords.length && !importRecordsState.pending){
      return (this.props.importRecords.map(
        (record: IImportRecord, index: number) => 
          <MenuItem key={index} icon='pulse' text={record.name}
            labelElement={<Icon icon="trash" onClick={(e) => {
              e.stopPropagation()
              this.handleDeleteDialogOpen(record)
            }}/>}
            onClick={() => this.loadSampleData(record.id)}
          />
        ))
    }
    return <MenuItem text={<Spinner size={20}/>}/>
  }

  public loadSampleData(recordId: number): void {
    if (this.props.connection) {
      this.props.getImportData(recordId)
    }
  }

  private handleDeleteDialogOpen = (record: IImportRecord) => this.setState({ record, isDeleteDialogOpen: true })
  private handleDeleteDialogClose = () => this.setState({ isDeleteDialogOpen: false })

  private startDeleteSample = (): void => {
    let {record} = this.state
    if (record) {
      this.props.deleteRecord(record)
    }
  }

  render(): JSX.Element {
    let {isDeleteDialogOpen, record} = this.state

    return (
      <>
        <Dialog icon={'trash'} onClose={this.handleDeleteDialogClose} title={'Delete Record'} isOpen={isDeleteDialogOpen}>
          <div className={Classes.DIALOG_BODY}>
            <p>Are you sure that you want to delete<br/>{record ? record.name : <b>undefined</b>}?</p>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button text={'Close'} onClick={this.handleDeleteDialogClose}/>
              <Tooltip content={'The selected record will be permanently deleted!'}>
                <Button intent={'danger'} rightIcon={'trash'} text={'Delete'} onClick={() => this.startDeleteSample() }/>
              </Tooltip>
            </div>
          </div>
        </Dialog>
        <Menu className={'record-select'}>
          <MenuItem icon='menu' text='Menu' disabled={true}/>
          <MenuDivider />
          <MenuItem icon='database' text='Import Records'>
            {this.getImportData()}
          </MenuItem>
        </Menu>
      </>
    )}
  }

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  connection: state.database.connection,
  deletingRecordState: getDeletingRecordState(state),
})
  
const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      deleteRecord: record => SamplesActions.deleteRecord(record),
      getImportData: recordId => DBActions.getImportData(recordId),
    },
    dispatch,
  )

export const SampleMenu =
connect(
  mapStateToProps,
  mapDispatchToProps,
)(CSampleMenu)
