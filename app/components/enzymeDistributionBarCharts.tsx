
import * as React from 'react'
import {Connection} from 'typeorm'
import {UBinZoomBarChart} from './uBinZoomBarChart'

interface IProps {
  samples: any[]
  samplesPending: boolean
}

interface IActionsFromState {}

interface IPropsFromState {
  connection: Connection | undefined
}

type TProps = IProps & IPropsFromState & IActionsFromState

export class EnzymeDistributionBarCharts extends React.PureComponent<TProps> {

  render(): JSX.Element {
    return (
      <div style={{width: '100%', display: 'flex'}}>
        <div style={{width: '50%', height: '500px'}}>
          <UBinZoomBarChart data={this.props.samples} title='GC/Length' xName='gc' yName='length'/>
        </div>
        <div style={{width: '50%', height: '500px'}}>
          <UBinZoomBarChart data={this.props.samples} title='Coverage/Length' xName='coverage' yName='length'/>
        </div>
      </div>
    )}
  }