import * as React from 'react'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryBrushContainer} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'
import {IBin} from 'samples'
import {Sample} from '../db/entities/Sample'

interface IProps {
  cf: Crossfilter<Sample>
  title: string
  worldDomain?: [number, number]
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
  bin?: IBin
  binView: boolean
  setRange(range: [number, number]): void
}

export interface IBarCharState {
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<Sample, number>
  binDim?: Dimension<Sample, number>
  originalXDomain?: [number, number]
}

export class UBinSelectBarChartOverview extends React.Component<IProps> {

  yMax: number = 0
  currentDomain?: any

  public state: IBarCharState = {}

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      let {cf} = this.props
      this.setState({binDim: cf.dimension((d: Sample) => d.bin ? d.bin.id : 0)})
      if (this.props.xName === 'coverage') {
        this.setState({
          groupDim: cf.dimension((d: Sample) => Math.round(d.coverage/10)*10),
        })
      } else if (this.props.xName === 'gc') {
        this.setState({
          groupDim: cf.dimension((d: Sample) => Math.round(d.gc)),
        })
      }
    }
  }

  public componentDidMount(): void {
    let { groupDim } = this.state
    if (groupDim) {
      switch (this.props.xName) {
        case ('coverage'):
          this.setState({originalXDomain: [groupDim.bottom(1)[0][this.props.xName], groupDim.top(1)[0][this.props.xName]]})
          break
        case ('gc'):
          this.setState({originalXDomain: [groupDim.bottom(1)[0][this.props.xName], groupDim.top(1)[0][this.props.xName]]})
          break
      }
    }
  }

  public componentDidUpdate(): void {
    let { worldDomain } = this.props
    if (worldDomain && this.currentDomain !== worldDomain) {
      this.currentDomain = worldDomain
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
    let { groupDim, binDim } = this.state
    if (groupDim && binDim) {
      let { bin, binView, xName, yName } = this.props
      if (bin && binView) {
        binDim.filterExact(bin.id)
      } else {
        binDim.filterAll()
      }
      let grouped: any[] = []
      switch (xName) {
        case 'gc':
          grouped = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
          break
        case 'coverage':
          grouped = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
          break
      }
      let arr: any[] = grouped.filter((value: any) => value.value.count).map((value: any) => {
        let obj: any = {}
        obj[xName || 'x'] = value.key
        obj[yName || 'x'] = value.value.xSum
        return obj
      })
      return arr
    }
    return []
  }

  public render(): JSX.Element {
    return (
      <VictoryChart theme={VictoryTheme.material} domainPadding={20}
                    height={100}
                    width={400}
                    padding={{ left: 40, top: 6, right: 10, bottom: 20 }}
                    containerComponent={
                    <VictoryBrushContainer
                      brushDimension='x'
                      onBrushDomainChange={(domain: any, props: any) => this.handleBrushChange(domain)}
                      onBrushDomainChangeEnd={() => this.handleBrushChangeEnd()}
                      />
                    }>
        <VictoryAxis
          tickFormat={(t: number) => {return  t >= 1000 ? `${Math.round(t)/1000}k` : Math.round(t*100)/100}}
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
