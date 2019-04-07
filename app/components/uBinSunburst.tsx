import {LabelSeries, Sunburst} from "react-vis"
import * as React from "react"
import {MouseEvent} from 'react'
import {Crossfilter, Dimension, Grouping, NaturallyOrderedValue} from 'crossfilter2'
import {Sample} from '../db/entities/Sample'
import {Taxonomy} from '../db/entities/Taxonomy'
import {IValueMap} from "common"
import {TreeCreator} from '../utils/treeCreator'
import {Hotkeys, HotkeysTarget, Hotkey} from '@blueprintjs/core'

const sunburstLabelStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  textAnchor: 'middle',
} as React.CSSProperties


function getNamePath(node: any): any {
  if (!node.parent) {
    return ['root']
  }
  return [(node.data && node.data.title) || node.title].concat(getNamePath(node.parent))
}

function getKeyPath(node: any): any {
  if (!node.parent) {
    return []
  }
  return [(node.data && node.data.id) || node.id].concat(getKeyPath(node.parent))
}

function getKeyAndNamePath(node: any): any {
  if (!node.parent) {
    return ['root']
  }
  return {keyPath: [(node.data && node.data.id) || node.id].concat(getKeyPath(node.parent)),
          namePath: [(node.data && node.data.title) || node.title].concat(getNamePath(node.parent))}
}

function updateData(data: any, keyPath: any): any {
  if (data.children) {
    data.children.map((child: any) => updateData(child, keyPath))
  }
  // add a fill to all the uncolored cells
  if (!data.hex) {
    data.style = {
      fill: '#125C77',
    }
  }
  data.style = {
    ...data.style,
    fillOpacity: keyPath && !keyPath[data.id] ? 0.2 : 1,
  }

  return data
}


interface IProps {
  data: any
  cf: Crossfilter<Sample>
  taxonomies: IValueMap<Taxonomy>
  selectTaxonomy(id: Taxonomy): void
  excludeTaxonomy(id: Taxonomy): void
}

export interface ISunburstState {
  namePathValue: string,
  finalValue: string,
  clicked: boolean
  pastLength: number
  groupDim?: Dimension<Sample, string>
  tree?: any
}

@HotkeysTarget
export class UBinSunburst extends React.Component<IProps> {
  shouldExclude: boolean = false

  public state: ISunburstState = {
    namePathValue: '',
    finalValue: 'Taxonomy',
    clicked: false,
    pastLength: 0,
  }

  public componentWillMount(): void {
    let {cf} = this.props
    this.setState({
      groupDim: cf.dimension((d: Sample) => d.taxonomiesRelationString),
    })
  }

  public componentDidMount(): void {
    let {groupDim} = this.state
    if (groupDim) {
      let grouped: Grouping<NaturallyOrderedValue, NaturallyOrderedValue>[] = groupDim.group().all().filter(d => d.value)
      this.setState({tree: TreeCreator.createTreeFromCFData(grouped, this.props.taxonomies), pastLength: grouped.length})
    }
  }

  public componentWillUpdate(): void {
    let {groupDim, pastLength} = this.state
    if (groupDim) {
      let grouped: Grouping<NaturallyOrderedValue, NaturallyOrderedValue>[] = groupDim.group().all().filter(d => d.value)
      if (grouped.length !== pastLength) {
        this.setState({tree: TreeCreator.createTreeFromCFData(grouped, this.props.taxonomies), pastLength: grouped.length})
      }
    }
  }

  public renderHotkeys() {
    return <Hotkeys>
      <Hotkey
        global={true}
        combo={'e'}
        label={'Hold shift to exclude'}
        onKeyDown={() => this.shouldExclude = true}
        onKeyUp={() => this.shouldExclude = false}
      />
    </Hotkeys>
  }

  public getData(): any {
    let {tree} = this.state
    return tree ? tree : {}
  }

  public getChildrenIds(datapoint: any): number[] {
    let childrenIdArray: number[] = []
    if (datapoint.hasOwnProperty('children')) {
      if (datapoint.children.length) {
        datapoint.children.forEach((datapoint: any) => {
          childrenIdArray.push(...this.getChildrenIds(datapoint))
        })
      } else if (datapoint.hasOwnProperty('id')) {
        childrenIdArray.push(datapoint.id)
      }
    }
    return childrenIdArray
  }

  public selectTaxonomy(datapoint: any): void {
    if (this.shouldExclude) {
      this.props.excludeTaxonomy(this.props.taxonomies[datapoint.id])
    } else {
      this.props.selectTaxonomy(this.props.taxonomies[datapoint.id])
    }
  }

  render(): JSX.Element {
    const {finalValue, clicked, namePathValue} = this.state
    return (
      <div>
        <Sunburst
          className='uBin-sunburst'
          hideRootNode
          onValueMouseOver={node => {
            if (clicked) {
              return
            }
            let {keyPath, namePath} = getKeyAndNamePath(node)
            keyPath = keyPath.reverse()
            namePath = namePath.reverse()
            const pathAsMap = keyPath.reduce((res: any, row: any) => {
              res[row] = true
              return res
            }, {})
            this.setState({
              finalValue: namePath[namePath.length - 1],
              namePathValue: namePath.slice(1).join(' > '),
              data: updateData(this.props.data, pathAsMap),
            })
          }}
          onValueMouseOut={() =>
            clicked
              ? () => {}
              : this.setState({
                pathValue: false,
                finalValue: 'Taxonomy',
                data: updateData(this.props.data, false),
              })
          }
          onValueClick={(datapoint: any, event: MouseEvent<HTMLElement>) => this.selectTaxonomy(datapoint)}
          style={{
            stroke: '#ddd',
            strokeOpacity: 0.3,
            strokeWidth: '0.5',
          }}
          colorType="literal"
          data={this.getData()}
          height={300}
          width={350}
        >
          {finalValue && (
            <LabelSeries
              data={[{x: 0, y: 0, label: finalValue, style: sunburstLabelStyle}]}
            />
          )}
        </Sunburst>
        <div className='uBin-sunburst'>{namePathValue}</div>
      </div>
    )
  }
}