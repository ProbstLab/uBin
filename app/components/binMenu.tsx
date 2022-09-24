
import * as React from 'react'
import {Icon, Menu, MenuItem} from '@blueprintjs/core'
import {Bin} from '../db/entities/Bin'
import {BinDeleteDialog} from './binDeleteDialog'
import {numToColour} from '../utils/convert'

/**
 * Used to list all available Bins by their name and colour
 */

interface IProps {
  bins: Bin[]
  setSelectedBin(bin: Bin): void
}

type TProps = IProps

export class BinMenu extends React.PureComponent<TProps> {

  private listBins(): JSX.Element | JSX.Element[] {
    let {bins} = this.props
    if (bins.length) {
      return bins.map((bin: Bin) => 
        <div style={{display: 'flex', justifyContent: 'space-between'}}  key={"div-" + bin.id}>
          <MenuItem 
            icon={<Icon icon={'full-circle'} color={'#'+numToColour(bin.id)}/>}
            text={bin.name} 
            key={bin.id} 
            onClick={() => this.props.setSelectedBin(bin)}
          />
          <BinDeleteDialog bin={bin} key={"del-" + bin.id} />
        </div>
      )
    }
    return <MenuItem text={'There are no bins for the imported dataset'}/>
  }

  render(): JSX.Element {
    return (
      <Menu className={'bin-select'}>
        {this.listBins()}
      </Menu>
    )}
  }