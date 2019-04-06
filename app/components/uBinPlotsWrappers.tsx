
import * as React from 'react'
import {UBinSunburst} from './uBinSunburst'
import {GCCoverageBarCharts} from './gCCoverageBarCharts'
import {EnzymeDistributionBarCharts} from './enzymeDistributionBarCharts'
import {Connection} from 'typeorm'
import {IImportRecord} from '../controllers/samples'
import {IBin, IDomain} from "samples"
import {Bin} from '../db/entities/Bin'
import {ThunkAction} from 'redux-thunk'
import {IClientState} from '../controllers'
import {AnyAction} from 'redux'
// import {Crossfilter} from 'crossfilter2'
// import {Sample} from '../db/entities/Sample'
import {UBinScatter} from './uBinScatter'
import {Crossfilter} from 'crossfilter2'
import {Sample} from '../db/entities/Sample'
import * as crossfilter from 'crossfilter2'
import {Taxonomy} from '../db/entities/Taxonomy'
import {IValueMap} from "common"


interface IProps {
  connection: Connection | undefined
  importRecords: IImportRecord[]
  taxonomies: IValueMap<Taxonomy>
  archaealEnzymeTypes: string[]
  bacterialEnzymeTypes: string[]
  samples: any[]
  domain?: IDomain
  importRecordsState: {pending: boolean, loaded: boolean}
  bins: Bin[]
  binView: boolean
  selectedBin?: IBin
  updateSelectedTaxonomy(taxonomyId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateDomain(domain: IDomain): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateDomainX(domain: [number, number]): void
  updateDomainY(domain: [number, number]): void
}

interface IUBinPlotsWrappersState {
  cf: Crossfilter<Sample>
}

export class UBinPlotsWrappers extends React.PureComponent<IProps> {

  public state: IUBinPlotsWrappersState = {
    cf: crossfilter(this.props.samples),
  }

  render(): JSX.Element {
    let {samples, taxonomies, domain, selectedBin, binView, archaealEnzymeTypes, bacterialEnzymeTypes,
        updateSelectedTaxonomy, updateDomain, updateDomainX, updateDomainY} = this.props
    let {cf} = this.state
    return (
      <>
        <div style={{width: '70%'}}>
          <div style={{width: '100%', display: 'flex'}}>
            <div style={{width: '50%'}}>
              <UBinScatter cf={cf} domainChangeHandler={updateDomain} domain={domain} bin={selectedBin} binView={binView}/>
            </div>
            <div style={{width: '60%', marginTop: '30px'}}>
              {taxonomies &&
              <UBinSunburst data={{ children: []}} taxonomies={taxonomies} cf={cf} clickEvent={updateSelectedTaxonomy}/>}
            </div>
          </div>
          <GCCoverageBarCharts samples={samples} domain={domain}
                               setDomainX={updateDomainX} setDomainY={updateDomainY}
                               domainChangeHandler={updateDomain} bin={selectedBin} binView={binView}/>
        </div>
        <EnzymeDistributionBarCharts domain={domain} bin={selectedBin} cf={cf}
                                     archaealLabels={archaealEnzymeTypes} bacterialLabels={bacterialEnzymeTypes} binView={binView}/>
      </>
    )
  }
}