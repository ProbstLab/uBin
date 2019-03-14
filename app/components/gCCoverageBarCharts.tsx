
import * as React from 'react'
import {UBinZoomBarChart} from './uBinZoomBarChart'
import {Crossfilter} from 'crossfilter2'
import {ISample} from '../utils/interfaces'
import * as crossfilter from 'crossfilter2'
import {IScatterDomain} from "samples"

interface IProps {
  samples: any[]
  samplesPending: boolean
  scatterDomain?: IScatterDomain
  setScatterDomainX(domain: [number, number]): void
  setScatterDomainY(domain: [number, number]): void
  domainChangeHandler(scatterDomain: IScatterDomain): void
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
    let {scatterDomain, setScatterDomainX, setScatterDomainY, domainChangeHandler} = this.props
    return (
      <div style={{width: '100%', display: 'flex'}}>
        <div style={{width: '50%', height: '360px'}}>
          <UBinZoomBarChart cf={cf} title='GC/Length' xName='gc' yName='length' worldDomain={scatterDomain ? scatterDomain.x : undefined}
                            setWorldDomain={setScatterDomainX} domainChangeHandler={domainChangeHandler}/>
        </div>
        <div style={{width: '50%', height: '360px'}}>
          <UBinZoomBarChart cf={cf} title='Coverage/Length' xName='coverage' yName='length' worldDomain={scatterDomain ? scatterDomain.y : undefined}
                            setWorldDomain={setScatterDomainY} domainChangeHandler={domainChangeHandler}/>
        </div>
      </div>
    )}
  }