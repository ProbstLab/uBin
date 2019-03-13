import {Connection} from 'typeorm'
import {ISampleFilter} from 'samples'

export const scatterFilter = (query: any, filter?: ISampleFilter): any => {
  if (filter) {
    if (filter.scatterDomain && filter.scatterDomain.x) {
      query.andWhere('samples.gc >= :gcLow AND samples.gc <= :gcHigh',
        {gcLow: filter.scatterDomain.x[0], gcHigh: filter.scatterDomain.x[1]})
    }
    if (filter.scatterDomain && filter.scatterDomain.y) {
      query.andWhere('samples.coverage >= :coverageLow AND samples.coverage <= :coverageHigh',
        {coverageLow: filter.scatterDomain.y[0], coverageHigh: filter.scatterDomain.y[1]})
    }
  }
  return query
}

export const getTaxonomyCountQuery = async (connection: Connection, recordId: number, filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository('taxonomy')
    .createQueryBuilder('taxonomy')
    .select('taxonomy.id')
    .addSelect('count(samples.id)', 'sampleCount')
    .leftJoin('taxonomy.samples', 'samples')
    .where('samples.importRecordId = :recordId', {recordId})
  query = scatterFilter(query, filter)
  return query.groupBy('taxonomy.id').getRawMany()
}

export const getTaxonomiesForImportQuery = async (connection: Connection, recordId: number, filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository('taxonomy')
    .createQueryBuilder('taxonomy').select('taxonomy')
    .leftJoinAndSelect('taxonomy.parent', 'taxonomyParent')
    .leftJoinAndSelect('taxonomyParent.parent', 'taxonomyParent2')
    .leftJoinAndSelect('taxonomyParent2.parent', 'taxonomyParent3')
    .leftJoinAndSelect('taxonomyParent3.parent', 'taxonomyParent4')
    .leftJoinAndSelect('taxonomyParent4.parent', 'taxonomyParent5')
    .leftJoin('taxonomy.samples', 'samples')
    .where('samples.importRecordId = :recordId', {recordId})
  query = scatterFilter(query, filter)
  return query.getMany()
}

export const getTaxonomiesAndCountQuery = async (connection: Connection, recordId: number, filter?: ISampleFilter): Promise<any> => {
  return Promise.all([getTaxonomiesForImportQuery(connection, recordId, filter), getTaxonomyCountQuery(connection, recordId, filter)])
}

export const getEnzymeDistributionQuery =
  async (connection: Connection, recordId: number, taxonomyIds?: number[], filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository('enzyme').createQueryBuilder('enzyme')
    .leftJoin('enzyme.samples', 'samples')
    .loadRelationCountAndMap('enzyme.sampleCount', 'enzyme.samples')
    .where('samples.importRecordId = :recordId', {recordId})
  if (taxonomyIds) {
    query.andWhere('samples.taxonomyId IN (:...taxonomyIds)', {taxonomyIds})
  } else if (filter) {
    if (filter.taxonomyIds) {
      query.andWhere('samples.taxonomyId IN (:...taxonomyIds)', {taxonomyIds: filter.taxonomyIds})
    }
    query = scatterFilter(query, filter)
  }
  return query.getMany()
}

export const getSamplesQuery = async (connection: Connection, recordId: number, taxonomyIds?: number[], filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository('sample').createQueryBuilder('sample')
    .select(['sample.id', 'sample.gc', 'sample.coverage', 'sample.length', 'enzymes.archaeal', 'enzymes.bacterial', 'enzymes.name'])
    .leftJoin('sample.enzymes', 'enzymes')
    .where('sample.importRecordId = :recordId', {recordId})
  if (taxonomyIds) {
    query.andWhere('sample.taxonomyId IN (:...taxonomyIds)', {taxonomyIds})
  } else if (filter) {
    if (filter.taxonomyIds) {
      query.andWhere('sample.taxonomyId IN (:...taxonomyIds)', {taxonomyIds: filter.taxonomyIds})
    }
    if (filter.scatterDomain && filter.scatterDomain.x) {
      query.andWhere('sample.gc >= :gcLow AND sample.gc <= :gcHigh',
        {gcLow: filter.scatterDomain.x[0], gcHigh: filter.scatterDomain.x[1]})
    }
    if (filter.scatterDomain && filter.scatterDomain.y) {
      query.andWhere('sample.coverage >= :coverageLow AND sample.coverage <= :coverageHigh',
        {coverageLow: filter.scatterDomain.y[0], coverageHigh: filter.scatterDomain.y[1]})
    }
  }
  return query.getMany()
}
