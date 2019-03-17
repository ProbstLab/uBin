
import * as React from 'react'
import {Icon, Menu, MenuItem} from '@blueprintjs/core'
import {Bin} from '../db/entities/Bin'
import {numToColour} from '../utils/convert'

interface IProps {
  bins: Bin[]
  setSelectedBin(bin: Bin): void
}

type TProps = IProps

export class BinMenu extends React.PureComponent<TProps> {

  private listBins(): JSX.Element | JSX.Element[] {
    let {bins} = this.props
    if (bins.length) {
      return bins.map((value: Bin) => <MenuItem icon={<Icon icon={'full-circle'} color={'#'+numToColour(value.id)}/>}
                                                text={value.name} key={value.id} onClick={() => this.props.setSelectedBin(value)}/>)
    }
    return <MenuItem text={'There are no bins for the imported dataset'}/>
  }

  render(): JSX.Element {
    return (
      <Menu>
        {this.listBins()}
      </Menu>
    )}
  }