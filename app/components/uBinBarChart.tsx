import * as React from "react"
import {ISample} from '../utils/interfaces'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryLabel} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'
import * as crossfilter from 'crossfilter2'
import {IScatterDomain} from "samples"
import {Enzyme} from '../db/entities/Enzyme'

// const getLabelData = (data: IVisData[]) => data.map((value: IVisData, index: number): any => {
//   return {x: value.x, y: value.y, label: value.x.toString()}
// })
//
// const getGeneCount = (data: IVisData[]) => data.map(value => value.y)

interface IProps {
  data: ISample[]
  title: string
  xName?: string
  yName?: string
  xLabels?: string[]
  filterBoolName: 'archaeal' | 'bacterial'
  domain?: IScatterDomain
}

export interface IBarCharState {
  cf: Crossfilter<ISample>
  gcDim?: Dimension<ISample, number>
  coverageDim?: Dimension<ISample, number>
  groupDim?: Dimension<ISample, number>
}

export class UBinBarChart extends React.Component<IProps> {

  public state: IBarCharState = {
    cf: crossfilter(this.props.data),
  }

  public componentWillMount(): void {
    this.setState({
      gcDim: this.state.cf.dimension((d: ISample) => Math.round(d.gc)),
      coverageDim: this.state.cf.dimension((d: ISample) => Math.round(d.coverage)),
      groupDim: this.state.cf.dimension((d: ISample) => d.id || 0),
    })
  }

  public reduceInitial(): any {
    return {count: 0, enzymes: {}}
  }

  public reduceAdd(p: any, v: ISample): any {
    p.count += 1
    if (v.enzymes && v.enzymes.length >= 0) {
      p.enzymes[v.id || 0] = v.enzymes
    } else {
      p.enzymes = undefined
    }
    return p
  }

  public reduceRemove(p: any, v: ISample): any {
    p.count -= 1
    if (v.enzymes && v.enzymes.length) {
      delete p.count[v.id || 0]
    }
    return p
  }

  public getData(): any[] {
    let {gcDim, coverageDim, groupDim} = this.state
    if (gcDim && coverageDim && groupDim) {
      let {domain, xName, yName, xLabels, filterBoolName} = this.props
      if (domain) {
        if (domain.x) {
          gcDim.filterRange(domain.x)
        }
        if (domain.y) {
          coverageDim.filterRange(domain.y)
        }
      }
      let xKey: string = xName || 'x'
      let yKey: string = yName || 'y'
      if (xLabels) {
        let returnVals: any[] = new Array(xLabels.length).fill(0)
        returnVals.forEach((val: any, index: number) => {
          returnVals[index] = {[xKey]: index, [yKey]: 0}
        })
        groupDim.group().reduce(this.reduceAdd, this.reduceRemove, this.reduceInitial).all()
          .filter((val: any) => val.value.enzymes).filter((val: any) => val.value.count).map((val: any) => {
          Object.keys(val.value.enzymes).map((key: string) => {
            let enzymes: Enzyme[] = val.value.enzymes[key]
            enzymes.filter((value: Enzyme) => value[filterBoolName]).map((value: Enzyme) => {
              let arrKey: number = xLabels ? xLabels.indexOf(value.name) : -1
              if (arrKey >= 0) {
                if (returnVals.hasOwnProperty(arrKey)) {
                  returnVals[arrKey][yKey] += 1
                } else {
                  returnVals[arrKey][yKey] = 1
                }
              }
            })
          })
        })
        return returnVals
      }
    }
    return []
  }

  public render(): JSX.Element {
    return (
      <VictoryChart theme={VictoryTheme.material} domainPadding={20}
                    height={400}
                    padding={{ left: 40, top: 40, right: 10, bottom: 204 }}>
        <VictoryAxis
          tickValues={this.props.xLabels}
          tickLabelComponent={<VictoryLabel style={{textAnchor:'end', fontSize: '8px'}} angle={-75}/>}
        />
        <VictoryAxis
          dependentAxis={true}
          tickFormat={(t: number) => {return  t >= 1000 ? `${Math.round(t)/1000}k` : t}}
        />
        <VictoryBar
          data={this.getData()}
          x={this.props.xName || 'x'}
          y={this.props.yName || 'y'}
        />
      </VictoryChart>
    )
  }
}