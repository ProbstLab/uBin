
import * as React from 'react'
import {Crossfilter} from 'crossfilter2'
import * as crossfilter from 'crossfilter2'
import {IBin, IScatterDomain} from "samples"
import {UBinSelectBarChart} from './uBinSelectBarChart'
import {Sample} from '../db/entities/Sample'
import {UBinSelectBarChartOverview} from './uBinSelectBarChartOverview'

interface IProps {
  samples: any[]
  samplesPending: boolean
  scatterDomain?: IScatterDomain
  cf: Crossfilter<Sample>
  worldDomain?: IScatterDomain
  bin?: IBin
  setScatterDomainY(domain: [number, number]): void
  domainChangeHandler(scatterDomain: IScatterDomain): void
}

interface IGCCoverageBarChartsState {
  overviewCf: Crossfilter<Sample>
  range?: [number, number]
}

type TProps = IProps

export class CoverageBarChartsWrapper extends React.PureComponent<TProps> {

  public state: IGCCoverageBarChartsState = {
    overviewCf: crossfilter(this.props.samples),
  }

  private setRange(range: [number, number]) {
    this.setState({range})
  }

  render(): JSX.Element {
    let {cf} = this.props
    let {overviewCf, range} = this.state
    let {worldDomain, setScatterDomainY, domainChangeHandler, bin} = this.props
    return (
        <div>
          <UBinSelectBarChart cf={cf} title='Coverage/Length' xName='coverage' yName='length' worldDomain={worldDomain ? worldDomain.y : undefined}
                            setWorldDomain={setScatterDomainY} domainChangeHandler={domainChangeHandler} bin={bin} range={range}/>
          <UBinSelectBarChartOverview cf={overviewCf} title='Coverage/Length' xName='coverage' yName='length'
                                      worldDomain={worldDomain ? worldDomain.y : undefined} bin={bin} setRange={this.setRange.bind(this)}/>
        </div>
    )}
  }