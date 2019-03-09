declare module 'samples' {
  interface ISample {
    id: string          // scaffold
    gc: number
    coverage: number
    length: number
    taxonomy: string[],
    genomes: string[]
  }

  interface IAxisFilter {
    range: number[]
  }

  // import {DomainPropType} from 'victory'

  interface IScatterDomain {
    x?: [number, number]
    y?: [number, number]
  }
  interface IBarChartDomain extends IScatterDomain {
  }

  interface ISampleFilter {
    taxonomyIds?: number[]
    scatterDomain?: IScatterDomain
    gcLengthDomain?: IAxisFilter
    gcCoverageDomain?: IAxisFilter
  }

  const enum samplesApiActions {
    getDetails = 'samples.api.getDetails',
  }
}
