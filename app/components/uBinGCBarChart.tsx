import * as React from 'react'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryBrushContainer, VictoryLabel} from 'victory'
import {Crossfilter, Dimension, Grouping} from 'crossfilter2'
import {IBin, IDomain} from 'samples'
import {Sample} from '../db/entities/Sample'
import * as crossfilter from 'crossfilter2'
import {numToColour} from '../utils/convert'
import {compareArrayToString} from '../utils/compare'
import {Taxonomy} from '../db/entities/Taxonomy'

interface IProps {
  data: any[]
  title: string
  xDomain?: [number, number]
  coverageRange?: [number, number]
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
  bin?: IBin
  binView: boolean
  range?: [number, number]
  setWorldDomain(domain: [number, number]): void
  domainChangeHandler(domain: IDomain): void
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies?: Taxonomy[]
}

export interface IBarCharState {
  cf: Crossfilter<Sample>
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<Sample, number>
  coverageDim?: Dimension<Sample, number>
  binDim?: Dimension<Sample, number>
  taxonomyDim?: Dimension<Sample, string>
}

export class UBinGCBarChart extends React.Component<IProps> {

  yMax: number = 0
  currentDomain?: any
  activeBin?: number
  binRange?: [number, number]

  public state: IBarCharState = {
    cf: crossfilter(this.props.data),
  }

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      let {cf} = this.state
      this.setState({binDim: cf.dimension((d: Sample) => d.bin ? d.bin.id : 0)})
      this.setState({
        coverageDim: cf.dimension((d: Sample) => d.coverage),
        groupDim: cf.dimension((d: Sample) => Math.round(d.gc)),
        taxonomyDim: cf.dimension((d: Sample) => d.taxonomiesRelationString),
      })
    }
  }

  public componentWillUpdate(nextProps: IProps): void {
    let { xDomain } = nextProps
    if (this.currentDomain !== xDomain) {
      this.currentDomain = xDomain
    }
  }

  public handleBrushChange(domain: any): void {
    this.currentDomain = domain.x
    if (this.currentDomain && this.currentDomain[1] > 100) { this.currentDomain[1] = 100 }
  }

  public handleBrushChangeEnd(): void {
    this.props.setWorldDomain(this.currentDomain)
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
    let {groupDim, coverageDim, binDim, taxonomyDim} = this.state
    if (groupDim && coverageDim && binDim && taxonomyDim) {
      let binChanged: boolean = false
      let {xName, yName, bin, binView, coverageRange, selectedTaxonomy, excludedTaxonomies} = this.props
      if (coverageRange) {
        coverageDim.filterRange(coverageRange)
      } else {
        coverageDim.filterAll()
      }
      if (bin && binView) {
        binDim.filterExact(bin.id)
        if (this.activeBin !== bin.id) {
          this.activeBin = bin.id
          this.binRange = undefined
          binChanged = true
        }
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
      if (xName) {
        let bottom: Sample =  groupDim.bottom(1)[0]
        let top: Sample =  groupDim.top(1)[0]
        let grouped: readonly Grouping<any, any>[] = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
        if (bottom && top && binChanged) {
          this.binRange = [groupDim.bottom(1)[0][xName], groupDim.top(1)[0][xName]]
        }
        if (grouped) {
          let arr: any[] = grouped.filter((value: any) => value.value.count).map((value: any) => {
              let obj: any = {}
              obj[xName || 'x'] = value.key
              obj[yName || 'x'] = value.value.xSum
              return obj
            })
          return arr
        }
      }
    }
    return []
  }

  public render(): JSX.Element {
    let {xName, bin} = this.props
    let {binRange} = this
    let binColour: string
    if (bin && xName) {
      binColour = numToColour(bin.id)
    }
    // console.log("currentDomain GC:", this.currentDomain)
    return (
      <VictoryChart theme={VictoryTheme.material} domainPadding={10}
                    height={300}
                    width={400}
                    padding={{ left: 50, top: 20, right: 10, bottom: 40 }}
                    containerComponent={
                    <VictoryBrushContainer
                      brushDimension='x'
                      brushDomain={{x: this.currentDomain}}
                      onBrushDomainChange={(domain: any, props: any) => this.handleBrushChange(domain)}
                      onBrushDomainChangeEnd={() => this.handleBrushChangeEnd()}
                      />
                    }>
        <VictoryLabel text={this.props.title} x={200} y={10} textAnchor="middle"/>
        <VictoryAxis
          axisLabelComponent={<VictoryLabel y={285} />}
          tickValues={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
          label={this.props.xName || 'x'}
          fixLabelOverlap={true}
        />
        <VictoryAxis
          axisLabelComponent={<VictoryLabel x={10} />}
          label={this.props.yName || 'y'}
          tickFormat={(t: number) => {return  t >= 1000000 ? `${Math.round(t)/1000000}M` : t >= 1000 ? `${Math.round(t)/1000}K` : t}}
          dependentAxis={true}
        />
        <VictoryBar
          style={{
            data: {
              fill: (d) => binRange && binRange[0] <= d[xName || 'x'] && binRange[1] >= d[xName || 'x'] ? binColour : "#455a64",
            },
          }}
          barRatio={0.1}
          data={this.getData()}
          x={this.props.xName || 'x'}
          y={this.props.yName || 'y'}
        />
      </VictoryChart>
    )
  }
}
