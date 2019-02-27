import * as React from "react"
import {VictoryAxis, VictoryScatter, VictoryChart, VictoryTheme, VictoryLabel, VictoryBrushContainer} from 'victory'
import {ISample} from '../utils/interfaces'
import {IScatterDomain} from 'samples'

// const getLabelData = (data: IVisData[]) => data.map((value: IVisData, index: number): any => {
//   return {x: value.x, y: value.y, label: value.x.toString()}
// })
//
// const getGeneCount = (data: IVisData[]) => data.map(value => value.y)

interface IProps {

  data: ISample[]
  title?: string
  domainChangeHandler(scatterDomain: IScatterDomain): void
}

export interface IUBinScatterState {
  // labelData: any[]
  // geneCount: number
}

export class UBinScatter extends React.Component<IProps> {

  public state: IUBinScatterState = {}

  public handleDomainChange(domain: IScatterDomain): void {
    // console.log(domain)
    if (this.props.domainChangeHandler) {
      this.props.domainChangeHandler(domain)
    }
  }

  public render(): JSX.Element {
    return (
      <VictoryChart containerComponent={<VictoryBrushContainer
                                        defaultBrushArea="disable"
                                        onBrushDomainChange={(domain: any, props: any) => this.handleDomainChange(domain)}/>}
                    theme={VictoryTheme.material} domainPadding={20}
                    height={600}
                    width={400}
                    padding={{ left: 40, top: 40, right: 10, bottom: 150 }}>
        <VictoryAxis
          tickLabelComponent={<VictoryLabel style={{textAnchor:'end', fontSize: '10px'}} angle={-75}/>}
        />
        <VictoryAxis
          dependentAxis={true}
          tickFormat={(t: number) => {return  t >= 1000 ? `${Math.round(t)/1000}k` : t}}
        />
        <VictoryScatter
          bubbleProperty="size"
          maxBubbleSize={20}
          data={this.props.data}
          x={'gc'}
          y={'coverage'}
        />
      </VictoryChart>
    )
  }
}