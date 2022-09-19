import * as React from 'react'

import {
  Alignment,
  Button,
  Classes, Dialog,
  Icon,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Popover, PopoverInteractionKind,
  Text,
} from '@blueprintjs/core'
import { NavLink } from 'react-router-dom'
import * as H from 'history'

interface IProps {
  location: H.Location
  dbConnected: boolean
}

interface IUBinNavState {
  citationMessageOpen: boolean
}

export class UBinNav extends React.Component<IProps> {

  public state: IUBinNavState = {
    citationMessageOpen: false,
  }

  private isActivePath = (path: string) => this.props.location ? this.props.location.pathname === path : false

  render(): JSX.Element {
    return (
      <Navbar fixedToTop={true}>
        <NavbarGroup align={Alignment.LEFT}>
          <NavLink to={"/"}><Button active={!this.props.location.key || this.isActivePath("/")} className={Classes.MINIMAL} icon="layout" text="Samples"/></NavLink>
          <NavLink to={"/files"}><Button active={this.isActivePath("/files")} className={Classes.MINIMAL} icon="import" text="Import"/></NavLink>
        </NavbarGroup>

        <NavbarGroup align={Alignment.RIGHT}>
          <NavbarHeading>
            {this.props.dbConnected ?
            <Popover interactionKind={PopoverInteractionKind.HOVER}>
              <Text><Icon icon='link' intent='success'/> Database</Text>
              <span style={{padding: '10px'}}>Database is connected</span>
            </Popover> :
            <Popover interactionKind={PopoverInteractionKind.HOVER}>
              <Text><Icon icon='offline' intent='danger'/> Database</Text>
              <span style={{padding: '10px'}}>Disconnected. Something went wrong :(</span>
            </Popover>}
          </NavbarHeading>
        </NavbarGroup>

        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>
            <Button intent={'warning'} onClick={() => this.toggleCitationMessage()}>Citation</Button>
          </NavbarHeading>
          <Dialog isOpen={this.state.citationMessageOpen} onClose={() => this.toggleCitationMessage()} icon='info-sign' title='Citation'>
            <div className={Classes.DIALOG_BODY}>
              <h4>
                When using this software please cite:<br/>Till L. V. Bornemann, Sarah P. Esser, Tom L. Stach, Tim Burg, and Alexander J. Probst (2020):<br/>
                uBin - an interactive metagenome viewer and binner for educational purposes. <i>unpublished.</i>
              </h4>
            </div>
          </Dialog>
        </NavbarGroup>
      </Navbar>
    )
  }

  private toggleCitationMessage(): void {
    let {citationMessageOpen} = this.state
    this.setState({citationMessageOpen: !citationMessageOpen})
  }
}
