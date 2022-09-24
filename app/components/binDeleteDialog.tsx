
import * as React from 'react'
import {AnchorButton, Button, Dialog, Classes, Tooltip} from '@blueprintjs/core'
import {AnyAction, bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {ThunkAction} from 'redux-thunk'
import {SamplesActions} from '../controllers/samples'
import {IClientState} from '../controllers'
import {getDeletingBinState} from '../controllers/database'
import {Bin} from '../db/entities/Bin'
import { IBin } from 'samples'

interface IPropsFromState {
  deletingBinState?: string
}

interface IActionsFromState {
  deleteSelectedBin(bin: Bin): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
}

interface IProps {
  bin: Bin | IBin
}

type TProps = IProps & IActionsFromState & IPropsFromState

interface IState {
  isDeleteDialogOpen: boolean
}

export class CBinDeleteDialog extends React.PureComponent<TProps> {
  currDeletingBinState?: string

  public state: IState = {
    isDeleteDialogOpen: false
  }

  private handleDeleteDialogOpen = () => this.setState({ isDeleteDialogOpen: true })
  private handleDeleteDialogClose = () => this.setState({ isDeleteDialogOpen: false })
  private isLoading = () => this.currDeletingBinState === 'pending'

  private startDeleteBin = (): void => {
    let {deleteSelectedBin, bin} = this.props
    if (bin) {
      deleteSelectedBin(bin as Bin)
    }
  }

  public componentDidUpdate (): void {
    let {deletingBinState} = this.props
    if (deletingBinState && this.isLoading() && deletingBinState !== this.currDeletingBinState) {
      switch (deletingBinState) {
        case 'rejected':
          this.handleDeleteDialogClose()
          break
        case 'fulfilled':
          this.handleDeleteDialogClose()
          break
      }
    }
    this.currDeletingBinState = deletingBinState
  }

  render(): JSX.Element {
    const {bin} = this.props
    return (
      <div>
        <AnchorButton minimal disabled={!bin} icon={'trash'} intent={'danger'} onClick={this.handleDeleteDialogOpen}/>
        <Dialog icon={'trash'} title={'Delete Bin'} isOpen={this.state.isDeleteDialogOpen}>
          <div className={Classes.DIALOG_BODY}>
            <p>Are you sure that you want to delete<br/>{bin ? bin.name : <b>undefined</b>}?</p>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button text={'Close'} onClick={this.handleDeleteDialogClose}/>
              <Tooltip content={'The selected bin will be permanently deleted!'}>
                <Button intent={'danger'} rightIcon={'trash'} text={'Delete'} onClick={() => this.startDeleteBin()} loading={this.isLoading()}/>
              </Tooltip>
            </div>
          </div>
        </Dialog>
      </div>
    )
  }
}

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  deletingBinState: getDeletingBinState(state)
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState => {
  return bindActionCreators (
    {
      deleteSelectedBin: SamplesActions.deleteBin
    },
    dispatch
  )
}

export const BinDeleteDialog =
connect(
  mapStateToProps,
  mapDispatchToProps
)(CBinDeleteDialog)