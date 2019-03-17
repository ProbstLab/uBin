
import * as React from 'react'
import {Crossfilter} from 'crossfilter2'
import * as crossfilter from 'crossfilter2'
import {IBin, IScatterDomain} from "samples"
import {UBinSelectBarChart} from './uBinSelectBarChart'
import {Sample} from '../db/entities/Sample'

interface IProps {
  samples: any[]
  samplesPending: boolean
  scatterDomain?: IScatterDomain
  bin?: IBin
  setScatterDomainX(domain: [number, number]): void
  setScatterDomainY(domain: [number, number]): void
  domainChangeHandler(scatterDomain: IScatterDomain): void
}

interface IGCCoverageBarChartsState {
  cf: Crossfilter<Sample>
}

type TProps = IProps

export class GCCoverageBarCharts extends React.PureComponent<TProps> {

  public state: IGCCoverageBarChartsState = {
    cf: crossfilter(this.props.samples),
  }

  render(): JSX.Element {
    let {cf} = this.state
    let {scatterDomain, setScatterDomainX, setScatterDomainY, domainChangeHandler, bin} = this.props
    return (
      <div style={{width: '100%', display: 'flex'}}>
        <div style={{width: '50%', height: '360px'}}>
          <UBinSelectBarChart cf={cf} title='GC/Length' xName='gc' yName='length' worldDomain={scatterDomain ? scatterDomain.x : undefined}
                            setWorldDomain={setScatterDomainX} domainChangeHandler={domainChangeHandler} bin={bin}/>
        </div>
        <div style={{width: '50%', height: '360px'}}>
          <UBinSelectBarChart cf={cf} title='Coverage/Length' xName='coverage' yName='length' worldDomain={scatterDomain ? scatterDomain.y : undefined}
                            setWorldDomain={setScatterDomainY} domainChangeHandler={domainChangeHandler} bin={bin}/>
        </div>
      </div>
    )}
  }