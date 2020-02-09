
import * as React from 'react'
// import {Crossfilter} from 'crossfilter2'
// import * as crossfilter from 'crossfilter2'
import {IBin, IDomain} from "samples"
// import {Sample} from '../db/entities/Sample'
import {UBinCoverageBarChartVX} from './uBinCoverageBarChartVX'
import {UBinGCBarChartVX} from './uBinGCBarChartVX'
import {Taxonomy} from '../db/entities/Taxonomy'

interface IProps {
  samples: any[]
  binView: boolean
  domain?: IDomain
  bin?: IBin
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies?: Taxonomy[]
  setDomainX(domain: [number, number]): void
  setDomainY(domain: [number, number]): void
  domainChangeHandler(domain: IDomain): void
}

interface IGCCoverageBarChartsState {
  // cf: Crossfilter<Sample>
}

type TProps = IProps

export class GCCoverageBarCharts extends React.PureComponent<TProps> {

  public state: IGCCoverageBarChartsState = {
    // cf: crossfilter(this.props.samples),
  }

  render(): JSX.Element {
    let {domain, setDomainX, setDomainY, domainChangeHandler, bin, binView, samples, selectedTaxonomy, excludedTaxonomies} = this.props
    return (
      <div style={{width: '100%', display: 'flex'}}>
        <div style={{width: '50%', height: '360px'}}>
          <UBinGCBarChartVX data={samples} title='GC distribution' xName='gc' yName='length' xDomain={domain ? domain.x : undefined}
                            coverageRange={domain ? domain.y : undefined} setWorldDomain={setDomainX} selectedTaxonomy={selectedTaxonomy}
                            domainChangeHandler={domainChangeHandler} bin={bin} binView={binView} excludedTaxonomies={excludedTaxonomies}
                            width={400} height={300}/>
        </div>
        <div style={{width: '50%', height: '360px'}}>
          <UBinCoverageBarChartVX data={samples} title='Coverage distribution' xName='coverage' yName='length' xDomain={domain ? domain.x : undefined}
                                    setWorldDomain={setDomainY} selectedTaxonomy={selectedTaxonomy} yDomain={domain ? domain.y : undefined}
                                    domainChangeHandler={domainChangeHandler} bin={bin} binView={binView} excludedTaxonomies={excludedTaxonomies}
                                    width={400} topChartHeight={300} bottomChartHeight={130}/>
          {/* <CoverageBarChartsWrapper cf={cf} samples={samples} setDomainY={setDomainY} selectedTaxonomy={selectedTaxonomy} excludedTaxonomies={excludedTaxonomies}
                                    domainChangeHandler={domainChangeHandler} bin={bin} binView={binView} worldDomain={domain}/> */}
        </div>
      </div>
    )}
  }