
import * as React from 'react'
import {UBinSunburst} from './uBinSunburst'
import {GCCoverageBarCharts} from './gCCoverageBarCharts'
import {EnzymeDistributionBarCharts} from './enzymeDistributionBarCharts'
import {Connection} from 'typeorm'
import {IBin, IDomain} from "samples"
import {Bin} from '../db/entities/Bin'
import {ThunkAction} from 'redux-thunk'
import {IClientState} from '../controllers'
import {AnyAction} from 'redux'
import {UBinScatter} from './uBinScatter'
import {Crossfilter} from 'crossfilter2'
import {Sample} from '../db/entities/Sample'
import * as crossfilter from 'crossfilter2'
import {Taxonomy} from '../db/entities/Taxonomy'
import {IValueMap} from "common"


interface IProps {
  connection: Connection | undefined
  taxonomies: IValueMap<Taxonomy>
  archaealEnzymeTypes: string[]
  bacterialEnzymeTypes: string[]
  samples: any[]
  domain?: IDomain
  bins: Bin[]
  binView: boolean
  selectedBin?: IBin
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies: Taxonomy[]
  setSelectedTaxonomy(taxonomy: Taxonomy): void
  addExcludedTaxonomy(taxonomy: Taxonomy): void
  updateDomain(domain: IDomain): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateDomainX(domain: [number, number]): void
  updateDomainY(domain: [number, number]): void
  setConsensus(consensus?: Taxonomy): void
  setGCAverage(avg: number): void
  setCoverageAverage(avg: number): void
  setTotalLength(length: number): void
  setSelectedCount(selectedCount: number): void
}

interface IUBinPlotsWrappersState {
  cf: Crossfilter<Sample>
}

export class UBinPlotsWrappers extends React.Component<IProps> {
  lastState: any

  public state: IUBinPlotsWrappersState = {
    cf: crossfilter(this.props.samples),
  }

  public shouldComponentUpdate(nextProps: IProps): boolean {
    if (this.props.samples.length !== nextProps.samples.length){ return true }
    if (this.props.binView !== nextProps.binView){ return true }
    if (this.props.domain !== nextProps.domain){ return true }
    if (this.props.selectedBin !== nextProps.selectedBin){ return true }
    if (this.props.selectedTaxonomy !== nextProps.selectedTaxonomy){ return true }
    if (this.props.excludedTaxonomies !== nextProps.excludedTaxonomies){ return true }
    if (this.props.connection !== nextProps.connection){ return true }
    if (this.props.bins !== nextProps.bins){ return true }
    return false
  }

  render(): JSX.Element {
    let {samples, taxonomies, domain, selectedBin, binView, archaealEnzymeTypes, bacterialEnzymeTypes, selectedTaxonomy, excludedTaxonomies,
         setSelectedTaxonomy, addExcludedTaxonomy, updateDomain, updateDomainX, updateDomainY, setConsensus, setGCAverage, setCoverageAverage,
         setSelectedCount, setTotalLength} = this.props
    let {cf} = this.state
    this.lastState = cf

    return (
      <>
        <div style={{width: '60%'}}>
          <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <UBinScatter cf={cf} domainChangeHandler={updateDomain} domain={domain} bin={selectedBin} excludedTaxonomies={excludedTaxonomies}
                           selectedTaxonomy={selectedTaxonomy} binView={binView} setGCAverage={setGCAverage} setCoverageAverage={setCoverageAverage}
                           setTotalLength={setTotalLength} setSelectedCount={setSelectedCount}/>
            </div>
            <div style={{width: '360px', marginTop: '30px'}}>
              <UBinSunburst data={{ children: []}} taxonomies={taxonomies} cf={cf} setConsensus={setConsensus}
                            selectTaxonomy={setSelectedTaxonomy} excludeTaxonomy={addExcludedTaxonomy}/>
            </div>
          </div>
          <GCCoverageBarCharts samples={samples} domain={domain} selectedTaxonomy={selectedTaxonomy}
                               setDomainX={updateDomainX} setDomainY={updateDomainY} excludedTaxonomies={excludedTaxonomies}
                               domainChangeHandler={updateDomain} bin={selectedBin} binView={binView}/>
        </div>
        <div style={{width: '40%'}}>
          <EnzymeDistributionBarCharts domain={domain} bin={selectedBin} cf={cf}
                                       archaealLabels={archaealEnzymeTypes} bacterialLabels={bacterialEnzymeTypes} binView={binView}/>
        </div>
      </>
    )
  }
}