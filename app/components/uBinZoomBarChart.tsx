import * as React from 'react'
import {ISample} from '../utils/interfaces'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryLabel, VictoryZoomContainer, VictoryBrushContainer} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'
import * as crossfilter from 'crossfilter2'


interface IProps {
  data: ISample[]
  title: string
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
}

export interface IBarCharState {
  selectedDomain?: any
  zoomDomain?: any
  cf: Crossfilter<ISample>
  xDim?: Dimension<ISample, number>
  originalXDomain?: [number, number]
}

export class UBinZoomBarChart extends React.Component<IProps> {

  currentDomain?: any
  zoom?: number

  public state: IBarCharState = {
    cf: crossfilter(this.props.data),
  }

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      if (this.props.xName === 'coverage') {
        this.setState({
          xDim: this.state.cf.dimension((d: ISample) => Math.round(d.coverage)),
        })
      }
    }
  }

  public componentDidMount(): void {
    let { xDim } = this.state
    if (xDim) {
      switch (this.props.xName) {
        case ('coverage'):
          this.setState({originalXDomain: [xDim.bottom(1)[0][this.props.xName], xDim.top(1)[0][this.props.xName]]})
      }
    }
  }

  public handleZoom(domain: any):void {
    this.setState({selectedDomain: domain})
    this.currentDomain = domain
  }

  public handleBrush(domain: any): void {
    this.setState({zoomDomain: domain})
    this.currentDomain = domain
  }

  public round(num: number, x: number, o: number): number {
    return Math.round((o + Math.ceil((num - o)/ x ) * x)*10)/10
  }

  public getData(): any[] {
    let { xDim, originalXDomain } = this.state
    if (xDim) {
      let { xName, yName } = this.props
      if (originalXDomain && this.currentDomain) {
        let originalDistance: number = Math.sqrt((originalXDomain[1] - originalXDomain[0])**2)
        let currentDistance: number = Math.sqrt((this.currentDomain.x[1] - this.currentDomain.x[0])**2)
        if (originalDistance > currentDistance) {
          let roundedStepSize: number = Math.round(currentDistance/originalDistance * 100)/100
          if (this.zoom !== roundedStepSize) {
            this.zoom = roundedStepSize
            this.setState({xDim: this.state.cf.dimension((d: ISample) => this.round(d.coverage, this.zoom || 0.1, 0))})
          }
        }
      }
      let arr: any[] = xDim.group().all().map((value: any) => {
        let obj: any = {}
        obj[xName || 'x'] = value.key
        obj[yName || 'x'] = value.value
        return obj
      })
      return arr
    }
    return []
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
          />
          <VictoryBar
            data={this.getData()}
            x={this.props.xName || 'x'}
            y={this.props.yName || 'y'}
          />
        </VictoryChart>
        <VictoryChart
          padding={{top: 0, left: 50, right: 50, bottom: 30}}
          width={400} height={90}
          containerComponent={
            <VictoryBrushContainer responsive={false}
                                   brushDimension='x'
                                   brushDomain={this.state.selectedDomain}
                                   onBrushDomainChange={this.handleBrush.bind(this)}/>
          }>
          <VictoryAxis
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
