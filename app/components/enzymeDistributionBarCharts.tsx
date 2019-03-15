
import * as React from 'react'
import {Connection} from 'typeorm'
import {UBinBarChart} from './uBinBarChart'
import {IScatterDomain} from 'samples'

interface IProps {
  samples: any[]
  samplesPending: boolean
  archaealLabels: string[]
  bacterialLabels: string[]
  domain?: IScatterDomain
}

interface IActionsFromState {}

interface IPropsFromState {
  connection: Connection | undefined
}

type TProps = IProps & IPropsFromState & IActionsFromState

export class EnzymeDistributionBarCharts extends React.PureComponent<TProps> {

  render(): JSX.Element {
    return (
      <div style={{width: '30%', height: 'inherit'}}>
        <div style={{height: '400px'}}>
          <UBinBarChart data={this.props.samples} title='Archaeal Single Copy Genes' xName='name' xLabels={this.props.archaealLabels} yName='amount'
                        domain={this.props.domain}/>
        </div>
        {/*<div style={{height: '400px'}}>*/}
          {/*<UBinBarChart data={this.props.bacterialEnzymeDistribution} title='Bacterial Single Copy Genes' xName='name' yName='amount'/>*/}
        {/*</div>*/}
      </div>
    )}
  }