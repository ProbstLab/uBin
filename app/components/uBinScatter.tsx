import * as React from "react"
import {VictoryAxis, VictoryScatter, VictoryChart, VictoryTheme, VictoryBrushContainer} from 'victory'
import {IBin, IDomain} from 'samples'
import * as crossfilter from 'crossfilter2'
import {Crossfilter} from 'crossfilter2'
import {Dimension} from 'crossfilter2'
import {Checkbox} from '@blueprintjs/core'
import {Sample} from '../db/entities/Sample'
import {numToColour} from '../utils/convert'


interface IProps {
  data: Sample[]
  title?: string
  domainChangeHandler(domain: IDomain): void
  domain?: IDomain
  bin?: IBin
}

interface IScatterDetails {
  xSum: number
  ySum: number
  count: number
  colour: string
}

export interface IUBinScatterState {
  cf: Crossfilter<Sample>
  combDim?: Dimension<Sample, string>
  binDim?: Dimension<Sample, number>
  covDim?: Dimension<Sample, number>
  gcDim?: Dimension<Sample, number>
  originalDomain?: IDomain
  logScale: boolean
}

export class UBinScatter extends React.PureComponent<IProps> {

  xAxis?: [number, number]
  yAxis?: [number, number]
  zoom?: number

  public state: IUBinScatterState = {
    cf: crossfilter(this.props.data),
    logScale: false,
  }

  public componentWillMount(): void {
    this.setState({
      combDim: this.state.cf.dimension((d: Sample) => d.gc+':'+Math.round(d.coverage)+':'+(d.bin ? d.bin.id : '')),
      binDim: this.state.cf.dimension((d: Sample) => d.bin ? d.bin.id : 0),
      covDim: this.state.cf.dimension((d: Sample) => d.coverage),
      gcDim: this.state.cf.dimension((d: Sample) => d.gc),
    })
  }

  public componentDidMount(): void {
    let { covDim, gcDim } = this.state
    if (covDim && gcDim) {
      this.setState({originalDomain: {x: [gcDim.bottom(1)[0].gc, gcDim.top(1)[0].gc],
                                            y: [covDim.bottom(1)[0].coverage, covDim.top(1)[0].coverage]}})
    }
  }

  public reduceInitial(): any {
    return {xSum: 0, ySum: 0, count: 0}
  }

  public reduceAdd(p: any, v: Sample): any {
    p.xSum += v.gc
    p.ySum += v.coverage
    p.count += 1
    if (!p.colour) {
      if (v.bin) {
        p.colour = numToColour(v.bin.id)
      } else {
        p.colour = '#455a64'
      }
    }
    return p
  }

  public reduceRemove(p: any, v: Sample): any {
    p.xSum -= v.gc
    p.ySum -= v.coverage
    p.count -= 1
    return p
  }

  public round(num: number, x: number, o: number): number {
    return Math.round((o + Math.ceil((num - o)/ x ) * x)*10)/10
  }

  public getData(): any {
    let { covDim, gcDim, combDim, binDim, originalDomain } = this.state
    let { domain, bin } = this.props

    if (domain && domain.x && domain.y && originalDomain && originalDomain.x && originalDomain.y) {
      let origSize: number = Math.sqrt((originalDomain.x[1] - originalDomain.x[0])**2) * Math.sqrt((originalDomain.y[1] - originalDomain.y[0])**2)
      let currentSize: number = Math.sqrt((domain.x[1] - domain.x[0])**2) * Math.sqrt((domain.y[1] - domain.y[0])**2)
      if (origSize && currentSize) {
        let roundedStepSize: number = Math.round(currentSize/origSize * 100)/100
        if (this.zoom !== roundedStepSize) {
          this.zoom = roundedStepSize
          this.setState({combDim: this.state.cf.dimension(
            (d: Sample) => d.gc+':'+this.round(d.coverage, this.zoom || 0.1, 0).toString()+':'+(d.bin ? d.bin.id : ''))},
            )
        }
      }
    }

    if (gcDim && covDim && combDim && binDim) {
      if (domain) {
        if (domain.x) {
          gcDim.filterRange(domain.x)
        }
        if (domain.y) {
          covDim.filterRange(domain.y)
        }
      } else {
        gcDim.filterAll()
        covDim.filterAll()
        this.zoom = undefined
      }
      if (bin) {
        binDim.filterExact(bin.id)
      } else {
        binDim.filterAll()
      }
      let logFactor: number = 10/Math.log(100)
      let basePointSize: number = 10-Math.log((this.zoom !== undefined ? this.zoom || 0.01 : 1)*200)*logFactor
      let returnVals: any = combDim.group().reduce(this.reduceAdd, this.reduceRemove, this.reduceInitial).all().
                              filter((value: any) => value.value.count).map((value: any) => {
        let valObj: IScatterDetails = value.value
        let size: number = Math.log(valObj.count/2)+basePointSize
        return {gc: valObj.xSum/valObj.count, coverage: valObj.ySum/valObj.count, size: size >= 1 ? size : 1, colour: valObj.colour}
      })
      return returnVals
    }
    return []
  }

  public handleDomainChangeEnd(): void {
    if (this.props.domainChangeHandler) {
      let { xAxis, yAxis } = this
      this.props.domainChangeHandler({x: xAxis, y: yAxis})
    }
  }

  public handleDomainChange(domain: IDomain): void {
    this.xAxis = domain.x
    this.yAxis = domain.y
  }

  private handleLogScaleChange(): void {
    this.setState({logScale: !this.state.logScale})
}
  public render(): JSX.Element {
    let {logScale} = this.state
    return (
      <div>
        <VictoryChart containerComponent={<VictoryBrushContainer
                                          defaultBrushArea="disable"
                                          onBrushDomainChange={(domain: any, props: any) => this.handleDomainChange(domain)}
                                          onBrushDomainChangeEnd={() => this.handleDomainChangeEnd()}/>}
                      theme={VictoryTheme.material}
                      height={500}
                      width={400}
                      padding={{ left: 50, top: 40, right: 10, bottom: 40 }}
                      domainPadding={{x: 10, y: [logScale ? 0.01 : 10, 100]}}
                      scale={{ x: 'linear', y: logScale ? 'log' : 'linear' }}>
          <VictoryAxis
            tickFormat={(t: number) => Math.round(t*10)/10}
          />
          <VictoryAxis
            dependentAxis={true}
            tickFormat={(t: number) => {return  logScale ? t : t >= 1000 ? `${Math.round(t)/1000}k` : t >= 100 ? Math.round(t) : Math.round(t*10)/10}}
          />
          <VictoryScatter
            style={{
              data: {
                fill: (d: any) => d.colour,
              },
            }}
            bubbleProperty="size"
            maxBubbleSize={20}
            data={this.getData()}
            x={'gc'}
            y={'coverage'}
          />
        </VictoryChart>
        <Checkbox checked={this.state.logScale} label={'Log Scaling'} onClick={() => this.handleLogScaleChange()}/>
      </div>
    )
  }
}