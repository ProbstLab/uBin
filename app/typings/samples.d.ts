declare module 'samples' {
  interface ISample {
    id: string          // scaffold
    gc: number
    coverage: number
    length: number
    taxonomy: string[],
    genomes: string[]
  }

  interface ITaxonomy {
    id: number
    title: string
  }

  interface ISampleFilter {
    taxonomy: string[]
  }

  const enum samplesApiActions {
    getDetails = 'samples.api.getDetails',
  }
}
