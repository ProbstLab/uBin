import * as React from "react"
import {VictoryAxis, VictoryScatter, VictoryChart, VictoryTheme, VictoryLabel, VictoryBrushContainer} from 'victory'
import {ISample} from '../utils/interfaces'
import {IScatterDomain} from 'samples'
import * as crossfilter from 'crossfilter2'
import {Crossfilter} from 'crossfilter2'
import {Dimension} from 'crossfilter2'


interface IProps {
  data: ISample[]
  title?: string
  domainChangeHandler(scatterDomain: IScatterDomain): void
  domain?: IScatterDomain
}

interface IScatterDetails {
  xSum: number
  ySum: number
  count: number
}

export interface IUBinScatterState {
  cf: Crossfilter<ISample>
  combDim?: Dimension<ISample, string>
  covDim?: Dimension<ISample, number>
  gcDim?: Dimension<ISample, number>
  originalDomain?: IScatterDomain
}

export class UBinScatter extends React.PureComponent<IProps> {

  xAxis?: [number, number]
  yAxis?: [number, number]
  zoom?: number

  public state: IUBinScatterState = {
    cf: crossfilter(this.props.data),
  }

  public componentWillMount(): void {
    this.setState({
      combDim: this.state.cf.dimension((d: ISample) => d.gc+":"+Math.round(d.coverage)),
      covDim: this.state.cf.dimension((d: ISample) => d.coverage),
      gcDim: this.state.cf.dimension((d: ISample) => d.gc),
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

  public reduceAdd(p: any, v: ISample): any {
    p.xSum += v.gc
    p.ySum += v.coverage
    p.count += 1
    return p
  }

  public reduceRemove(p: any, v: ISample): any {
    p.xSum -= v.gc
    p.ySum -= v.coverage
    p.count -= 1
    return p
  }

  public round(num: number, x: number, o: number): number {
    return Math.round((o + Math.ceil((num - o)/ x ) * x)*10)/10
  }

  public getData(): any {
    let { covDim, gcDim, combDim, originalDomain } = this.state
    let { domain } = this.props

    if (domain && domain.x && domain.y && originalDomain && originalDomain.x && originalDomain.y) {
      let origSize: number = Math.sqrt((originalDomain.x[1] - originalDomain.x[0])**2) * Math.sqrt((originalDomain.y[1] - originalDomain.y[0])**2)
      let currentSize: number = Math.sqrt((domain.x[1] - domain.x[0])**2) * Math.sqrt((domain.y[1] - domain.y[0])**2)
      if (origSize && currentSize) {
        let roundedStepSize: number = Math.round(currentSize/origSize * 100)/100
        if (this.zoom !== roundedStepSize) {
          this.zoom = roundedStepSize
          this.setState({combDim: this.state.cf.dimension((d: ISample) => d.gc + ":" + this.round(d.coverage, this.zoom || 0.1, 0).toString())})
        }
      }
    }

    if (gcDim && covDim && combDim) {
      if (domain) {
        if (domain.x && domain.y) {
          gcDim.filterRange(domain.x)
          covDim.filterRange(domain.y)
        }
      }
      let logFactor: number = 10/Math.log(100)
      let basePointSize: number = 10-Math.log((this.zoom !== undefined ? this.zoom || 0.01 : 1)*100)*logFactor
      let returnVals: any = combDim.group().reduce(this.reduceAdd, this.reduceRemove, this.reduceInitial).all().
                              filter((value: any) => value.value.count).map((value: any) => {
        let valObj: IScatterDetails = value.value
        console.log("basepointsize", basePointSize)
        return {gc: valObj.xSum/valObj.count, coverage: valObj.ySum/valObj.count, size: Math.log(valObj.count/2)+basePointSize}
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

  public handleDomainChange(domain: IScatterDomain): void {
    this.xAxis = domain.x
    this.yAxis = domain.y
  }

  public render(): JSX.Element {
    return (
      <VictoryChart containerComponent={<VictoryBrushContainer
                                        defaultBrushArea="disable"
                                        onBrushDomainChange={(domain: any, props: any) => this.handleDomainChange(domain)}
                                        onBrushDomainChangeEnd={() => this.handleDomainChangeEnd()}/>}
                    theme={VictoryTheme.material} domainPadding={20}
                    height={600}
                    width={400}
                    padding={{ left: 40, top: 40, right: 10, bottom: 150 }}>
        <VictoryAxis
          tickLabelComponent={<VictoryLabel style={{textAnchor:'end', fontSize: '10px'}} angle={-75}/>}
        />
        <VictoryAxis
          dependentAxis={true}
          tickFormat={(t: number) => {return  t >= 1000 ? `${Math.round(t)/1000}k` : t}}
        />
        <VictoryScatter
          bubbleProperty="size"
          maxBubbleSize={20}
          data={this.getData()}
          x={'gc'}
          y={'coverage'}
        />
      </VictoryChart>
    )
  }
}