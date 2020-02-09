import * as React from 'react'
import {Crossfilter, Dimension, Grouping} from 'crossfilter2'
import {IBin, IDomain} from 'samples'
import {Sample} from '../db/entities/Sample'
import * as crossfilter from 'crossfilter2'
import {numToColour} from '../utils/convert'
import {compareArrayToString} from '../utils/compare'
import {Taxonomy} from '../db/entities/Taxonomy'
import {scaleLinear} from '@vx/scale'
import {Bounds} from '@vx/brush/lib/types'
import { Bar } from '@vx/shape';
import { Grid } from '@vx/grid';
import { Group } from '@vx/group';
import Brush from './FutureBrush'
import { AxisLeft, AxisBottom } from '@vx/axis';

interface IProps {
  data: any[]
  title: string
  xDomain?: [number, number]
  coverageRange?: [number, number]
  xName?: 'gc' | 'length' | 'coverage'
  yName?: 'gc' | 'length' | 'coverage'
  bin?: IBin
  binView: boolean
  range?: [number, number]
  setWorldDomain(domain: [number, number]): void
  domainChangeHandler(domain: IDomain): void
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies?: Taxonomy[]
  width: number
  height: number
}

export interface IBarCharState {
  cf: Crossfilter<Sample>
  selectedDomain?: any
  zoomDomain?: any
  groupDim?: Dimension<Sample, number>
  coverageDim?: Dimension<Sample, number>
  binDim?: Dimension<Sample, number>
  taxonomyDim?: Dimension<Sample, string>
  xMax: number
  yMax: number
}

export class UBinGCBarChartVX extends React.Component<IProps> {

  currentDomain?: any
  activeBin?: number
  binRange?: [number, number]
  margin = {
    top: 10,
    left: 60,
    bottom: 60,
    right: 10,
  }
  xScale: any
  yScale: any

  public state: IBarCharState = {
    cf: crossfilter(this.props.data),
    xMax: Math.max(this.props.width - this.margin.left - this.margin.right, 0),
    yMax: Math.max(this.props.height - this.margin.top - this.margin.bottom, 0)
  }

  public componentWillMount(): void {
    if (this.props.xName !== undefined) {
      let {cf} = this.state
      this.setState({
        binDim: cf.dimension((d: Sample) => d.bin ? d.bin.id : 0),
        coverageDim: cf.dimension((d: Sample) => d.coverage),
        groupDim: cf.dimension((d: Sample) => Math.round(d.gc)),
        taxonomyDim: cf.dimension((d: Sample) => d.taxonomiesRelationString),
      })
      this.xScale = scaleLinear({ range: [0, this.state.xMax], domain: [0, 100] })
      this.yScale = scaleLinear({ range: [this.state.yMax, 0], nice: true })
    }
  }

  public componentWillUpdate(nextProps: IProps): void {
    let { xDomain } = nextProps
    if (this.currentDomain !== xDomain) {
      this.currentDomain = xDomain
    }
  }

  public handleBrushChangeEnd(): void {
    this.props.setWorldDomain(this.currentDomain)
  }

  public handleBrushChange(domain: Bounds): void {
    if (domain) {
      this.currentDomain = [domain.x0, domain.x1]
      if (this.currentDomain && this.currentDomain[1] > 100) {
        this.currentDomain[1] = 100
      }
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
    let {groupDim, coverageDim, binDim, taxonomyDim} = this.state
    if (groupDim && coverageDim && binDim && taxonomyDim) {
      let binChanged: boolean = false
      let {xName, yName, bin, binView, coverageRange, selectedTaxonomy, excludedTaxonomies} = this.props
      if (coverageRange) {
        coverageDim.filterRange(coverageRange)
      } else {
        coverageDim.filterAll()
      }
      if (bin && binView) {
        binDim.filterExact(bin.id)
        if (this.activeBin !== bin.id) {
          this.activeBin = bin.id
          this.binRange = undefined
          binChanged = true
        }
      } else {
        binDim.filterAll()
      }
      if (selectedTaxonomy) {
        let taxonomyString: string = ';'+selectedTaxonomy.id.toString()+';'
        let excludedTaxonomyStrings: string[] = excludedTaxonomies ? excludedTaxonomies.map(excludedTaxonomy => ';'+excludedTaxonomy.id.toString()+';') : []
        if (excludedTaxonomyStrings.length) {
          taxonomyDim.filterFunction((d: string) => d.indexOf(taxonomyString) >= 0 && !compareArrayToString(d, excludedTaxonomyStrings))
        } else {
          taxonomyDim.filterFunction((d: string) => d.indexOf(taxonomyString) >= 0)
        }
      } else if (excludedTaxonomies && excludedTaxonomies.length) {
        let excludedTaxonomyStrings: string[] = excludedTaxonomies ? excludedTaxonomies.map(excludedTaxonomy => ';'+excludedTaxonomy.id.toString()+';') : []
        taxonomyDim.filterFunction((d: string) => !compareArrayToString(d, excludedTaxonomyStrings))
      } else {
        taxonomyDim.filterAll()
      }
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

  public render(): JSX.Element {
    let {xName, yName, bin} = this.props
    let {binRange} = this
    let binColour: string
    if (bin && xName) {
      binColour = numToColour(bin.id)
    }
    let data: any = this.getData()
    let {xScale, yScale, margin} = this
    let {yMax, xMax} = this.state
    let {width, height} = this.props
    let xKey = xName || 'x'
    let yKey = yName || 'y'
    yScale.domain([0, Math.max(...data.map(y => y[yKey])) || 10])
    return (
      <div>
        <svg width={width} height={height}>
          <rect width={width} height={height} rx={14} fill="transparent" />
          <Group left={margin.left} top={margin.top}>
            <Grid<number, number> xScale={xScale} yScale={yScale} width={xMax} height={yMax} stroke="rgba(10, 10, 10, 0.1)"/>
            {this.props.xDomain &&
              <rect height={yMax} width={Math.sqrt((xScale(this.props.xDomain[1]) - xScale(this.props.xDomain[0]))**2)}
               x={xScale(this.props.xDomain[0])} fill={'rgba(48, 156, 34, 0.1)'} />
            }
            {data.map((val, i) => {
              const barWidth = width / 100;
              const barHeight = yMax - yScale(val[yKey]);
              const barX = xScale(val[xKey]);
              const barY = yMax - barHeight;
              return (
                <Bar
                  key={`bar-${i}`}
                  x={barX}
                  y={barY}
                  width={barWidth - 2}
                  height={barHeight}
                  fill={binRange && binRange[0] <= val[xName || 'x'] && binRange[1] >= val[xName || 'x'] ? '#'+binColour : "#455a64"}
                />
              );
            })}
            <AxisLeft<number>
              top={0}
              left={0}
              scale={yScale}
              numTicks={10}
              tickFormat={(t: number) => {return  t >= 1000000 ? `${Math.round(t)/1000000}M` : t >= 1000 ? `${Math.round(t)/1000}K` : t}}
              label="length"
            />
            <AxisBottom<any>
              top={yMax}
              left={0}
              scale={xScale}
              numTicks={10}
              label="gc"
            />
            <Brush
              xScale={xScale}
              yScale={yScale}
              width={xMax}
              height={yMax}
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
        </svg>
      </div>
    )
  }
}
