
import * as React from 'react'
import {Crossfilter, Dimension} from 'crossfilter2'
import {IBin, IDomain} from 'samples'
import {Enzyme} from '../db/entities/Enzyme'
import {Sample} from '../db/entities/Sample'
import {scaleLinear, scaleBand} from '@vx/scale'
import { Bar, Line } from '@vx/shape';
import { GridRows } from '@vx/grid';
import { Group } from '@vx/group';
import { AxisLeft, AxisBottom } from '@vx/axis';

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
  width: number
  height: number
}

export interface IBarCharState {
  groupDim?: Dimension<Sample, number>
  xMax: number
  yMax: number
}

export class UBinBarChartVX extends React.Component<IProps> {
  maxVal?: number = undefined
  completeness?: number = 0
  contamination?: number = 0 
  margin = {
    top: 10,
    left: 60,
    bottom: 250,
    right: 10,
  }
  enzymeScale: any
  occurenceScale: any

  getLabel (enzyme: {name: string, amount: number}) {
    return enzyme.name
  }

  public state: IBarCharState = {
    xMax: Math.max(this.props.width - this.margin.left - this.margin.right, 0),
    yMax: Math.max(this.props.height - this.margin.top - this.margin.bottom, 0)
  }

  public componentWillMount(): void {
    let {cf} = this.props
    this.setState({
      groupDim: cf.dimension((d: Sample) => d.id || 0)
    })
    this.enzymeScale = scaleBand({ range: [0, this.state.xMax] })
    this.occurenceScale = scaleLinear({ range: [this.state.yMax, 0], nice: true })
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
    let {occurenceScale, enzymeScale, margin} = this
    let {yMax, xMax,} = this.state
    let {width, height} = this.props
    enzymeScale.domain(data.map(x => x.name))
    occurenceScale.domain([0, Math.max(...data.map(x => x.amount)) || 10])
    return (
      <div>
        <div style={{ width, textAlign: 'center'}}>
          <div>{this.props.title}</div>
          <div>{'Completeness: '+this.completeness+'% | Contamination: '+this.contamination+'%'}</div>
        </div>
        <svg width={width} height={height}>
          <rect width={width} height={height} rx={14} fill="transparent" />
          <Group left={margin.left} top={margin.top}>
            <GridRows scale={occurenceScale} width={xMax} height={yMax} stroke="rgba(10, 10, 10, 0.1)"/>
            {data.map((val, i) => {
              const barWidth = enzymeScale.bandwidth();
              const barHeight = yMax - occurenceScale(val.amount);
              const barX = enzymeScale(val.name);
              const barY = yMax - barHeight;
              return (
                <Bar
                  key={`bar-${i}`}
                  x={barX}
                  y={barY}
                  width={barWidth - 2}
                  height={barHeight}
                  fill="rgb(22, 68, 90)"
                />
              );
            })}
            <AxisLeft<number>
              top={0}
              left={0}
              scale={occurenceScale}
              numTicks={10}
              label="Occurences"
            />
            <AxisBottom<any>
              top={yMax}
              left={0}
              scale={enzymeScale}
            >
              {axis => {
                const tickLabelSize = 10;
                const tickRotate = 280;
                const tickColor = 'black';
                const axisCenter = (axis.axisToPoint.x - axis.axisFromPoint.x) / 2;
                return (
                  <g className="my-custom-bottom-axis">
                    <Line from={axis.axisFromPoint} to={axis.axisToPoint} stroke={tickColor} />
                    {axis.ticks.map((tick, i) => {
                      const tickX = tick.to.x;
                      const tickY = tick.to.y + 5;
                      return (
                        <Group key={`vx-tick-${tick.value}-${i}`} className="vx-axis-tick">
                          <Line from={tick.from} to={tick.to} stroke={'black'} />
                          <text
                            transform={`translate(${tickX}, ${tickY}) rotate(${tickRotate})`}
                            fontSize={tickLabelSize}
                            textAnchor="end"
                            fill={'black'}
                          >
                            {tick.formattedValue}
                          </text>
                        </Group>
                      );
                    })}
                    <text
                      textAnchor="start"
                      transform={`translate(${axisCenter}, 50)`}
                      fontSize="11"
                      fill={tickColor}
                    >
                      {axis.label}
                    </text>
                  </g>
                );
              }}
            </AxisBottom>
          </Group>
        </svg>
      </div>
    )
  }
}
