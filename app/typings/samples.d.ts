
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

  // TODO: IBin is defined here and in utils/interfaces.ts - Should find a better way to do this
  interface IBin {
    id: number
    name: string
  }

  interface ISampleFilter {
    taxonomyId?: number
    scatterDomain?: IScatterDomain
    gcLengthDomain?: IAxisFilter
    gcCoverageDomain?: IAxisFilter
    bin?: IBin
  }

  const enum samplesApiActions {
    getDetails = 'samples.api.getDetails',
  }
}
