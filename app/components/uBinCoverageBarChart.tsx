import * as React from 'react'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryBrushContainer, VictoryLabel} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'
import {IBin, IDomain} from 'samples'
import {Sample} from '../db/entities/Sample'
import {numToColour} from '../utils/convert'
import {compareArrayToString} from '../utils/compare'
import {Taxonomy} from '../db/entities/Taxonomy'

interface IProps {
  cf: Crossfilter<Sample>
  title: string
  gcRange?: [number, number]
  coverageRange?: [number, number]
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
  bin?: IBin
  binView: boolean
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies?: Taxonomy[]
  range?: [number, number]
  setWorldDomain(domain: [number, number]): void
  domainChangeHandler(domain: IDomain): void
}

export interface IBarCharState {
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<Sample, number>
  coverageDim?: Dimension<Sample, number>
  gcDim?: Dimension<Sample, number>
  binDim?: Dimension<Sample, number>
  taxonomyDim?: Dimension<Sample, string>
}

export class UBinCoverageBarChart extends React.Component<IProps> {

  yMax: number = 0
  currentDomain?: any
  activeBin?: number
  binRange?: [number, number]

  public state: IBarCharState = {}

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      let {cf} = this.props
      this.setState({binDim: cf.dimension((d: Sample) => d.bin ? d.bin.id : 0)})
      this.setState({
        coverageDim: cf.dimension((d: Sample) => d.coverage),
        gcDim: cf.dimension((d: Sample) => d.gc),
        groupDim: cf.dimension((d: Sample) => Math.round(d.coverage)),
        taxonomyDim: cf.dimension((d: Sample) => d.taxonomiesRelationString),
      })
    }
  }

  public componentWillUpdate(nextProps: IProps): void {
    let { coverageRange } = nextProps
    if (this.currentDomain !== coverageRange) {
      this.currentDomain = coverageRange
    }
  }

  public handleBrushChange(domain: any): void {
    this.currentDomain = domain.x
  }

  public handleBrushChangeEnd(): void {
    this.props.setWorldDomain(this.currentDomain.slice())
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

  public roundLarge(num: number, i: number, o: number): number {
    return Math.ceil((num - o) / i ) * i + o;
  }

  public getData(): any[] {
    let { groupDim, gcDim, coverageDim, binDim, taxonomyDim } = this.state
    if (groupDim && coverageDim && gcDim && binDim && taxonomyDim) {
      let binChanged: boolean = false
      let {xName, yName, bin, binView, range, gcRange, selectedTaxonomy, excludedTaxonomies} = this.props

      if (range) {
        coverageDim.filterRange(range)
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
      if (gcRange) {
        gcDim.filterRange(gcRange)
      } else {
        gcDim.filterAll()
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
        this.yMax = 0
        let grouped: any[] = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
        let bottom: Sample = groupDim.bottom(1)[0]
        let top: Sample = groupDim.top(1)[0]
        if (bottom && top) {
          if (this.currentDomain) {
            if (bottom.coverage > this.currentDomain[0]) {
              this.currentDomain[0] = bottom.coverage
            }
            if (top.coverage < this.currentDomain[1]) {
              this.currentDomain[1] = top.coverage
            }
          }
          if (binChanged) {
            this.binRange = [bottom[xName], top[xName]]
          }
        }
        if (grouped) {
          let arr: any[] = grouped.filter((value: any) => value.value.count).map((value: any) => {
              let obj: any = {}
              obj[xName || 'x'] = value.key
              obj[yName || 'x'] = value.value.xSum
              if (value.value.xSum > this.yMax) {
                this.yMax = value.value.xSum
              }
              return obj
            })
          return arr
        }
      }
    }
    return []
  }

  public render(): JSX.Element {
    // console.log("currentDomain:", this.currentDomain)
    let {xName, bin} = this.props
    let {binRange} = this
    let binColour: string
    if (bin && xName) {
      binColour = numToColour(bin.id)
    }
    return (
      <VictoryChart theme={VictoryTheme.material} domainPadding={20}
                    height={300}
                    width={400}
                    padding={{ left: 50, top: 20, right: 10, bottom: 25 }}
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
          tickFormat={(t: number) => {return  t >= 1000 ? `${Math.round(t)/1000}k` : Math.round(t*100)/100}}
        />
        <VictoryAxis
          label={'length'}
          axisLabelComponent={<VictoryLabel x={10} />}
          tickFormat={(t: number) => {return  t >= 1000000 ? `${Math.round(t)/1000000}M` : t >= 1000 ? `${Math.round(t)/1000}k` : t}}
          dependentAxis={true}
        />
        <VictoryBar
          style={{
            data: {
              fill: (d) => binRange && binRange[0] <= d[xName || 'x'] && binRange[1] >= d[xName || 'x'] ? binColour : "#455a64",
            },
          }}
          barRatio={0.4}
          data={this.getData()}
          x={this.props.xName || 'x'}
          y={this.props.yName || 'y'}
        />
      </VictoryChart>
    )
  }
}
