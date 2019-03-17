
import * as React from 'react'
import {UBinBarChart} from './uBinBarChart'
import {IBin, IScatterDomain} from 'samples'

interface IProps {
  samples: any[]
  samplesPending: boolean
  archaealLabels: string[]
  bacterialLabels: string[]
  domain?: IScatterDomain
  bin?: IBin
}

type TProps = IProps

export class EnzymeDistributionBarCharts extends React.PureComponent<TProps> {

  render(): JSX.Element {
    let {bin, samples, domain, archaealLabels, bacterialLabels} = this.props
    return (
      <div style={{width: '30%', height: 'inherit'}}>
        <div style={{height: '400px'}}>
          <UBinBarChart data={samples} title='Bacterial Single Copy Genes' xName='name' xLabels={bacterialLabels} yName='amount'
                        domain={domain} filterBoolName={'bacterial'} bin={bin}/>
        </div>
        <div style={{height: '400px'}}>
          <UBinBarChart data={samples} title='Archaeal Single Copy Genes' xName='name' xLabels={archaealLabels} yName='amount'
                        domain={domain} filterBoolName={'archaeal'} bin={bin}/>
        </div>
      </div>
    )}
  }