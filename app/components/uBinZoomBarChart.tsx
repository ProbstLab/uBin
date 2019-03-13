import * as React from 'react'
import {ISample} from '../utils/interfaces'
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryLabel, VictoryZoomContainer} from 'victory'
import {Crossfilter, Dimension} from 'crossfilter2'

interface IProps {
  cf: Crossfilter<ISample>
  title: string
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
}

export interface IBarCharState {
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<ISample, number>
  filterDim?: Dimension<ISample, number>
  originalXDomain?: [number, number]
}

export class UBinZoomBarChart extends React.Component<IProps> {

  currentDomain?: any
  currentFilter?: [number, number]
  currentOffset?: number
  yMax: number = 0
  zoom?: number

  public state: IBarCharState = {}

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      let {cf} = this.props
      if (this.props.xName === 'coverage') {
        this.setState({
          filterDim: cf.dimension((d: ISample) => Math.round(d.coverage)),
          groupDim: cf.dimension((d: ISample) => Math.round(d.coverage)),
        })
      }
      else if (this.props.xName === 'gc') {
        this.setState({
          filterDim: cf.dimension((d: ISample) => Math.round(d.gc)),
          groupDim: cf.dimension((d: ISample) => Math.round(d.gc)),
        })
      }
    }
  }

  public componentDidMount(): void {
    let { groupDim } = this.state
    if (groupDim) {
      switch (this.props.xName) {
        case ('coverage'):
          this.setState({originalXDomain: [groupDim.bottom(1)[0][this.props.xName], groupDim.top(1)[0][this.props.xName]]})
          break
        case ('gc'):
          this.setState({originalXDomain: [groupDim.bottom(1)[0][this.props.xName], groupDim.top(1)[0][this.props.xName]]})
          break
      }
    }
  }

  public handleZoom(domain: any):void {
    this.setState({selectedDomain: domain})
    this.currentDomain = domain
    this.currentDomain.y = this.getYRange()
  }

  public handleBrush(domain: any): void {
    this.setState({zoomDomain: domain})
    this.currentDomain = domain
    this.currentDomain.y = this.getYRange()
  }
  
  public getStepSize(distance: number): number {
    if (distance < 1) {
      return 0.1
    } else if (distance < 5) {
      return 0.5
    } else if (distance < 10) {
      return 1
    } else if (distance < 50) {
      return 5
    } else if (distance < 100) {
      return 10
    } else if (distance < 500) {
      return 50
    } else if (distance < 1000) {
      return 100
    } else {
      return 1000
    }
  }

  public getXLabels(adjustScale?: boolean): number[] {
    let { originalXDomain } = this.state
    let stepsArray: number[] = []
    if (originalXDomain) {
      let xDistance: number = Math.sqrt((originalXDomain[1] - originalXDomain[0]) ** 2)
      let stepSize: number = this.getStepSize(xDistance)
      console.log("xdistance", xDistance, "stepsize", stepSize)
      for (let i: number = 0; i < this.roundLarge(xDistance, stepSize, 0);
           i += !adjustScale || !this.currentDomain ? stepSize : this.getStepSize(Math.sqrt((this.currentDomain.x[1] - this.currentDomain.x[0])**2))) {
        stepsArray.push(i)
      }
    }
    return stepsArray
  }

  public getYLabels(): number[] {
    let stepsArray: number[] = []
    let { groupDim } = this.state
    let { yName } = this.props
    if ( groupDim && yName ) {
      let yDistance: number = Math.sqrt((groupDim.top(1)[0][yName] - groupDim.bottom(1)[0][yName])**2)
      let stepSize: number = this.getStepSize(yDistance)
      for (let i: number = 0; i < this.roundLarge(yDistance, stepSize, 0); i += stepSize) {
        stepsArray.push(i)
      }
    } else {
      stepsArray = [0, 25, 50, 75, 100]
    }
    return stepsArray
  }

  public reduceInitial(): any {
    return {xSum: 0, count: 0}
  }

  public reduceAddLength(p: any, v: ISample): any {
    p.xSum += v.length
    p.count += 1
    return p
  }

  public reduceRemoveLength(p: any, v: ISample): any {
    p.xSum -= v.length
    p.count -= 1
    return p
  }

  public roundLarge(num: number, i: number, o: number): number {
    return Math.ceil((num - o) / i ) * i + o;
  }

  public roundSmall(num: number, x: number, o: number): number {
    return Math.round((o + Math.ceil((num - o)/ x ) * x)*10)/10
  }

  public calcOffset(domain: any, offset: number): [number, number] {
    return [Math.round((domain.x[0] - offset)*10)/10, Math.round((domain.x[1] + offset)*10)/10]
  }

  public getData(): any[] {
    let { groupDim, filterDim, originalXDomain } = this.state
    if (groupDim && filterDim) {
      let {xName, yName} = this.props
      if (originalXDomain && this.currentDomain) {
        let originalDistance: number = Math.sqrt((originalXDomain[1] - originalXDomain[0]) ** 2)
        let currentDistance: number = Math.sqrt((this.currentDomain.x[1] - this.currentDomain.x[0]) ** 2)
        this.currentOffset = currentDistance / (originalDistance * 10)
        if (originalDistance > currentDistance) {
          let roundedStepSize: number = Math.round(currentDistance / 100)
          if (this.zoom !== roundedStepSize) {
            this.zoom = roundedStepSize
            let {cf} = this.props
            switch (this.props.xName) {
              case ('coverage'):
                this.setState({groupDim: cf.dimension((d: ISample) => this.roundLarge(d.coverage, this.zoom || 0.1, 0))})
                break
              case ('gc'):
                this.setState({groupDim: cf.dimension((d: ISample) => this.roundSmall(d.gc, this.zoom || 0.1, 0))})
                break
            }
          }
        }
      }
      if (this.currentDomain && this.currentDomain.x && this.currentOffset) {
        if (!this.currentFilter) {
          this.currentFilter = this.calcOffset(this.currentDomain, this.currentOffset)
          filterDim.filterRange(this.currentFilter)
        } else {
          if (this.currentFilter[0] > this.currentDomain.x[0] || this.currentFilter[0] + this.currentOffset * 0.8 < this.currentDomain.x[0] ||
            this.currentFilter[1] > this.currentDomain.x[1] || this.currentFilter[1] + this.currentOffset * 0.8 < this.currentDomain.x[1]) {
            this.currentFilter = this.calcOffset(this.currentDomain, this.currentOffset)
            filterDim.filterRange(this.currentFilter)
          }
        }
      }
      if (xName) {
        this.yMax = 0
        let grouped: any[] = []
        switch (xName) {
          case 'gc':
            grouped = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
            break
          case 'coverage':
            grouped = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
            break
        }
        if (grouped) {
          let arr: any[] = grouped.filter((value: any) => value.value.count).map((value: any) => {
              let obj: any = {}
              obj[xName || 'x'] = value.key
              obj[yName || 'x'] = value.value.xSum
              if (value.value.xSum > this.yMax) {
                this.yMax = value.value.xSum
              }
              return obj
            })
          return arr
        }
      }
    }
    return []
  }

  public getAllData(): any[] {
    let { groupDim, filterDim } = this.state
    if (groupDim && filterDim) {
      let { xName, yName } = this.props
      filterDim.filterAll()
      let arr: any[] = groupDim.group().all().map((value: any) => {
        let obj: any = {}
        obj[xName || 'x'] = value.key
        obj[yName || 'x'] = value.value
        return obj
      })
      return arr
    }
    return []
  }

  public getYRange(): [number, number] {
    if (this.yMax) {
      return [0, Math.round(this.yMax*1.1)]
    }
    return [0, 10]
  }


  public render(): JSX.Element {
    return (
      <div>
        <VictoryChart theme={VictoryTheme.material} domainPadding={20}
                      height={400}
                      width={400}
                      // domain={this.currentDomain || {x: [0, 100], y: [0, 10]}}
                      padding={{ left: 40, top: 40, right: 10, bottom: 60 }}
                      containerComponent={
                        <VictoryZoomContainer responsive={false}
                                              zoomDimension='x'
                                              zoomDomain={this.state.zoomDomain}
                                              onZoomDomainChange={this.handleZoom.bind(this)}/>}>
          <VictoryAxis
            tickValues={this.getXLabels(true)}
            tickFormat={(t: number) => {return  t >= 1000 ? `${Math.round(t)/1000}k` : Math.round(t*100)/100}}
            tickLabelComponent={<VictoryLabel style={{textAnchor:'end', fontSize: '8px'}} angle={-75}/>}
          />
          <VictoryAxis
            // tickValues={this.getYLabels()}
            tickFormat={(t: number) => {return  t >= 1000000 ? `${Math.round(t)/1000000}M` : t >= 1000 ? `${Math.round(t)/1000}K` : t}}
            dependentAxis={true}
          />
          <VictoryBar
            data={this.getData()}
            x={this.props.xName || 'x'}
            y={this.props.yName || 'y'}
          />
        </VictoryChart>
        {/*<VictoryChart*/}
          {/*padding={{top: 0, left: 50, right: 50, bottom: 40}}*/}
          {/*width={400} height={90}*/}
          {/*containerComponent={*/}
            {/*<VictoryBrushContainer responsive={false}*/}
                                   {/*brushDimension='x'*/}
                                   {/*brushDomain={this.state.selectedDomain}*/}
                                   {/*onBrushDomainChange={this.handleBrush.bind(this)}/>*/}
          {/*}>*/}
          {/*<VictoryAxis*/}
            {/*tickValues={this.getXLabels()}*/}
            {/*tickLabelComponent={<VictoryLabel style={{textAnchor:'end', fontSize: '10px'}} angle={-75}/>}*/}
          {/*/>*/}
          {/*<VictoryBar*/}
            {/*data={this.getAllData()}*/}
            {/*x={this.props.xName || 'x'}*/}
            {/*y={this.props.yName || 'y'}*/}
          {/*/>*/}
        {/*</VictoryChart>*/}
      </div>
    )
  }
}
