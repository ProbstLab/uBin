
import * as React from 'react'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryLabel} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'
import {IBin, IDomain} from 'samples'
import {Enzyme} from '../db/entities/Enzyme'
import {Sample} from '../db/entities/Sample'

// const getLabelData = (data: IVisData[]) => data.map((value: IVisData, index: number): any => {
//   return {x: value.x, y: value.y, label: value.x.toString()}
// })
//
// const getGeneCount = (data: IVisData[]) => data.map(value => value.y)

interface IProps {
  title: string
  xName?: string
  yName?: string
  xLabels?: string[]
  cf: Crossfilter<Sample>
  filterBoolName: 'archaeal' | 'bacterial'
  domain?: IDomain
  bin?: IBin
  binView: boolean
  maxCount?: number
  chartHeight?: number
  bottomHeight?: number
}

export interface IBarCharState {
  groupDim?: Dimension<Sample, number>
}

export class UBinBarChart extends React.Component<IProps> {
  maxVal?: number = undefined
  completeness?: number = 0
  contamination?: number = 0

  public state: IBarCharState = {}

  public componentWillMount(): void {
    let {cf} = this.props
    this.setState({
      groupDim: cf.dimension((d: Sample) => d.id || 0),
    })
  }

  public reduceInitial(): any {
    return {count: 0, enzymes: {}}
  }

  public reduceAdd(p: any, v: Sample): any {
    p.count += 1
    if (v.enzymes && v.enzymes.length >= 0) {
      p.enzymes[v.id || 0] = v.enzymes
    } else {
      p.enzymes = undefined
    }
    return p
  }

  public reduceRemove(p: any, v: Sample): any {
    p.count -= 1
    if (v.enzymes && v.enzymes.length) {
      delete p.count[v.id || 0]
    }
    return p
  }

  public getData(): any[] {
    let {groupDim} = this.state
    if (groupDim) {
      let {xName, yName, xLabels, filterBoolName} = this.props
      let xKey: string = xName || 'x'
      let yKey: string = yName || 'y'
      if (xLabels) {
        let returnVals: any[] = new Array(xLabels.length).fill(0)
        returnVals.forEach((val: any, index: number) => {
          if (xLabels) {
          returnVals[index] = {[xKey]: xLabels[index], [yKey]: 0}
          }
        })
        let count: number = 0
        let contamination: number = 0
        groupDim.group().reduce(this.reduceAdd, this.reduceRemove, this.reduceInitial).all()
          .filter((val: any) => val.value.enzymes).filter((val: any) => val.value.count).map((val: any) => {
          Object.keys(val.value.enzymes).map((key: string) => {
            let enzymes: Enzyme[] = val.value.enzymes[key]
            enzymes.filter((value: Enzyme) => value[filterBoolName]).map((value: Enzyme) => {
              let arrKey: number = xLabels ? xLabels.indexOf(value.name) : -1
              if (arrKey >= 0) {
                if (returnVals.hasOwnProperty(arrKey)) {
                  returnVals[arrKey][yKey] += 1
                  if (returnVals[arrKey][yKey] === 1) { count++ }
                  else if (returnVals[arrKey][yKey] > 1) { contamination++ }
                } else {
                  returnVals[arrKey][yKey] = 1
                }
                if (!this.maxVal || returnVals[arrKey][yKey] > this.maxVal) {
                  this.maxVal = returnVals[arrKey][yKey]
                }
              }
            })
          })
        })
        if (this.props.maxCount) {
          this.completeness = Math.round((count/this.props.maxCount)*1000)/10
          this.contamination = Math.round((contamination/this.props.maxCount)*1000)/10
        }
        return returnVals
      }
    }
    return []
  }

  public getTickValues(): number[]|undefined {
    if (this.maxVal && this.maxVal < 10) {
      let tickVals: number[] = []
      for (let i: number = 0; i < this.maxVal+1; i++) {
        tickVals.push(i)
      }
      return tickVals
    }
    return undefined
  }

  public render(): JSX.Element {
    let data: any = this.getData()
    return (
      <VictoryChart theme={VictoryTheme.material} domainPadding={40}
                    height={this.props.chartHeight ? this.props.chartHeight : 420}
                    width={500}
                    padding={{ left: 40, top: 60, right: 10, bottom: this.props.bottomHeight ? this.props.bottomHeight : 245 }}>
        <VictoryLabel text={this.props.title} x={300} y={30} style={{fontSize: '16px'}} textAnchor='middle'/>
        <VictoryLabel text={'Completeness: '+this.completeness+'% | Contamination: '+this.contamination+'%'} x={300} y={50} style={{fontSize: '16px'}} textAnchor='middle'/>
        <VictoryAxis
          tickValues={this.props.xLabels}
          tickLabelComponent={<VictoryLabel style={{textAnchor:'end', fontSize: '12px'}} angle={-75}/>}
        />
        <VictoryAxis
          axisLabelComponent={<VictoryLabel x={-4} style={{fontSize: '16px'}} />}
          label={'occurrences'}
          dependentAxis={true}
          tickFormat={t => Math.round(t) !== t ? undefined : t}
          tickLabelComponent={<VictoryLabel style={{fontSize: '16px'}}/>}
        />
        <VictoryBar
          data={data}
          x={this.props.xName || 'x'}
          y={this.props.yName || 'y'}
        />
      </VictoryChart>
    )
  }
}
