
import * as React from 'react'
import {UBinZoomBarChart} from './uBinZoomBarChart'
import {Crossfilter} from 'crossfilter2'
import {ISample} from '../utils/interfaces'
import * as crossfilter from 'crossfilter2'

interface IProps {
  samples: any[]
  samplesPending: boolean
}

interface IGCCoverageBarChartsState {
  cf: Crossfilter<ISample>
}

type TProps = IProps

export class GCCoverageBarCharts extends React.PureComponent<TProps> {

  public state: IGCCoverageBarChartsState = {
    cf: crossfilter(this.props.samples),
  }

  render(): JSX.Element {
    let {cf} = this.state
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