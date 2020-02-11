import * as React from 'react'
import {Crossfilter, Dimension, Grouping} from 'crossfilter2'
import {IBin, IDomain} from 'samples'
import {Sample} from '../db/entities/Sample'
import * as crossfilter from 'crossfilter2'
import {numToColour} from '../utils/convert'
import {Taxonomy} from '../db/entities/Taxonomy'
import {scaleLinear} from '@vx/scale'
import {Bounds} from '@vx/brush/lib/types'
import { Bar } from '@vx/shape';
import { Grid } from '@vx/grid';
import { Group } from '@vx/group';
import Brush from './FutureBrush'
import { AxisLeft, AxisBottom } from '@vx/axis';
import { filterBin, filterRange, filterTaxonomy } from '../utils/cfFilters'

interface IProps {
  data: any[]
  title: string
  xDomain?: [number, number]
  yDomain?: [number, number]
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
  bin?: IBin
  binView: boolean
  setWorldDomain(domain: [number, number]): void
  domainChangeHandler(domain: IDomain): void
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies?: Taxonomy[]
  width: number
  topChartHeight: number
  bottomChartHeight: number
}

export interface IBarCharState {
  cf: Crossfilter<Sample>
  overviewCf: Crossfilter<Sample>
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<Sample, number>
  coverageDim?: Dimension<Sample, number>
  gcDim?: Dimension<Sample, number>
  binDim?: Dimension<Sample, number>
  taxonomyDim?: Dimension<Sample, string>
  overviewDim?: Dimension<Sample, number>
  overviewBinDim?: Dimension<Sample, number>
  overviewTaxonomyDim?: Dimension<Sample, string>
  xMax: number
  yMaxTop: number
  yMaxBot: number
  coverageRange?: [number, number]
}

export class UBinCoverageBarChartVX extends React.Component<IProps> {

  currentDomain?: any
  activeBin?: number
  binRange?: [number, number]
  totalCount: 0
  margin = {
    top: 10,
    left: 60,
    bottom: 60,
    right: 0,
  }
  xScaleTop: any
  xScaleBot: any
  yScaleTop: any
  yScaleBot: any
  coverageRangeTmp: [number, number]
  changedBin = false
  hasChanged = false
  overviewRounding = 10

  public state: IBarCharState = {
    cf: crossfilter(this.props.data),
    overviewCf: crossfilter(this.props.data),  
    xMax: Math.max(this.props.width - this.margin.left - this.margin.right, 0),
    yMaxTop: Math.max(this.props.topChartHeight - this.margin.top - this.margin.bottom, 0),
    yMaxBot: Math.max(this.props.bottomChartHeight - this.margin.top - this.margin.bottom, 0)
  }

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      let {cf, overviewCf} = this.state
      this.setState({
        binDim: cf.dimension((d: Sample) => d.bin ? d.bin.id : 0),
        coverageDim: cf.dimension((d: Sample) => d.coverage),
        gcDim: cf.dimension((d: Sample) => d.gc),
        groupDim: cf.dimension((d: Sample) => Math.round(d.coverage)),
        taxonomyDim: cf.dimension((d: Sample) => d.taxonomiesRelationString),
        overviewDim: overviewCf.dimension((d: Sample) => Math.round(d[this.props.xName]/10)*10),
        overviewBinDim: overviewCf.dimension((d: Sample) => d.bin ? d.bin.id : 0),
        overviewTaxonomyDim: overviewCf.dimension((d: Sample) => d.taxonomiesRelationString)
      })
      this.xScaleTop = scaleLinear({ range: [0, this.state.xMax], nice: true })
      this.yScaleTop = scaleLinear({ range: [this.state.yMaxTop, 0] })
      this.xScaleBot = scaleLinear({ range: [0, this.state.xMax] })
      this.yScaleBot = scaleLinear({ range: [this.state.yMaxBot, 0] })
    }
  }

  public componentWillUpdate(nextProps: IProps): void {
    let { xDomain, bin } = nextProps
    if (this.currentDomain !== xDomain) {
      this.currentDomain = xDomain
    }
    if (bin !== this.props.bin) {
      this.changedBin = true
    }
  }

    public componentDidUpdate(): void {
    if (this.changedBin) {
      this.changedBin = false
      let {overviewCf} = this.state
      let tmpDimension = overviewCf.dimension((d: Sample) => d.coverage)
      let groupDimTop = tmpDimension.top(1)[0].coverage
      let groupDimBottom = tmpDimension.bottom(1)[0].coverage
      let covRange = Math.sqrt(groupDimTop**2 - groupDimBottom**2)
      if (covRange <= 50) {
        this.overviewRounding = 1
      } else if (covRange <= 100) {
        this.overviewRounding = 2
      } else if (covRange <= 250) {
        this.overviewRounding = 5
      } else {
        this.overviewRounding = 10
      }
      this.setState({overviewDim: overviewCf.dimension((d: Sample) => Math.round(d[this.props.xName]/this.overviewRounding)*this.overviewRounding)})
    }
  }

  public handleBrushChangeEnd(): void {
    if (this.currentDomain && this.hasChanged) {
      this.props.setWorldDomain(this.currentDomain)
      this.hasChanged = false
    }
  }

  public handleBrushChange(domain: Bounds): void {
    if (domain) {
      this.hasChanged = true
      this.currentDomain = [domain.x0, domain.x1]
    }
  }

  handleOverviewBrushChange(domain: Bounds): void {
    if (domain) {
      this.coverageRangeTmp = [domain.x0, domain.x1]
    }
  }

  handleOverviewBrushChangeEnd ():  void {
    if (this.coverageRangeTmp) {
      this.setState({ coverageRange: this.coverageRangeTmp })
    }
  }

  public reduceInitial(): any {
    return {xSum: 0, count: 0}
  }

  public reduceAddLength(p: any, v: Sample): any {
    p.xSum += v.length
    p.count += 1
    return p
  }

  public reduceRemoveLength(p: any, v: Sample): any {
    p.xSum -= v.length
    p.count -= 1
    return p
  }

  public getData(): any[] {
    let {groupDim, coverageDim, binDim, taxonomyDim, gcDim, coverageRange} = this.state
    let {xDomain} = this.props
    if (groupDim && coverageDim && binDim && taxonomyDim) {
      let binChanged: boolean = false
      let {xName, yName, bin, binView, selectedTaxonomy, excludedTaxonomies} = this.props

      if (bin && this.activeBin !== bin.id) {
        this.activeBin = bin.id
        this.binRange = undefined
        binChanged = true
      }

      filterBin(binDim, bin, binView)
      filterRange(coverageDim, coverageRange)
      filterRange(gcDim, xDomain)
      filterTaxonomy(taxonomyDim, selectedTaxonomy, excludedTaxonomies)

      if (xName) {
        let bottom: Sample =  groupDim.bottom(1)[0]
        let top: Sample =  groupDim.top(1)[0]
        let grouped: readonly Grouping<any, any>[] = groupDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()
        if (bottom && top && binChanged) {
          this.binRange = [groupDim.bottom(1)[0][xName], groupDim.top(1)[0][xName]]
        }
        if (grouped) {
          let arr: any[] = grouped.filter((value: any) => value.value.count).map((value: any) => {
              let obj: any = {}
              obj[xName || 'x'] = value.key
              obj[yName || 'x'] = value.value.xSum
              return obj
            })
          return arr
        }
      }
    }
    return []
  }
  
  getOverviewData (): any[] {
    let { overviewDim, overviewBinDim, overviewTaxonomyDim } = this.state
    let { bin, binView, xName, yName, selectedTaxonomy, excludedTaxonomies } = this.props

    if (overviewDim && overviewBinDim && overviewTaxonomyDim) {
      filterBin(overviewBinDim, bin, binView)
      filterTaxonomy(overviewTaxonomyDim, selectedTaxonomy, excludedTaxonomies)

      let grouped = overviewDim.group().reduce(this.reduceAddLength, this.reduceRemoveLength, this.reduceInitial).all()

      return grouped.filter((value: any) => value.value.count).map((value: any) => {
        let obj: any = {}
        obj[xName || 'x'] = value.key
        obj[yName || 'x'] = value.value.xSum
        this.totalCount += value.value.xSum
        return obj
      })
    }
    return []
  }

  getTopXRange (): [number, number] {
    if (this.state.coverageRange) {
      return this.state.coverageRange
    }
    let bot = this.state.coverageDim.bottom(1)
    let top = this.state.coverageDim.top(1)
    return [bot && bot[0] ? Math.max(bot[0].coverage - 5, 0): 0,
            top && top[0] ? top[0].coverage + 5 : 100]
  }

  getBotXRange (): [number, number] {
    let tmpDim = this.state.overviewCf.dimension((d: Sample) => d.coverage)
    let bot = tmpDim.bottom(1)
    let top = tmpDim.top(1)
    return [bot && bot[0] ? Math.max(bot[0].coverage - 5, 0): 0,
            top && top[0] ? top[0].coverage + 5 : 100]
  }

  getActiveArea (): {x: number, width: number} | undefined {
    let {yDomain} = this.props
    if (!yDomain)  return undefined
    let {xScaleTop} = this
    let xVal = xScaleTop(this.props.yDomain[0])
    let x = Math.max(xVal, 0)
    let width = Math.sqrt((xScaleTop(yDomain[1]) - xScaleTop(yDomain[0]))**2) - ( xVal < 0 ? Math.sqrt(xVal**2) : 0)
    if (width < 0) return undefined
    return {x, width}
  }

  public render(): JSX.Element {
    let {xName, yName, bin} = this.props
    let {binRange} = this
    let binRangeRounded = binRange ? [Math.floor(binRange[0]), Math.ceil(binRange[1])] : undefined
    let binColour: string
    if (bin && xName) {
      binColour = numToColour(bin.id)
    }
    let data: any = this.getData()
    let overviewData: any = this.getOverviewData()
    let {xScaleBot, xScaleTop, yScaleTop, yScaleBot, margin} = this
    let {yMaxBot, yMaxTop, xMax} = this.state
    let {width, topChartHeight, bottomChartHeight} = this.props
    const xKey = xName || 'x'
    const yKey = yName || 'y'
    let topXRange = this.getTopXRange()
    let botXRange = this.getBotXRange()
    let topXDistance = Math.sqrt((topXRange[1] - topXRange[0]) ** 2 )
    let botXDistance = Math.sqrt((botXRange[1] - botXRange[0]) ** 2 )
    const topBarWidth = Math.min(Math.max(Math.floor(xMax / topXDistance) - 1, 1), 30)
    const botBarWidth = Math.min(Math.max(Math.floor(xMax / (botXDistance / this.overviewRounding)) - 1, 1), 30)
    xScaleTop.domain(topXRange)
    yScaleTop.domain([0, Math.max(...data.map(y => y[yKey])) || 100])
    xScaleBot.domain(botXRange)
    yScaleBot.domain([0, Math.max(...overviewData.map(y => y[yKey])) || 100])
    const activeArea = this.getActiveArea()
    return (
      <div>
        <svg width={width} height={topChartHeight + bottomChartHeight}>
          <rect width={width} height={topChartHeight + bottomChartHeight} rx={14} fill="transparent" />
          <Group left={margin.left} top={margin.top}>
            <Grid<number, number> xScale={xScaleTop} yScale={yScaleTop} width={xMax} height={yMaxTop} stroke="rgba(10, 10, 10, 0.1)"/>
            {activeArea &&
              <rect height={yMaxTop} width={activeArea.width} x={activeArea.x} fill={'rgba(48, 156, 34, 0.1)'} />
            }
            {data.map((val, i) => {
              const barHeight = yMaxTop - yScaleTop(val[yKey]);
              const barX = xScaleTop(val[xKey]);
              const barY = yMaxTop - barHeight;
              return (
                <Bar
                  key={`bar-${i}`}
                  x={barX - Math.max(topBarWidth/2, 0)}
                  y={barY}
                  width={topBarWidth}
                  height={barHeight}
                  fill={binRangeRounded && binRangeRounded[0] <= val[xName || 'x'] && binRangeRounded[1] >= val[xName || 'x']
                        ? '#'+binColour
                        : "#455a64"}
                />
              );
            })}
            <AxisLeft<number>
              top={0}
              left={0}
              scale={yScaleTop}
              numTicks={10}
              tickFormat={(t: number) => {return  t >= 1000000 ? `${Math.round(t)/1000000}M` : t >= 1000 ? `${Math.round(t)/1000}K` : t}}
              label={yKey}
            />
            <AxisBottom<any>
              top={yMaxTop}
              left={0}
              scale={xScaleTop}
              numTicks={10}
              tickFormat={(t: number) => {return t >= 1000 ? `${Math.round(t)/1000}K` : t}}
            />
            
            <Brush
              xScale={xScaleTop}
              yScale={yScaleTop}
              width={xMax}
              height={yMaxTop}
              margin={margin}
              handleSize={8}
              resizeTriggerAreas={['left', 'right', 'bottomRight']}
              brushDirection="horizontal"
              onChange={(domain) => this.handleBrushChange(domain)}
              onBrushEnd={() => this.handleBrushChangeEnd()}
              resetOnEnd={true}
              selectedBoxStyle={{
                fill: 'rgba(0, 0, 0, 0.1)',
                stroke: 'black',
              }}
            />
          </Group>
          <Group left={margin.left} top={topChartHeight - 20}>
            <Grid<number, number> xScale={xScaleBot} yScale={yScaleBot} width={xMax} height={yMaxBot} stroke="rgba(10, 10, 10, 0.1)"/>
            {overviewData.map((val, i) => {
              const barHeight = yMaxBot - yScaleBot(val[yKey]);
              const barX = xScaleBot(val[xKey]);
              const barY = yMaxBot - barHeight;
              return (
                <Bar
                  key={`bar-${i}`}
                  x={barX - Math.max(botBarWidth/2, 0)}
                  y={barY}
                  width={botBarWidth}
                  height={barHeight}
                />
              );
            })}
            <AxisLeft<number>
              top={0}
              left={0}
              scale={yScaleBot}
              numTicks={5}
              tickFormat={(t: number) => {return  t >= 1000000 ? `${Math.round(t)/1000000}M` : t >= 1000 ? `${Math.round(t)/1000}K` : t}}
              label={yKey}
            />
            <AxisBottom<any>
              top={yMaxBot}
              left={0}
              scale={xScaleBot}
              numTicks={10}
              tickFormat={(t: number) => {return t >= 1000 ? `${Math.round(t)/1000}K` : t}}
              label={xKey}
            />
            <Brush
              xScale={xScaleBot}
              yScale={yScaleBot}
              width={xMax}
              height={yMaxBot}
              margin={margin}
              handleSize={4}
              resizeTriggerAreas={['left', 'right', 'bottomRight']}
              brushDirection="horizontal"
              onChange={(domain) => this.handleOverviewBrushChange(domain)}
              onBrushEnd={() => this.handleOverviewBrushChangeEnd()}
              selectedBoxStyle={{
                fill: 'rgba(0, 0, 0, 0.1)',
                stroke: 'rgba(0, 0, 0, 0.7)',
                strokeWidth: '1px'
              }}
            />
          </Group>
        </svg>
      </div>
    )
  }
}
