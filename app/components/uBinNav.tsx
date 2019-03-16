import * as React from 'react'

import {
  Alignment,
  Button,
  Classes,
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

export class UBinNav extends React.Component<IProps> {
  private isActivePath = (path: string) => this.props.location ? this.props.location.pathname === path : false;

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
      </Navbar>
    )
  }
}
