import * as React from 'react'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryBrushContainer} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'
import {IBin, IDomain} from 'samples'
import {Sample} from '../db/entities/Sample'
import crossfilter = require('crossfilter2')

interface IProps {
  data: any[]
  title: string
  xDomain?: [number, number]
  coverageRange?: [number, number]
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
  bin?: IBin
  range?: [number, number]
  setWorldDomain(domain: [number, number]): void
  domainChangeHandler(domain: IDomain): void
}

export interface IBarCharState {
  cf: Crossfilter<Sample>
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<Sample, number>
  coverageDim?: Dimension<Sample, number>
  binDim?: Dimension<Sample, number>
  originalXDomain?: [number, number]
}

export class UBinGCBarChart extends React.Component<IProps> {

  yMax: number = 0
  currentDomain?: any

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
    let { xDomain } = this.props
    if (xDomain && this.currentDomain !== xDomain) {
      this.currentDomain = xDomain
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

  public getData(): any[] {
    let { groupDim, coverageDim, binDim } = this.state
    if (groupDim && coverageDim && binDim) {
      let {xName, yName, bin} = this.props
      let { coverageRange } = this.props
      if (coverageRange) {
        coverageDim.filterRange(coverageRange)
      } else {
        coverageDim.filterAll()
      }
      if (bin) {
        binDim.filterExact(bin.id)
      } else {
        binDim.filterAll()
      }
      if (xName) {
        let grouped: any[] = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
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
          tickValues={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
          label={this.props.xName || 'x'}
          fixLabelOverlap={true}
        />
        <VictoryAxis
          label={this.props.yName || 'y'}
          tickFormat={(t: number) => {return  t >= 1000000 ? `${Math.round(t)/1000000}M` : t >= 1000 ? `${Math.round(t)/1000}K` : t}}
          dependentAxis={true}
        />
        <VictoryBar
          barRatio={0.1}
          data={this.getData()}
          x={this.props.xName || 'x'}
          y={this.props.yName || 'y'}
        />
      </VictoryChart>
    )
  }
}
