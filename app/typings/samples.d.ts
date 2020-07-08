
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

  interface IDomain {
    x?: [number, number]
    y?: [number, number]
  }
  interface IBarChartDomain extends IDomain {
  }

  // TODO: IBin is defined here and in utils/interfaces.ts - Should find a better way to do this
  interface IBin {
    id: number
    name: string
  }

  interface ITaxonomyHelper {
    id: number
    name: string
    order: number
    samples: any
    parent: any
    sampleCount: number
  }

  interface ISampleFilter {
    selectedTaxonomy?: ITaxonomyHelper
    excludedTaxonomies: ITaxonomyHelper[]
    domain?: IDomain
    gcLengthDomain?: IAxisFilter
    gcCoverageDomain?: IAxisFilter
    bin?: IBin
    binView: boolean
  }

  const enum samplesApiActions {
    getDetails = 'samples.api.getDetails',
  }
}
