import * as React from 'react'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryBrushContainer, VictoryLabel} from 'victory'
import {Crossfilter, Dimension, Grouping} from 'crossfilter2'
import {IBin} from 'samples'
import {Sample} from '../db/entities/Sample'
import {compareArrayToString} from '../utils/compare'
import {Taxonomy} from '../db/entities/Taxonomy'

interface IProps {
  cf: Crossfilter<Sample>
  title: string
  worldDomain?: [number, number]
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
  bin?: IBin
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies?: Taxonomy[]
  binView: boolean
  setRange(range: [number, number]): void
}

export interface IBarCharState {
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<Sample, number>
  binDim?: Dimension<Sample, number>
  taxonomyDim?: Dimension<Sample, string>
}

export class UBinSelectBarChartOverview extends React.Component<IProps> {

  yMax: number = 0
  totalCount?: number
  currentDomain?: any
  changedBin: boolean = true
  groupDimRange?: number

  public state: IBarCharState = {}

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      let {cf} = this.props
      this.setState({binDim: cf.dimension((d: Sample) => d.bin ? d.bin.id : 0)})
      if (this.props.xName === 'coverage') {
        this.setState({
          groupDim: cf.dimension((d: Sample) => Math.round(d.coverage/10)*10),
          taxonomyDim: cf.dimension((d: Sample) => d.taxonomiesRelationString),
        })
      } else if (this.props.xName === 'gc') {
        this.setState({
          groupDim: cf.dimension((d: Sample) => Math.round(d.gc)),
          taxonomyDim: cf.dimension((d: Sample) => d.taxonomiesRelationString),
        })
      }
    }
  }

  public componentWillUpdate(nextProps: IProps): void {
    let { worldDomain, bin } = nextProps
    if (this.currentDomain !== worldDomain) {
      this.currentDomain = worldDomain
    }
    if (bin !== this.props.bin) {
      this.changedBin = true
    }
  }

  public componentDidUpdate(): void {
    if (this.changedBin) {
      let {cf} = this.props
      let tmpDimension = cf.dimension((d: Sample) => d.coverage)
      let groupDimTop = tmpDimension.top(1)[0].coverage
      let groupDimBottom = tmpDimension.bottom(1)[0].coverage
      let covRange = Math.sqrt(groupDimTop**2 - groupDimBottom**2)
      if (covRange <= 50) {
        this.setState({groupDim: cf.dimension((d: Sample) => d.coverage)})
      } else if (covRange <= 100) {
        this.setState({groupDim: cf.dimension((d: Sample) => Math.round(d.coverage/2)*2)})
      } else if (covRange <= 250) {
        this.setState({groupDim: cf.dimension((d: Sample) => Math.round(d.coverage/5)*5)})
      } else {
        this.setState({groupDim: cf.dimension((d: Sample) => Math.round(d.coverage/10)*10)})
      }
      this.groupDimRange = covRange
      this.changedBin = false
    }
  }

  public handleBrushChange(domain: any): void {
    this.currentDomain = domain.x
  }

  public handleBrushChangeEnd(): void {
    this.props.setRange(this.currentDomain)
  }

  public reduceInitial(): any {
    return {xSum: 0, count: 0}
  }

  public reduceAddLength(p: any, v: Sample): any {
    p.xSum += v.length
    p.count += 1
    return p
  }

  public reduceRemoveLength(p: any, v: Sample): any {
    p.xSum -= v.length
    p.count -= 1
    return p
  }

  public getData(): any[] {
    let { groupDim, binDim, taxonomyDim } = this.state
    if (groupDim && binDim && taxonomyDim) {
      let { bin, binView, xName, yName, selectedTaxonomy, excludedTaxonomies } = this.props
      if (bin && binView) {
        binDim.filterExact(bin.id)
      } else {
        binDim.filterAll()
      }
      if (selectedTaxonomy) {
        let taxonomyString: string = ';'+selectedTaxonomy.id.toString()+';'
        let excludedTaxonomyStrings: string[] = excludedTaxonomies ? excludedTaxonomies.map(excludedTaxonomy => ';'+excludedTaxonomy.id.toString()+';') : []
        if (excludedTaxonomyStrings.length) {
          taxonomyDim.filterFunction((d: string) => d.indexOf(taxonomyString) >= 0 && !compareArrayToString(d, excludedTaxonomyStrings))
        } else {
          taxonomyDim.filterFunction((d: string) => d.indexOf(taxonomyString) >= 0)
        }
      } else if (excludedTaxonomies && excludedTaxonomies.length) {
        let excludedTaxonomyStrings: string[] = excludedTaxonomies ? excludedTaxonomies.map(excludedTaxonomy => ';'+excludedTaxonomy.id.toString()+';') : []
        taxonomyDim.filterFunction((d: string) => !compareArrayToString(d, excludedTaxonomyStrings))
      } else {
        taxonomyDim.filterAll()
      }
      let grouped: readonly Grouping<any, any>[]
      switch (xName) {
        case 'gc':
          grouped = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
          break
        case 'coverage':
          grouped = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
          break
      }
      this.totalCount = 0
      return grouped.filter((value: any) => value.value.count).map((value: any) => {
        let obj: any = {}
        obj[xName || 'x'] = value.key
        obj[yName || 'x'] = value.value.xSum
        this.totalCount += value.value.xSum
        return obj
      })
    }
    return []
  }

  public render(): JSX.Element {
    return (
      <VictoryChart theme={VictoryTheme.material} domainPadding={20}
                    height={120}
                    width={400}
                    padding={{ left: 50, top: 4, right: 10, bottom: 45 }}
                    containerComponent={
                    <VictoryBrushContainer
                      brushDimension='x'
                      onBrushDomainChange={(domain: any, props: any) => this.handleBrushChange(domain)}
                      onBrushDomainChangeEnd={() => this.handleBrushChangeEnd()}
                      />
                    }>
        {/*<VictoryLabel text={this.props.title} x={200} y={8} textAnchor="middle"/>*/}
        <VictoryAxis
          label={'coverage'}
          axisLabelComponent={<VictoryLabel y={100} />}
          tickFormat={(t: number) => {return  t >= 1000 ? `${Math.round(t)/1000}k` : Math.round(t*100)/100}}
        />
        <VictoryAxis
          tickFormat={(t: number) => {return this.totalCount ? `${Math.round((t/this.totalCount)*100)}%` : ''}}
          dependentAxis={true}
        />
        <VictoryBar
          barRatio={0.4}
          data={this.getData()}
          x={this.props.xName || 'x'}
          y={this.props.yName || 'y'}
        />
      </VictoryChart>
    )
  }
}
