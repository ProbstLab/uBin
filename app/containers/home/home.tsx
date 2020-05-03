import * as React from 'react'
import {push} from 'connected-react-router'
import {AnyAction, bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router'
import {IClientState} from '../../controllers'
import {Button, Popover, Position, ButtonGroup, Spinner, Icon, Tag} from '@blueprintjs/core'
import {
  getImportRecords,
  IImportRecord,
  SamplesActions,
  getSamples,
  getDomain,
  getImportRecordsState,
  getBacterialEnzymeTypes,
  getArchaealEnzymeTypes,
  getBins,
  getSelectedBin,
  getBinView,
  getTaxonomiesMap,
  getSelectedTaxonomy,
  getExcludedTaxonomies, getActiveRecord, getTotalLength, getReloadSamples, getSelectedCount,
} from '../../controllers/samples'
import {DBActions, getSamplesStatePending} from '../../controllers/database'
import {Connection} from 'typeorm'
import {ThunkAction} from 'redux-thunk'
import {IBin, IDomain} from 'samples'
import {SampleMenu} from '../../components/sampleMenu'
import {BinMenu} from '../../components/binMenu'
import {Bin} from '../../db/entities/Bin'
import {UBinPlotsWrappers} from '../../components/uBinPlotsWrappers'
import {Taxonomy} from '../../db/entities/Taxonomy'
import {IValueMap} from 'common'
import {ResetMenu} from '../../components/resetMenu'
import {BinNaming} from '../../components/binNaming'

interface IProps extends RouteComponentProps {
}

interface IPropsFromState {
  connection: Connection | undefined
  importRecords: IImportRecord[]
  taxonomiesMap: IValueMap<Taxonomy>
  archaealEnzymeTypes: string[]
  bacterialEnzymeTypes: string[]
  samples: any[]
  domain?: IDomain
  importRecordsState: {pending: boolean, loaded: boolean}
  samplesPending: boolean
  bins: Bin[]
  binView: boolean
  activeRecord?: IImportRecord
  selectedBin?: IBin
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies: Taxonomy[]
  totalLength: number
  reloadSamples?: boolean
  selectedCount?: number
}

interface IActionsFromState {
  changePage(page: string): void
  startDb(): void
  refreshImports(): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  updateDomain(domain: IDomain): ThunkAction<Promise<void>, {}, IClientState, AnyAction>
  setDomain(domain: IDomain): void
  setDomainX(domain: [number, number]): void
  setDomainY(domain: [number, number]): void
  updateBinView(isActive: boolean): void
  setSelectedBin(bin: Bin): void
  setSelectedTaxonomy(taxonomy: Taxonomy): void
  addExcludedTaxonomy(taxonomy: Taxonomy): void
  resetFilters(): void
  resetGC(): void
  resetCoverage(): void
  resetTaxonomies(): void
  resetBin(): void
  setConsensus(consensus?: Taxonomy): void
  setGCAverage(avg: number): void
  setCoverageAverage(avg: number): void
  setTotalLength(length: number): void
  setSelectedCount(selectedCount: number): void
}

const homeStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'left',
  margin: '0',
  marginTop: '64px',
} as React.CSSProperties

type TProps = IProps & IPropsFromState & IActionsFromState

class CHome extends React.Component<TProps> {
  date: Date = new Date()
  wrapperKey: string = new Date().toISOString().toString()
  lastReloadState: boolean|undefined

  public componentDidMount(): void {
    this.props.refreshImports()
  }

  private toggleBinView(): void {
    this.props.updateBinView(!this.props.binView)
  }

  render(): JSX.Element {
    let { samples, samplesPending, taxonomiesMap, domain, archaealEnzymeTypes, bacterialEnzymeTypes, excludedTaxonomies, reloadSamples,
          setSelectedTaxonomy, updateDomain, setDomainX, setDomainY, connection, importRecords, addExcludedTaxonomy, setConsensus,
          importRecordsState, resetFilters, bins, binView, selectedBin, selectedTaxonomy, resetBin, resetGC, resetCoverage,
          resetTaxonomies, setGCAverage, setCoverageAverage, setTotalLength} = this.props

    const getBinDropdown = (): JSX.Element => {
      return (
        <Popover content={<BinMenu bins={bins} setSelectedBin={this.props.setSelectedBin}/>} position={Position.BOTTOM}>
          <Button disabled={!bins.length} icon={'layout-group-by'} text='Select Bin'/>
        </Popover>)
    }

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
        return (<UBinPlotsWrappers key={this.wrapperKey} connection={connection} archaealEnzymeTypes={archaealEnzymeTypes}
                                   bacterialEnzymeTypes={bacterialEnzymeTypes} samples={samples}
                                   bins={bins} binView={binView} selectedBin={selectedBin} taxonomies={taxonomiesMap} domain={domain}
                                   selectedTaxonomy={selectedTaxonomy} excludedTaxonomies={excludedTaxonomies} setConsensus={setConsensus}
                                   updateDomain={updateDomain} updateDomainX={setDomainX} updateDomainY={setDomainY}
                                   setSelectedTaxonomy={setSelectedTaxonomy} addExcludedTaxonomy={addExcludedTaxonomy}
                                   setGCAverage={setGCAverage} setCoverageAverage={setCoverageAverage} setTotalLength={setTotalLength}
                                   setSelectedCount={this.props.setSelectedCount}/>)
      }
    }
    let dataLoaded: boolean = !samplesPending && samples.length > 0
    if (reloadSamples && this.lastReloadState !== reloadSamples) {
      this.wrapperKey = new Date().toISOString().toString()
    }
    this.lastReloadState = reloadSamples
    return (
      <div>
        <div style={homeStyle}>
          <div style={{width: '100%', display: 'flex'}}>
            <div style={{width: '60%', minWidth: '400px'}}>
              <ButtonGroup>
                <Popover content={<SampleMenu importRecords={importRecords} importRecordsState={importRecordsState} />}
                         position={Position.RIGHT_BOTTOM}>
                  <Button icon='settings' text='Import/Export' />
                </Popover>
                {getBinDropdown()}
                <Popover disabled={!dataLoaded} content={<ResetMenu resetAll={resetFilters} resetGC={resetGC} resetCoverage={resetCoverage}
                                             resetTaxonomies={resetTaxonomies} resetBin={resetBin}/>}
                         position={Position.RIGHT_BOTTOM}>
                  <Button disabled={!dataLoaded} icon={'filter-remove'} text='Reset filters'/>
                </Popover>
                <Button disabled={!dataLoaded} text={binView ? 'Show all (filtered) scaffolds' : 'Limit to Bin'} icon={binView ? 'selection' : 'circle'}
                        onClick={() => this.toggleBinView()}/>
              </ButtonGroup>
            </div>
            <div style={{width: '40%', minWidth: '300px', display: 'flex'}}>
              <BinNaming dataLoaded={dataLoaded} activeRecord={this.props.activeRecord} data={samples} taxonomies={taxonomiesMap}/>
            </div>
          </div>

          <div>
          <div style={{marginTop: '8px'}}>
            {this.props.activeRecord && <Tag style={{maxHeight: '20px', margin: '4px'}} intent={'primary'} key={'activeRecord'}>Active Record: {this.props.activeRecord.name}</Tag>}
            {this.props.activeRecord && <Tag style={{maxHeight: '20px', margin: '4px'}} key={'lengthTotal'}>Length in total: {(this.props.totalLength/1000000).toFixed(2)} Mbps</Tag>}
            {selectedBin && <Tag style={{maxHeight: '20px', margin: '4px'}} intent={'success'} key={'selectedBin'}>Active Bin: {selectedBin.name}</Tag>}
            {selectedTaxonomy && <Tag style={{maxHeight: '20px', margin: '4px'}} intent={'warning'} key={'selectedTaxonomy'}>Selected Taxonomy: {selectedTaxonomy.name}</Tag>}
            {!!excludedTaxonomies.length &&
            <Tag style={{maxHeight: '20px', margin: '4px'}} intent={'danger'} key={'excludedTaxonomies'}>
                {excludedTaxonomies.length > 1 ? 'Excluded Taxonomies: '+excludedTaxonomies.length.toString() : 'Excluded Taxonomy: '+excludedTaxonomies[0].name}
            </Tag>}
          </div>
          <div>
            {!!samples.length && <Tag style={{maxHeight: '20px', margin: '4px'}} intent={'primary'} key={'selectedScaffolds'}>
                Selected: {this.props.selectedCount ? this.props.selectedCount : samples.length}/{samples.length}
            </Tag>}
            {domain && domain.x && <Tag style={{maxHeight: '20px', margin: '4px'}} intent={'primary'} key={'gcRange'}>
                GC Range: {Math.round(domain.x[0]*10)/10} - {Math.round(domain.x[1]*10)/10}
            </Tag>}
            {domain && domain.y && <Tag style={{maxHeight: '20px', margin: '4px'}} intent={'primary'} key={'coverageRange'}>
                Coverage Range: {Math.round(domain.y[0]*10)/10} - {Math.round(domain.y[1]*10)/10}
            </Tag>}
          </div>
          </div>

          <div style={{width: '100%', display: 'flex'}}>
            {showCharts(!!samples.length)}
          </div>
        </div>
      </div>

    )
  }
}

const mapStateToProps = (state: IClientState): IPropsFromState => ({
  activeRecord: getActiveRecord(state),
  importRecords: getImportRecords(state),
  connection: state.database.connection,
  taxonomiesMap: getTaxonomiesMap(state),
  samples: getSamples(state),
  samplesPending: getSamplesStatePending(state),
  importRecordsState: getImportRecordsState(state),
  domain: getDomain(state),
  archaealEnzymeTypes: getArchaealEnzymeTypes(state),
  bacterialEnzymeTypes: getBacterialEnzymeTypes(state),
  bins: getBins(state),
  binView: getBinView(state),
  selectedBin: getSelectedBin(state),
  selectedTaxonomy: getSelectedTaxonomy(state),
  excludedTaxonomies: getExcludedTaxonomies(state),
  totalLength: getTotalLength(state),
  reloadSamples: getReloadSamples(state),
  selectedCount: getSelectedCount(state),
})

const mapDispatchToProps = (dispatch: Dispatch): IActionsFromState =>
  bindActionCreators(
    {
      changePage: push,
      startDb: DBActions.startDatabase,
      refreshImports: DBActions.refreshImports,
      setDomain: domain => SamplesActions.setDomain(domain),
      updateDomain: domain => SamplesActions.updateDomain(domain),
      setDomainX: domainX => SamplesActions.setDomainX(domainX),
      setDomainY: domainY => SamplesActions.setDomainY(domainY),
      updateBinView: isActive => SamplesActions.updateBinView(isActive),
      setSelectedBin: binId => SamplesActions.setSelectedBin(binId),
      setSelectedTaxonomy: taxonomyId => SamplesActions.setSelectedTaxonomy(taxonomyId),
      addExcludedTaxonomy: taxonomyId => SamplesActions.addExcludedTaxonomy(taxonomyId),
      setConsensus: consensus => SamplesActions.setConsensus(consensus),
      setGCAverage: consensus => SamplesActions.setGCAverage(consensus),
      setCoverageAverage: consensus => SamplesActions.setCoverageAverage(consensus),
      setTotalLength: length => SamplesActions.setTotalLength(length),
      setSelectedCount: selectedCount => SamplesActions.setSelectedCount(selectedCount),
      resetFilters: SamplesActions.resetFilters,
      resetGC: SamplesActions.resetGC,
      resetCoverage: SamplesActions.resetCoverage,
      resetTaxonomies: SamplesActions.resetTaxonomies,
      resetBin: SamplesActions.resetBin,
    },
    dispatch,
  )

export const Home = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CHome),
)
