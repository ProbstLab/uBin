
import * as React from 'react'
import {Connection} from 'typeorm'
import {UBinZoomBarChart} from './uBinZoomBarChart'
import {Crossfilter} from 'crossfilter2'
import {ISample} from '../utils/interfaces'
import {Spinner} from '@blueprintjs/core'

interface IProps {
  cf: Crossfilter<ISample> | undefined
  samplesPending: boolean
}

interface IActionsFromState {}

interface IPropsFromState {
  connection: Connection | undefined
}

type TProps = IProps & IPropsFromState & IActionsFromState

export class GCCoverageBarCharts extends React.PureComponent<TProps> {

  render(): JSX.Element {
    let {cf} = this.props
    if (!cf) {
      return (<Spinner size={20}/>)
    }
    return (
      <div style={{width: '100%', display: 'flex'}}>
        <div style={{width: '50%', height: '500px'}}>
          <UBinZoomBarChart cf={cf} title='GC/Length' xName='gc' yName='length'/>
        </div>
        <div style={{width: '50%', height: '500px'}}>
          <UBinZoomBarChart cf={cf} title='Coverage/Length' xName='coverage' yName='length'/>
        </div>
      </div>
    )}
  }