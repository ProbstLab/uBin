import {LabelSeries, Sunburst} from "react-vis"
import * as React from "react"
import {MouseEvent} from 'react'
import {Crossfilter, Dimension, Grouping, NaturallyOrderedValue} from 'crossfilter2'
import {Sample} from '../db/entities/Sample'
import {Taxonomy} from '../db/entities/Taxonomy'
import {IValueMap} from "common"
import {TreeCreator} from '../utils/treeCreator'
import {Hotkeys, HotkeysTarget, Hotkey, Breadcrumbs, IBreadcrumbProps} from '@blueprintjs/core'
import {IGenericAssociativeArray} from '../utils/interfaces'

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
  setConsensus(consensus?: Taxonomy): void
}

export interface ISunburstState {
  namePathValues: IBreadcrumbProps[],
  finalValue: string,
  clicked: boolean
  pastLength: number
  groupDim?: Dimension<Sample, string>
  tree?: any
}

@HotkeysTarget
export class UBinSunburst extends React.Component<IProps> {
  shouldExclude: boolean = false
  consensus?: string
  lastUpdateLength?: number

  public state: ISunburstState = {
    namePathValues: [],
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
    let {taxonomies} = this.props
    let {groupDim, pastLength} = this.state
    if (groupDim) {
      let grouped: Grouping<NaturallyOrderedValue, NaturallyOrderedValue>[] = groupDim.group().all().filter(d => d.value)
      let tree: any = TreeCreator.createTreeFromCFData(grouped, this.props.taxonomies)
      if (grouped.length !== pastLength) {
        if (grouped.length) {
          let taxonomyPathsTotal: number = 0
          for (let i: number = 0; i < grouped.length; i++) { taxonomyPathsTotal += grouped[i].value as number }
          let consensus: string = this.findConsensusInTree(tree, taxonomyPathsTotal)
          this.props.setConsensus(taxonomies[consensus])
        }
      }
      this.setState({tree, pastLength: grouped.length})
    }
  }

  // public shouldComponentUpdate(nextProps: IProps): boolean {
  //   let {groupDim} = this.state
  //   if (!groupDim || this.lastUpdateLength === undefined) { this.lastUpdateLength = 0; return true }
  //   let nextLength = nextProps.cf.dimension((d: Sample) => d.taxonomiesRelationString).group().all().filter(d => d.value).length
  //   if (this.lastUpdateLength !== nextLength){
  //     this.lastUpdateLength = nextLength
  //     return true
  //   }
  //   return false
  // }

  public findConsensus(items: Grouping<any, any>[], level: number, total: number): string|undefined {
    if (level <= 1) { return undefined }
    let realOccurrences: IGenericAssociativeArray = {}
    for (let i: number = 0; i < items.length; i++) {
      if (items[i].key.split(';').length === level+2) {
        realOccurrences[items[i].key] = items[i].value
      }
    }
    let keys: string[] = Object.keys(realOccurrences)
    for (let i: number = 0; i < keys.length; i++) {
      for (let j: number = 0; j < items.length; j++) {
        if (items[j].key === keys[i] && [i].indexOf(items[j].key) >= 0) {
          realOccurrences[keys[i]] += items[j].value
        }
      }
    }
    return this.findConsensus(items, level-1, total)
  }

  public findConsensusInTree(tree: any, total: number): string {
    if (!tree.children.length) { return '' }
    let candidate: string = ''
    let candidateKey: number|undefined
    for (let i: number = 0; i < tree.children.length; i++) {
      if (tree.children[i].hasOwnProperty('count') && tree.children[i].count/total > 0.5) {
        candidate = tree.children[i].id
        candidateKey = i
      }
    }
    if (candidate.length && candidateKey !== undefined) {
      let nextCandidate: string = ''
      let potentialCandidate: string = this.findConsensusInTree(tree.children[candidateKey], total)
      if (potentialCandidate.length) {
        nextCandidate = potentialCandidate
      }
      if (nextCandidate.length) {
        return nextCandidate
      }
      if (candidate.length) {
        return candidate
      }
    }
    return ''
  }

  public componentWillUpdate(): void {
    let {taxonomies} = this.props
    let {groupDim, pastLength} = this.state
    if (groupDim) {

      let grouped: Grouping<NaturallyOrderedValue, NaturallyOrderedValue>[] = groupDim.group().top(Infinity).filter(d => d.value)
      if (grouped.length !== pastLength) {
        let tree: any = TreeCreator.createTreeFromCFData(grouped, taxonomies)
        if (grouped.length) {
          let taxonomyPathsTotal: number = 0
          for (let i: number = 0; i < grouped.length; i++) { taxonomyPathsTotal += grouped[i].value as number }
          let consensus: string = this.findConsensusInTree(tree, taxonomyPathsTotal)
          this.props.setConsensus(taxonomies[consensus])
        }
        this.setState({tree, pastLength: grouped.length})
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
    // console.log("Tree:", tree)
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
    const {finalValue, clicked, namePathValues} = this.state
    // console.log("render sunburst")
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
              namePathValues: namePath.slice(1).map((val: string) => { return {text: val}}),
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
          height={360}
          width={360}
        >
          {finalValue && (
            <LabelSeries
              data={[{x: 0, y: 0, label: finalValue, style: sunburstLabelStyle}]}
            />
          )}
        </Sunburst>
        {/*<div className='uBin-sunburst'>{namePathValue}</div>*/}
        <Breadcrumbs
          items={namePathValues}
        />
      </div>
    )
  }
}