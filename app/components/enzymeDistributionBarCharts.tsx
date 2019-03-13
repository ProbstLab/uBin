
import * as React from 'react'
import {Connection} from 'typeorm'
import {UBinBarChart} from './uBinBarChart'

interface IProps {
  samples: any[]
  samplesPending: boolean
}

interface IActionsFromState {}

interface IPropsFromState {
  connection: Connection | undefined
}

type TProps = IProps & IPropsFromState & IActionsFromState

export class EnzymeDistributionBarCharts extends React.PureComponent<TProps> {

  render(): JSX.Element {
    if (true) {
      return (<div></div>)
    }
    return (
      <div style={{width: '30%', height: 'inherit'}}>
        <div style={{height: '400px'}}>
          <UBinBarChart data={this.props.samples} title='Archaeal Single Copy Genes' xName='name' yName='amount'/>
        </div>
        {/*<div style={{height: '400px'}}>*/}
          {/*<UBinBarChart data={this.props.bacterialEnzymeDistribution} title='Bacterial Single Copy Genes' xName='name' yName='amount'/>*/}
        {/*</div>*/}
      </div>
    )}
  }