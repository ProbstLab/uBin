import * as React from 'react'
import {IBarData, IGenericAssociativeArray} from '../utils/interfaces'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryLabel, VictoryZoomContainer, VictoryBrushContainer} from 'victory'

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
  selectedDomain?: any
  zoomDomain?: any
}

export class UBinZoomBarChart extends React.Component<IProps> {
  public state: IBarCharState = {
  }

  public handleZoom(domain: any):void {
    this.setState({selectedDomain: domain})
  }

  public handleBrush(domain: any): void {
    this.setState({zoomDomain: domain})
  }

  public getData(): any[] {
    let dataDict: IGenericAssociativeArray = {}
    let sumDict: IGenericAssociativeArray = {}
    this.props.data.forEach((value: any) => {
      let key: number = Math.round(value[this.props.xName || 'x'])
      dataDict.hasOwnProperty(key) ? dataDict[key] += value[this.props.yName || 'y'] : dataDict[key] = value[this.props.yName || 'y']
      sumDict.hasOwnProperty(key) ? sumDict[key] += 1 : sumDict[key] = 1
    })
    return Object.keys(dataDict).map((value: any) => {
      return {[this.props.xName || 'x']: value, [this.props.yName || 'y']: dataDict[value]/sumDict[value]}
    })
  }

  public render(): JSX.Element {
    return (
      <div>
        <VictoryChart theme={VictoryTheme.material} domainPadding={20}
                      height={400}
                      width={400}
                      padding={{ left: 40, top: 40, right: 10, bottom: 60 }}
                      containerComponent={
                        <VictoryZoomContainer responsive={false}
                                              zoomDimension='x'
                                              zoomDomain={this.state.zoomDomain}
                                              onZoomDomainChange={this.handleZoom.bind(this)}/>}>
          <VictoryAxis
            tickLabelComponent={<VictoryLabel style={{textAnchor:'end', fontSize: '8px'}} angle={-75}/>}
          />
          <VictoryAxis
            dependentAxis={true}
            tickFormat={(t: number) => t >= 1000 ? `${Math.round(t)/1000}k` : t}
          />
          <VictoryBar
            data={this.getData()}
            x={this.props.xName || 'x'}
            y={this.props.yName || 'y'}
          />
        </VictoryChart>
        <VictoryChart
          padding={{top: 0, left: 50, right: 50, bottom: 30}}
          width={400} height={90} scale={{x: 'time'}}
          containerComponent={
            <VictoryBrushContainer responsive={false}
                                   brushDimension='x'
                                   brushDomain={this.state.selectedDomain}
                                   onBrushDomainChange={this.handleBrush.bind(this)}/>
          }>
          <VictoryAxis
            tickFormat={(t: number) => !(t%5) ? (t >= 1000 ? `${Math.round(t)/1000}k` : t) : ``}
            tickLabelComponent={<VictoryLabel style={{textAnchor:'end', fontSize: '10px'}} angle={-75}/>}
          />
          <VictoryBar
            data={this.getData()}
            x={this.props.xName || 'x'}
            y={this.props.yName || 'y'}
          />
        </VictoryChart>
      </div>
    )
  }
}
