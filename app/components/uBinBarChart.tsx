import * as React from "react"
import { IBarData } from '../utils/interfaces'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryLabel} from 'victory'

// const getLabelData = (data: IVisData[]) => data.map((value: IVisData, index: number): any => {
//   return {x: value.x, y: value.y, label: value.x.toString()}
// })
//
// const getGeneCount = (data: IVisData[]) => data.map(value => value.y)

interface IProps {
  data: IBarData[]
  title: string
  xName?: string
  yName?: string
}

export interface IBarCharState {
  // labelData: any[]
  // geneCount: number
}

export class UBinBarChart extends React.Component<IProps> {

  public state: IBarCharState = {}

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
          data={this.props.data}
          x={this.props.xName || 'x'}
          y={this.props.yName || 'y'}
        />
      </VictoryChart>
    )
  }
}