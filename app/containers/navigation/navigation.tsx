import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { IClientState } from '../../controllers'
import {Connection} from "typeorm";
import {UBinNav} from "../../components/uBinNav";

interface IProps extends RouteComponentProps {}

interface IPropsFromState {
    connection?: Connection
}

interface IActionsFromState {
    changePage(page: string): void
}

type TProps = IProps & IPropsFromState & IActionsFromState


class CUBinNavigation extends React.Component<TProps> {
    render(): JSX.Element {

        return (
          <UBinNav location={this.props.location} dbConnected={this.props.connection ? this.props.connection.isConnected : false}/>
        )
    }
}

const mapStateToProps = (state: IClientState): IPropsFromState => ({
    connection: state.database.connection
})

export const UBinNavigation = withRouter(
    connect(
        mapStateToProps,
    )(CUBinNavigation),
)
