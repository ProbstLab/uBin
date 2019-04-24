
import * as React from 'react'
import {Crossfilter} from 'crossfilter2'
import * as crossfilter from 'crossfilter2'
import {IBin, IDomain} from "samples"
import {Sample} from '../db/entities/Sample'
import {UBinSelectBarChartOverview} from './uBinSelectBarChartOverview'
import {UBinCoverageBarChart} from './uBinCoverageBarChart'
import {Taxonomy} from '../db/entities/Taxonomy'

interface IProps {
  samples: any[]
  domain?: IDomain
  cf: Crossfilter<Sample>
  worldDomain?: IDomain
  bin?: IBin
  binView: boolean
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies?: Taxonomy[]
  setDomainY(domain: [number, number]): void
  domainChangeHandler(domain: IDomain): void
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
    let {worldDomain, setDomainY, domainChangeHandler, bin, binView, selectedTaxonomy, excludedTaxonomies} = this.props
    return (
        <div>
          <UBinCoverageBarChart cf={cf} title='Coverage distribution' xName='coverage' yName='length' coverageRange={worldDomain ? worldDomain.y : undefined}
                                setWorldDomain={setDomainY} domainChangeHandler={domainChangeHandler} bin={bin} range={range} binView={binView}
                                gcRange={worldDomain ? worldDomain.x : undefined} selectedTaxonomy={selectedTaxonomy} excludedTaxonomies={excludedTaxonomies}/>
          <UBinSelectBarChartOverview cf={overviewCf} title='Coverage range selection' xName='coverage' yName='length' binView={binView} selectedTaxonomy={selectedTaxonomy}
                                      worldDomain={worldDomain ? worldDomain.y : undefined} bin={bin} setRange={this.setRange.bind(this)} excludedTaxonomies={excludedTaxonomies}/>
        </div>
    )}
  }