
import * as React from 'react'
import {Crossfilter} from 'crossfilter2'
import * as crossfilter from 'crossfilter2'
import {IBin, IDomain} from "samples"
import {Sample} from '../db/entities/Sample'
import {CoverageBarChartsWrapper} from './coverageBarChartsWrapper'
import {UBinGCBarChart} from './uBinGCBarChart'

interface IProps {
  samples: any[]
  samplesPending: boolean
  binView: boolean
  domain?: IDomain
  bin?: IBin
  setDomainX(domain: [number, number]): void
  setDomainY(domain: [number, number]): void
  domainChangeHandler(domain: IDomain): void
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
    let {domain, setDomainX, setDomainY, domainChangeHandler, bin, binView, samples, samplesPending} = this.props
    return (
      <div style={{width: '100%', display: 'flex'}}>
        <div style={{width: '50%', height: '360px'}}>
          <UBinGCBarChart data={this.props.samples} title='GC/Length' xName='gc' yName='length' xDomain={domain ? domain.x : undefined}
                          coverageRange={domain ? domain.y : undefined} setWorldDomain={setDomainX}
                          domainChangeHandler={domainChangeHandler} bin={bin} binView={binView}/>
        </div>
        <div style={{width: '50%', height: '360px'}}>
          <CoverageBarChartsWrapper cf={cf} samples={samples} samplesPending={samplesPending} setDomainY={setDomainY}
                                    domainChangeHandler={domainChangeHandler} bin={bin} binView={binView} worldDomain={domain}/>
        </div>
      </div>
    )}
  }