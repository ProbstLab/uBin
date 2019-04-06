
import * as React from 'react'
import {Icon, Spinner} from '@blueprintjs/core'
import {UBinSunburst} from './uBinSunburst'
import {GCCoverageBarCharts} from './gCCoverageBarCharts'
import {EnzymeDistributionBarCharts} from './enzymeDistributionBarCharts'
import {Connection} from 'typeorm'
import {IImportRecord} from '../controllers/samples'
import {ITaxonomyForSunburst} from '../utils/interfaces'
import {IBin, IDomain} from "samples"
import {Bin} from '../db/entities/Bin'
import {ThunkAction} from 'redux-thunk'
import {IClientState} from '../controllers'
import {AnyAction} from 'redux'
// import {Crossfilter} from 'crossfilter2'
// import {Sample} from '../db/entities/Sample'
import {UBinScatter} from './uBinScatter'


interface IProps {
  connection: Connection | undefined
  importRecords: IImportRecord[]
  taxonomyTreeFull?: ITaxonomyForSunburst[]
  archaealEnzymeTypes: string[]
  bacterialEnzymeTypes: string[]
  samples: any[]
  domain?: IDomain
  importRecordsState: {pending: boolean, loaded: boolean}
  samplesPending: boolean
  bins: Bin[]
  binView: boolean
  selectedBin?: IBin
  updateSelectedTaxonomy(taxonomyId: number): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateDomain(domain: IDomain): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateDomainX(domain: [number, number]): void
  updateDomainY(domain: [number, number]): void
}

export class UBinPlotsWrappers extends React.PureComponent<IProps> {

  render(): JSX.Element {
    const showScatter = (isReady: boolean): any => {
      if (isReady) {
        return <UBinScatter data={samples} domainChangeHandler={updateDomain} domain={domain} bin={selectedBin} binView={binView}/>
      } else {
        return <Spinner size={20}/>
      }
    }
    let {samplesPending, samples, taxonomyTreeFull, domain, selectedBin, binView, archaealEnzymeTypes, bacterialEnzymeTypes,
      updateSelectedTaxonomy, updateDomain, updateDomainX, updateDomainY} = this.props
    const showCharts = (show: boolean): JSX.Element => {
      if (samplesPending) {
        return (
          <div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', height: '80vh', width: '100%'}}>
            <Spinner size={100}/>
          </div>
        )
      } else if (!samples.length) {
        return (
          <div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', height: '80vh', width: '100%'}}>
            <h2>Click on <span
              style={{backgroundColor: '#efefef', borderRadius: '4px', padding: '6px', margin: '6px', fontSize: 'initial', fontWeight: 400}}>
              <Icon icon={'import'}/> Import</span> to import your datasets and get started!</h2>
          </div>
        )
      } else {
        return (
          <>
            <div style={{width: '70%'}}>
              <div style={{width: '100%', display: 'flex'}}>
                <div style={{width: '50%'}}>
                  {showScatter(!!samples.length)}
                </div>
                <div style={{width: '60%', marginTop: '30px'}}>
                  {taxonomyTreeFull &&
                  <UBinSunburst data={{ children: taxonomyTreeFull}} clickEvent={updateSelectedTaxonomy}/>}
                </div>
              </div>
              <GCCoverageBarCharts samples={samples} samplesPending={samplesPending} domain={domain}
                                   setDomainX={updateDomainX} setDomainY={updateDomainY}
                                   domainChangeHandler={updateDomain} bin={selectedBin} binView={binView}/>
            </div>
            <EnzymeDistributionBarCharts samples={samples} samplesPending={samplesPending} domain={domain} bin={selectedBin}
                                         archaealLabels={archaealEnzymeTypes} bacterialLabels={bacterialEnzymeTypes} binView={binView}/>
          </>
        )
      }
    }
    return (
      showCharts(!!samples.length)
    )
  }
}