
import * as React from 'react'
import {UBinBarChartVX} from './uBinBarChartVX'
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
          <UBinBarChartVX cf={cf} title='Bacterial Single Copy Genes' xName='name' xLabels={bacterialLabels} yName='amount'
                          domain={domain} filterBoolName={'bacterial'} bin={bin} binView={binView} maxCount={51} height={400} width={500}/>
        </div>
        <div>
          <UBinBarChartVX cf={cf} title='Archaeal Single Copy Genes' xName='name' xLabels={archaealLabels} yName='amount'
                          domain={domain} filterBoolName={'archaeal'} bin={bin} binView={binView} maxCount={38} height={400} width={500}/>
        </div>
      </div>
    )}
  }
