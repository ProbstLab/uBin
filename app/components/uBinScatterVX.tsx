import * as React from "react"
import {IBin, IDomain} from 'samples'
import {Crossfilter} from 'crossfilter2'
import {Dimension} from 'crossfilter2'
// import {Switch} from '@blueprintjs/core'
import {Sample} from '../db/entities/Sample'
import {numToColour} from '../utils/convert'
import {compareArrayToString} from '../utils/compare'
import {Taxonomy} from '../db/entities/Taxonomy'
import {Group} from '@vx/group'
import {Brush} from '@vx/brush'
import {Bounds} from '@vx/brush/lib/types'
import {Circle} from '@vx/shape'
import { PatternLines } from '@vx/pattern';
import { scaleLinear } from '@vx/scale';
import { Grid } from '@vx/grid';
// import { GradientOrangeRed } from '@vx/gradient';
import { AxisLeft, AxisBottom } from '@vx/axis'


interface IProps {
  cf: Crossfilter<Sample>
  title?: string
  domainChangeHandler(domain: IDomain): void
  setGCAverage(avg: number): void
  setCoverageAverage(avg: number): void
  setTotalLength(length: number): void
  setSelectedCount(selectedCount: number): void
  domain?: IDomain
  bin?: IBin
  binView: boolean
  selectedTaxonomy?: Taxonomy
  excludedTaxonomies?: Taxonomy[]
}

interface IScatterDetails {
  xSum: number
  ySum: number
  count: number
  lengthSum: number
  colour: string
}

export interface IUBinScatterState {
  combDim?: Dimension<Sample, string>
  binDim?: Dimension<Sample, number>
  covDim?: Dimension<Sample, number>
  gcDim?: Dimension<Sample, number>
  taxonomyDim?: Dimension<Sample, string>
  originalDomain?: IDomain
  logScale: boolean
}

export class UBinScatterVX extends React.PureComponent<IProps> {

  xAxis?: [number, number]
  yAxis?: [number, number]        
  _originalDomain: IDomain = { x: [0, 100], y: [0, 8000]}
  width = 400
  height = 500
  margin = {
    top: 10,
    left: 60,
    bottom: 50,
    right: 10,
  }
  xMax = Math.max(this.width - this.margin.left - this.margin.right, 0);
  yMax = Math.max(this.height - this.margin.top - this.margin.bottom, 0);
  xScale = scaleLinear<number>({
    range: [0, this.xMax],
    nice: true,
  });
  yScale = scaleLinear<number>({
    range: [this.yMax, 0],
  });
  zoom?: number
  currentRanges?: {x: number, y: number}
  allowUpdate: boolean = true
  lengthTotal: number = 0
  gcAverage?: number
  coverageAverage?: number

  public state: IUBinScatterState = {
    logScale: localStorage.getItem('logScale') ? localStorage.getItem('logScale') === 'true' : false,
  }

  public componentWillMount(): void {
    let {cf} = this.props
    this.setState({
      // combDim: cf.dimension((d: Sample) => Math.round(d.gc/2)*2+':'+Math.round(d.coverage/50)*50+':'+(d.bin ? d.bin.id : '')),
      binDim: cf.dimension((d: Sample) => d.bin ? d.bin.id : 0),
      covDim: cf.dimension((d: Sample) => d.coverage),
      taxonomyDim: cf.dimension((d: Sample) => d.taxonomiesRelationString),
      gcDim: cf.dimension((d: Sample) => d.gc),
    })
    this.setScatterScaling()
  }

  public componentDidMount(): void {
    let { combDim } = this.state
    if (combDim) {
      let bottom: Sample = combDim.bottom(1)[0]
      let top: Sample = combDim.top(1)[0]
      if (bottom && top) {
        this.setState({
          originalDomain: {
            x: [bottom.gc, top.gc],
            y: [bottom.coverage, top.coverage],
          },
        })
      } else {
        this.setState({
          originalDomain: this._originalDomain,
        })
      }
    }
  }

  componentWillUpdate(nextProps: IProps): void {
    this.setScatterScaling(nextProps)
  }

  setScatterDomain () {
    let {gcDim, covDim} = this.state
    if (gcDim && covDim) {
      let gcBot = gcDim.bottom(1)[0]
      let gcTop = gcDim.top(1)[0]
      let covBot = covDim.bottom(1)[0]
      let covTop = covDim.top(1)[0]
      if (gcBot && gcTop && covBot && covTop) {
        let gcMargin =  Math.round(Math.sqrt((gcTop.gc - gcBot.gc) ** 2) / 100) | 1
        let covMargin = Math.round(Math.sqrt((covTop.coverage - covBot.coverage) ** 2) / 100) | 1
        let gcRange = [gcBot.gc - gcMargin , gcTop.gc + gcMargin]
        let covRange = [covBot.coverage - covMargin, covTop.coverage + covMargin]
        this.xScale.domain(gcRange)
        this.yScale.domain(covRange)
      }
    }
  }

  setScatterScaling(nextProps?: IProps): void {
    let {domain, cf, bin, binView} = nextProps || this.props
    let {combDim} = this.state
    if (domain && domain.x && domain.y) {
      let currentXRange: number = Math.sqrt((domain.x[1] - domain.x[0]) ** 2)
      let currentYRange: number = Math.sqrt((domain.y[1] - domain.y[0]) ** 2)
      if (!this.currentRanges || this.currentRanges.y !== currentYRange) {
        console.log("xscale 1", this.xScale)
        this.setCombGrouping(currentXRange, currentYRange, nextProps)
      }
    } else if (combDim && bin && binView) {
      let bottom: Sample = combDim.bottom(1)[0]
      let top: Sample = combDim.top(1)[0]
      if (bottom && top) {
        let currentXRange: number = Math.sqrt((top.gc - bottom.gc) ** 2)
        let currentYRange: number = Math.sqrt((top.coverage - bottom.coverage) ** 2)
        if (!this.currentRanges || this.currentRanges.y !== currentYRange) {
          this.setCombGrouping(currentXRange, currentYRange, nextProps)
        }
      }
    } else if (this.allowUpdate) {
      this.setState({combDim: cf.dimension(
        (d: Sample) => Math.round(d.gc / 2) * 2 + ':' + Math.round(d.coverage / 50) * 50 + ':' + (d.bin ? d.bin.id : '')),
      })
      this.allowUpdate = false
    }
  }

  private setCombGrouping(currentXRange: number, currentYRange: number, nextProps?: IProps): void {
    let {cf} = nextProps || this.props
    this.currentRanges = {x: currentXRange, y: currentYRange}
    let yRoundTo = Math.round(currentYRange / 100) > 1 ? Math.round(currentYRange / 100) : 2
    this.setState({
        combDim: cf.dimension(
          (d: Sample) => (currentYRange > 1000 ? Math.round(d.gc / 2) * 2 : Math.round(d.gc)) + ':' + this.round(d.coverage, yRoundTo, 0) + ':' + (d.bin ? d.bin.id : ''))
      },
    )
    this.allowUpdate = true
  }

  public reduceInitial(): any {
    return {xSum: 0, ySum: 0, count: 0, lengthSum: 0}
  }

  public reduceAdd(p: any, v: Sample): any {
    p.xSum += v.gc
    p.ySum += v.coverage
    p.lengthSum += v.length
    p.count += 1
    if (!p.colour) {
      if (v.bin) {
        p.colour = '#' + numToColour(v.bin.id)
      } else {
        p.colour = '#455a64'
      }
    }
    return p
  }

  public reduceRemove(p: any, v: Sample): any {
    p.xSum -= v.gc
    p.ySum -= v.coverage
    p.lengthSum -= v.length
    p.count -= 1
    return p
  }

  public round(num: number, x: number, o: number): number {
    return Math.round((o + Math.ceil((num - o)/ x ) * x)*10)/10
  }

  public getData(): any {
    let { covDim, gcDim, combDim, binDim, taxonomyDim } = this.state
    let { domain, bin, binView, selectedTaxonomy, excludedTaxonomies } = this.props

    if (gcDim && covDim && combDim && binDim && taxonomyDim) {
      if (domain) {
        if (domain.x) {
          gcDim.filterRange(domain.x)
        } else {
          gcDim.filterAll()
        }
        if (domain.y) {
          covDim.filterRange(domain.y)
        } else {
          covDim.filterAll()
        }
      } else {
        gcDim.filterAll()
        covDim.filterAll()
        this.zoom = undefined
      }
      if (bin && binView) {
        binDim.filterExact(bin.id)
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

      let bottom: Sample = combDim.bottom(1)[0]
      let top: Sample = combDim.top(1)[0]
      let scalingFactor: number
      if (bottom && top) {
        scalingFactor = 20 / Math.sqrt((top.gc ** 2 - bottom.gc ** 2))
      }

      this.lengthTotal = 0
      let gcSum: number = 0
      let covSum: number = 0
      let c: number = 0
      let returnVals: any = combDim.group().reduce(this.reduceAdd, this.reduceRemove, this.reduceInitial).all().
                              filter((value: any) => value.value.count).map((value: any) => {
        let valObj: IScatterDetails = value.value
        this.lengthTotal += valObj.lengthSum
        gcSum += ((valObj.xSum/valObj.count)*(valObj.lengthSum/valObj.count))*valObj.count
        covSum += ((valObj.ySum/valObj.count)*(valObj.lengthSum/valObj.count))*valObj.count
        c += valObj.count
        let size: number = Math.log(valObj.lengthSum)*scalingFactor
        return {gc: valObj.xSum/valObj.count, coverage: valObj.ySum/valObj.count, size, colour: valObj.colour}
      })
      this.props.setTotalLength(this.lengthTotal)
      if (this.coverageAverage !== covSum/this.lengthTotal) {
        this.props.setCoverageAverage(Math.round(covSum/this.lengthTotal))
        this.coverageAverage = covSum/this.lengthTotal
      }
      if (this.gcAverage !== gcSum/this.lengthTotal) {
        this.props.setGCAverage(Math.round(gcSum/this.lengthTotal))
        this.gcAverage = gcSum/this.lengthTotal
      }
      this.props.setSelectedCount(c)
      return returnVals
    }
    return []
  }

  public handleDomainChangeEnd(): void {
    if (this.props.domainChangeHandler) {
      let { xAxis, yAxis } = this
      console.log("Hello!", this)
      console.log(xAxis, yAxis)
      this.props.domainChangeHandler({x: xAxis, y: yAxis})
    }
  }

  public handleDomainChange(domain: Bounds): void {
    if (domain) {
      this.xAxis = [domain.x0, domain.x1]
      this.yAxis = [domain.y0, domain.y1]
    }
  }

//   private handleLogScaleChange(): void {
//     let negatedLogScale = !this.state.logScale
//     this.setState({logScale: !this.state.logScale})
//     localStorage.setItem('logScale', negatedLogScale.toString())
// }
  public render(): JSX.Element {
    // let {logScale} = this.state
    let {height, width, xMax, yMax, xScale, yScale, margin} = this
    this.setScatterDomain()
    
    return (
      <div>
        <svg width={width} height={height}>
          {/* <GradientOrangeRed id="axis_gradient" vertical={false} fromOpacity={0.8} toOpacity={0.3} /> */}
          <rect x={0} y={0} width={width} height={height} fill="white" rx={14} />
          <Grid<Number, number>
            top={margin.top}
            left={margin.left}
            xScale={xScale}
            yScale={yScale}
            width={xMax}
            height={yMax}
            stroke="black"
            strokeOpacity={0.1}
          />
          <Group left={margin.left} top={margin.top}>
            {this.getData().map((point, i) => {
              // const r = i % 3 === 0 ? 2 : 2.765;
              return (
                <Circle
                  key={`point-${i}`}
                  className="dot"
                  cx={xScale(point.gc)}
                  cy={yScale(point.coverage)}
                  r={point.size}
                  fill={point.colour}
                />
              );
            })}
            <AxisLeft<number>
              top={0}
              left={0}
              scale={yScale}
              hideZero
              numTicks={10}
              label="Coverage"
            />
            <AxisBottom<number>
              top={yMax}
              left={0}
              scale={xScale}
              numTicks={10}
              label="gc"
            />
            <PatternLines
              id="brush_pattern"
              height={8}
              width={8}
              stroke={'white'}
              strokeWidth={1}
              orientation={['diagonal']}
            />
            <Brush
              xScale={xScale}
              yScale={yScale}
              width={xMax}
              height={yMax}
              handleSize={8}
              resizeTriggerAreas={['left', 'right', 'bottomRight']}
              brushDirection="both"
              onChange={(domain) => this.handleDomainChange(domain)}
              // onClick={() => setFilteredStock(stock)}
              onBrushEnd={() => this.handleDomainChangeEnd()}
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
