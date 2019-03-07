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
  // labelData: any[]
  // geneCount: number
  data: ISample[]
  cf: Crossfilter<ISample>
  combDim: Dimension<ISample, string> | undefined
  covDim: Dimension<ISample, number> | undefined
  gcDim: Dimension<ISample, number> | undefined
  xAxis: {min: number, max: number} | undefined
  yAxis: {min: number, max: number} | undefined
}

export class UBinScatter extends React.Component<IProps> {

  public state: IUBinScatterState = {
    data: this.props.data,
    cf: crossfilter(this.props.data),
    combDim: undefined,
    covDim: undefined,
    gcDim: undefined,
    xAxis: undefined,
    yAxis: undefined,
  }

  public componentDidMount(): void {
    console.log("Scatter Plot mounted!")
    this.setState({
      combDim: this.state.cf.dimension((d: ISample) => d.gc+":"+Math.round(d.coverage)),
      covDim: this.state.cf.dimension((d: ISample) => d.coverage),
      gcDim: this.state.cf.dimension((d: ISample) => d.gc),
    })
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

  public getData(): any {
    let { covDim, gcDim, combDim, xAxis, yAxis } = this.state
    let { domain } = this.props
    // console.log("domain", this.props.domain)
    if (gcDim && covDim && combDim) {
      if (xAxis) {
        gcDim.filter([xAxis.min, xAxis.max])
      }
      if (yAxis) {
        covDim.filter([yAxis.min, yAxis.max])
      }
      if (domain) {
        console.log("filter by", domain)
        if (domain.x && domain.y) {
          gcDim.filterRange(domain.x)
          covDim.filterRange(domain.y)
        }
        console.log(gcDim)
      }
      // combDim.group().all().filter(value => value.value).map(value => value.key.toString().split(':'))
      // console.log(combDim.group().reduce(this.reduceAdd, this.reduceRemove, this.reduceInitial).all())
      let returnVals: any = combDim.group().reduce(this.reduceAdd, this.reduceRemove, this.reduceInitial).all().
                              filter((value: any) => value.value.count).map((value: any) => {
        let valObj: IScatterDetails = value.value
        return {gc: valObj.xSum/valObj.count, coverage: valObj.ySum/valObj.count, size: Math.log(valObj.count)+1}
      })
      console.log("return vals", returnVals)
      return returnVals
    }
    return []
}

  public handleDomainChange(domain: IScatterDomain): void {
    if (this.props.domainChangeHandler) {
      this.props.domainChangeHandler(domain)
    }
  }

  public render(): JSX.Element {
    return (
      <VictoryChart containerComponent={<VictoryBrushContainer
                                        defaultBrushArea="disable"
                                        onBrushDomainChangeEnd={(domain: any, props: any) => this.handleDomainChange(domain)}/>}
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