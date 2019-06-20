
import * as React from 'react'
import {UBinBarChart} from './uBinBarChart'
import {IBin, IDomain} from 'samples'
import {Crossfilter} from 'crossfilter2'
import {Sample} from '../db/entities/Sample'

interface IProps {
  cf: Crossfilter<Sample>
  archaealLabels: string[]
  bacterialLabels: string[]
  domain?: IDomain
  bin?: IBin
  binView: boolean
}

type TProps = IProps

export class EnzymeDistributionBarCharts extends React.PureComponent<TProps> {

  render(): JSX.Element {
    let {bin, cf, domain, archaealLabels, bacterialLabels, binView} = this.props
    return (
      <div style={{width: '100%', maxWidth: '500px', height: 'inherit'}}>
        <div>
          <UBinBarChart cf={cf} title='Bacterial Single Copy Genes' xName='name' xLabels={bacterialLabels} yName='amount'
                        domain={domain} filterBoolName={'bacterial'} bin={bin} binView={binView} maxCount={51}/>
        </div>
        <div>
          <UBinBarChart cf={cf} title='Archaeal Single Copy Genes' xName='name' xLabels={archaealLabels} yName='amount'
                        domain={domain} filterBoolName={'archaeal'} bin={bin} binView={binView} maxCount={38} bottomHeight={300} chartHeight={480}/>
        </div>
      </div>
    )}
  }
