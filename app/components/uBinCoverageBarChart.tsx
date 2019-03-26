import * as React from 'react'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryBrushContainer} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'
import {IBin, IScatterDomain} from 'samples'
import {Sample} from '../db/entities/Sample'

interface IProps {
  cf: Crossfilter<Sample>
  title: string
  gcRange?: [number, number]
  coverageRange?: [number, number]
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
  bin?: IBin
  range?: [number, number]
  setWorldDomain(domain: [number, number]): void
  domainChangeHandler(scatterDomain: IScatterDomain): void
}

export interface IBarCharState {
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<Sample, number>
  coverageDim?: Dimension<Sample, number>
  gcDim?: Dimension<Sample, number>
  binDim?: Dimension<Sample, number>
  originalXDomain?: [number, number]
}

export class UBinCoverageBarChart extends React.Component<IProps> {

  yMax: number = 0
  currentDomain?: any

  public state: IBarCharState = {}

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      let {cf} = this.props
      this.setState({binDim: cf.dimension((d: Sample) => d.bin ? d.bin.id : 0)})
      this.setState({
        coverageDim: cf.dimension((d: Sample) => d.coverage),
        gcDim: cf.dimension((d: Sample) => d.gc),
        groupDim: cf.dimension((d: Sample) => Math.round(d.coverage)),
      })
    }
  }

  public componentDidMount(): void {
    let { groupDim } = this.state
    let { xName } = this.props
    if (groupDim && xName) {
      this.setState({originalXDomain: [groupDim.bottom(1)[0][xName], groupDim.top(1)[0][xName]]})
    }
  }

  public componentDidUpdate(): void {
    let { coverageRange } = this.props
    if (coverageRange && this.currentDomain !== coverageRange) {
      this.currentDomain = coverageRange
    }
  }

  public handleBrushChange(domain: any): void {
    this.currentDomain = domain.x
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

  public roundLarge(num: number, i: number, o: number): number {
    return Math.ceil((num - o) / i ) * i + o;
  }

  public getData(): any[] {
    let { groupDim, gcDim, coverageDim, binDim } = this.state
    if (groupDim && coverageDim && gcDim && binDim) {
      let {xName, yName, bin, range, gcRange} = this.props

      if (range) {
        coverageDim.filterRange(range)
      } else {
        coverageDim.filterAll()
      }
      if (bin) {
        binDim.filterExact(bin.id)
      } else {
        binDim.filterAll()
      }
      if (gcRange) {
        gcDim.filterRange(gcRange)
      } else {
        gcDim.filterAll()
      }
      if (xName) {
        this.yMax = 0
        let grouped: any[] = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
        let bottom: Sample = groupDim.bottom(1)[0]
        let top: Sample = groupDim.top(1)[0]
        if (this.currentDomain) {
          if (bottom.coverage > this.currentDomain[0]) {
            this.currentDomain[0] = bottom.coverage
          }
          if (top.coverage < this.currentDomain[1]) {
            this.currentDomain[1] = top.coverage
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
    return (
      <VictoryChart theme={VictoryTheme.material} domainPadding={20}
                    height={300}
                    width={400}
                    padding={{ left: 40, top: 20, right: 10, bottom: 40 }}
                    containerComponent={
                    <VictoryBrushContainer
                      brushDimension='x'
                      brushDomain={{x: this.currentDomain}}
                      onBrushDomainChange={(domain: any, props: any) => this.handleBrushChange(domain)}
                      onBrushDomainChangeEnd={() => this.handleBrushChangeEnd()}
                      />
                    }>
        <VictoryAxis
          tickFormat={(t: number) => {return  t >= 1000 ? `${Math.round(t)/1000}k` : Math.round(t*100)/100}}
        />
        <VictoryAxis
          tickFormat={(t: number) => {return  t >= 1000000 ? `${Math.round(t)/1000000}M` : t >= 1000 ? `${Math.round(t)/1000}K` : t}}
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
