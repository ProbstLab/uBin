import * as React from "react"
import {VictoryAxis, VictoryScatter, VictoryChart, VictoryTheme, VictoryLabel, VictoryBrushContainer} from 'victory'
import {ISample} from '../utils/interfaces'
import {IScatterDomain} from 'samples'
import * as crossfilter from 'crossfilter2'
import {Crossfilter} from 'crossfilter2'

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
  data: ISample[]
  cf: Crossfilter<ISample>
}

export class UBinScatter extends React.Component<IProps> {

  public state: IUBinScatterState = {
    data: this.props.data,
    cf: crossfilter(this.props.data)
  }

  public handleDomainChange(domain: IScatterDomain): void {
    // console.log(domain)
    let payments: Crossfilter<any> = crossfilter([
      {date: "2011-11-14T16:17:54Z", quantity: 2, total: 190, tip: 100, type: "tab", productIDs:["001"]},
      {date: "2011-11-14T16:20:19Z", quantity: 2, total: 190, tip: 100, type: "tab", productIDs:["001", "005"]},
      {date: "2011-11-14T16:28:54Z", quantity: 1, total: 300, tip: 200, type: "visa", productIDs:["004" ,"005"]},
      {date: "2011-11-14T16:30:43Z", quantity: 2, total: 90, tip: 0, type: "tab", productIDs:["001", "002"]},
      {date: "2011-11-14T16:48:46Z", quantity: 2, total: 90, tip: 0, type: "tab", productIDs:["005"]},
      {date: "2011-11-14T16:53:41Z", quantity: 2, total: 90, tip: 0, type: "tab", productIDs:["001", "004" ,"005"]},
      {date: "2011-11-14T16:54:06Z", quantity: 1, total: 100, tip: 0, type: "cash", productIDs:["001", "002", "003", "004" ,"005"]},
      {date: "2011-11-14T16:58:03Z", quantity: 2, total: 90, tip: 0, type: "tab", productIDs:["001"]},
      {date: "2011-11-14T17:07:21Z", quantity: 2, total: 90, tip: 0, type: "tab", productIDs:["004" ,"005"]},
      {date: "2011-11-14T17:22:59Z", quantity: 2, total: 90, tip: 0, type: "tab", productIDs:["001", "002", "004" ,"005"]},
      {date: "2011-11-14T17:25:45Z", quantity: 2, total: 200, tip: 0, type: "cash", productIDs:["002"]},
      {date: "2011-11-14T17:29:52Z", quantity: 1, total: 200, tip: 100, type: "visa", productIDs:["004"]}
    ])
    console.log("crossfilter payments", payments)
    // let paymentsByTotal: any = payments.dimension(function(d: any) { return d.total; })
    // console.log("by total", paymentsByTotal)
    // console.log("by total 100, 200", paymentsByTotal.filter([100, 200]))
    // console.log("by total 100, 200 group", paymentsByTotal.filter([100, 200]).group())
    // console.log("by total 100, 200 group all", paymentsByTotal.filter([100, 200]).group().all())
    // let paymentsByProductID: any = payments.dimension(function(d: any) { return d.productIDs; }, true);
    // console.log("paymentsByProductID", paymentsByProductID)
    // console.log("quantityGroupByProduct", paymentsByProductID.group().reduceSum(function(d: any) { return d.quantity }))

    console.log("cf", this.state.cf)
    console.log("data", this.state.data)
    let covDim: any = this.state.cf.dimension((d: ISample) => { console.log("sample?", d, d.coverage); return d.coverage })
    console.log("coverage dimension", covDim, covDim.filterAll())
    console.log("coverage dimension filter 0-20", covDim.filter([0.7, 20.5]))
    let covGroup: any = covDim.filter([0.7, 20.5]).group((d: number) => {console.log("d", d); return Math.floor(d)})
    console.log("coverage dimension filter 0-20 grouped", covGroup, covGroup.all(), covGroup.size())
    if (this.props.domainChangeHandler) {
      this.props.domainChangeHandler(domain)
    }
  }

  public render(): JSX.Element {
    console.log("render data", this.props.data)
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