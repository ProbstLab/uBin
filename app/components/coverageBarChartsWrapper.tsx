
import * as React from 'react'
import {Crossfilter} from 'crossfilter2'
// import * as crossfilter from 'crossfilter2'
import {IBin, IDomain} from "samples"
import {Sample} from '../db/entities/Sample'
// import {UBinSelectBarChartOverview} from './uBinSelectBarChartOverview'
// import {UBinCoverageBarChart} from './uBinCoverageBarChart'
import {UBinCoverageBarChartVX} from './uBinCoverageBarChartVX'
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
}

type TProps = IProps

export class CoverageBarChartsWrapper extends React.PureComponent<TProps> {

  public state: IGCCoverageBarChartsState = {
  }

  render(): JSX.Element {
    let {samples, worldDomain, setDomainY, domainChangeHandler, bin, binView, selectedTaxonomy, excludedTaxonomies} = this.props
    return (
        <div>
          {/* <UBinCoverageBarChart cf={cf} title='Coverage distribution' xName='coverage' yName='length' coverageRange={worldDomain ? worldDomain.y : undefined}
                                setWorldDomain={setDomainY} domainChangeHandler={domainChangeHandler} bin={bin} range={range} binView={binView}
                                gcRange={worldDomain ? worldDomain.x : undefined} selectedTaxonomy={selectedTaxonomy} excludedTaxonomies={excludedTaxonomies}/>
          <UBinSelectBarChartOverview cf={overviewCf} title='Coverage range selection' xName='coverage' yName='length' binView={binView} selectedTaxonomy={selectedTaxonomy}
                                      worldDomain={worldDomain ? worldDomain.y : undefined} bin={bin} setRange={this.setRange.bind(this)} excludedTaxonomies={excludedTaxonomies}/> */}
          <UBinCoverageBarChartVX data={samples} title='Coverage distribution' xName='coverage' yName='length' xDomain={worldDomain ? worldDomain.x : undefined}
                                  setWorldDomain={setDomainY} selectedTaxonomy={selectedTaxonomy} yDomain={worldDomain ? worldDomain.y : undefined}
                                  domainChangeHandler={domainChangeHandler} bin={bin} binView={binView} excludedTaxonomies={excludedTaxonomies}
                                  width={400} topChartHeight={300} bottomChartHeight={130}/>
        </div>
    )}
  }
