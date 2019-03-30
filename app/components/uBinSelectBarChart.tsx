import * as React from 'react'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryBrushContainer} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'
import {IBin, IDomain} from 'samples'
import {Sample} from '../db/entities/Sample'

interface IProps {
  cf: Crossfilter<Sample>
  title: string
  worldDomain?: [number, number]
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
  bin?: IBin
  range?: [number, number]
  setWorldDomain(domain: [number, number]): void
  domainChangeHandler(domain: IDomain): void
}

export interface IBarCharState {
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<Sample, number>
  filterDim?: Dimension<Sample, number>
  binDim?: Dimension<Sample, number>
  originalXDomain?: [number, number]
}

export class UBinSelectBarChart extends React.Component<IProps> {

  yMax: number = 0
  currentDomain?: any

  public state: IBarCharState = {}

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      let {cf} = this.props
      this.setState({binDim: cf.dimension((d: Sample) => d.bin ? d.bin.id : 0)})
      if (this.props.xName === 'coverage') {
        this.setState({
          filterDim: cf.dimension((d: Sample) => Math.round(d.coverage)),
          groupDim: cf.dimension((d: Sample) => Math.round(d.coverage)),
        })
      }
      else if (this.props.xName === 'gc') {
        this.setState({
          filterDim: cf.dimension((d: Sample) => Math.round(d.gc)),
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
    this.props.setWorldDomain(this.currentDomain)
  }

  public getStepSize(distance: number): number {
    if (distance < 1) {
      return 0.1
    } else if (distance < 5) {
      return 0.5
    } else if (distance < 10) {
      return 1
    } else if (distance < 50) {
      return 5
    } else if (distance < 100) {
      return 10
    } else if (distance < 500) {
      return 50
    } else if (distance < 1000) {
      return 100
    } else {
      return 1000
    }
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
    let { groupDim, filterDim, binDim } = this.state
    if (groupDim && filterDim && binDim) {
      let {xName, yName, bin, range} = this.props
      let { worldDomain } = this.props

      if (range) {
        filterDim.filterRange(range)
      } else if (worldDomain) {
        filterDim.filterRange(worldDomain)
      } else {
        filterDim.filterAll()
      }
      if (bin) {
        binDim.filterExact(bin.id)
      } else {
        binDim.filterAll()
      }
      if (xName) {
        this.yMax = 0
        let grouped: any[] = []
        switch (xName) {
          case 'gc':
            grouped = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
            break
          case 'coverage':
            grouped = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
            break
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

  public getYRange(): [number, number] {
    if (this.yMax) {
      return [0, Math.round(this.yMax*1.1)]
    }
    return [0, 10]
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
