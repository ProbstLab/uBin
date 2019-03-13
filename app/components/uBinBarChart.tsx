import * as React from "react"
import {ISample} from '../utils/interfaces'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryLabel} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'
import * as crossfilter from 'crossfilter2'
import {IScatterDomain} from "samples"

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
  domain?: IScatterDomain
}

export interface IBarCharState {
  cf: Crossfilter<ISample>
  groupDim?: Dimension<ISample, number>
  filterDim?: Dimension<ISample, number>
}

export class UBinBarChart extends React.Component<IProps> {

  public state: IBarCharState = {
    cf: crossfilter(this.props.data),
  }

  public componentWillUpdate(): void {
    if (this.props.domain) {
      console.log("will update")
      this.setState({
        filterDim: this.state.cf.dimension((d: ISample) => Math.round(d.gc)),
        groupDim: this.state.cf.dimension((d: ISample) => Math.round(d.gc)),
      })
    }
  }

  public getData(): any[] {
    return []
  }

  public render(): JSX.Element {
    return (
      <VictoryChart theme={VictoryTheme.material} domainPadding={20}
                    height={400}
                    padding={{ left: 40, top: 40, right: 10, bottom: 150 }}>
        <VictoryAxis
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