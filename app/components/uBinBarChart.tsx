import * as React from "react"
import {HorizontalGridLines, VerticalBarSeriesCanvas, VerticalGridLines, XYPlot, XAxis, YAxis, LabelSeries} from "react-vis"
import {IVisData} from '../utils/interfaces'

const getLabelData = (data: IVisData[]) => data.map((value: IVisData, index: number): any => {
  return {x: value.x, y: value.y, label: value.x.toString()}
})

const getGeneCount = (data: IVisData[]) => data.map(value => value.y)

interface IProps {
  data: IVisData[]
  title: string
}

export interface IBarCharState {
  labelData: any[]
  geneCount: number
}

export class UBinBarChart extends React.Component<IProps> {

  public state: IBarCharState = {
    labelData: getLabelData(this.props.data),
    geneCount: getGeneCount(this.props.data).reduce((sum, val) => sum + val, 0)
  }

  render(): JSX.Element {
    const {labelData, geneCount} = this.state
    return (
      <div>
        <h5>{this.props.title} / {geneCount}</h5>
        {/*<XYPlot width={300} height={500}>*/}
        <XYPlot width={300} height={500} margin={{left: 40, right: 10, top: 10, bottom: 100}}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis tickLabelAngle={-80}/>
          <YAxis />
          <VerticalBarSeriesCanvas data={this.props.data} />
          <LabelSeries data={labelData}/>
        </XYPlot>
      </div>
    )
  }
}