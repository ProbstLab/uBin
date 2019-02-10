import {Connection} from 'typeorm'
import {ISampleFilter} from 'samples'

export const getTaxonimyCountQuery = async (connection: Connection, recordId: number): Promise<any> => {
  return connection.getRepository('taxonomy')
    .createQueryBuilder('taxonomy')
    .select('taxonomy.id')
    .addSelect('count(samples.id)', 'sampleCount')
    .leftJoin('taxonomy.samples', 'samples')
    .where('samples.importRecordId = :recordId', {recordId})
    .groupBy('taxonomy.id').getRawMany()
}

export const getTaxonimiesForImportQuery = async (connection: Connection, recordId: number): Promise<any> => {
  return await connection.getRepository('taxonomy')
    .createQueryBuilder('taxonomy').select('taxonomy')
    .leftJoinAndSelect('taxonomy.parent', 'taxonomyParent')
    .leftJoinAndSelect('taxonomyParent.parent', 'taxonomyParent2')
    .leftJoinAndSelect('taxonomyParent2.parent', 'taxonomyParent3')
    .leftJoinAndSelect('taxonomyParent3.parent', 'taxonomyParent4')
    .leftJoinAndSelect('taxonomyParent4.parent', 'taxonomyParent5')
    .leftJoin('taxonomy.samples', 'samples')
    .where('samples.importRecordId = :recordId', {recordId})
    .getMany()
}

export const getTaxonimiesAndCountQuery = async (connection: Connection, recordId: number): Promise<any> => {
  return Promise.all([getTaxonimiesForImportQuery(connection, recordId), getTaxonimyCountQuery(connection, recordId)])
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
    if (filter.scatterDomain && filter.scatterDomain.x) {
      console.log("filter gc", filter.scatterDomain.x)
      query.andWhere('samples.gc >= :gcLow AND samples.gc <= :gcHigh',
        {gcLow: filter.scatterDomain.x[0], gcHigh: filter.scatterDomain.x[1]})
    }
    if (filter.scatterDomain && filter.scatterDomain.y) {
      console.log("filter.coverage", filter.scatterDomain.y)
      query.andWhere('samples.coverage >= :coverageLow AND samples.coverage <= :coverageHigh',
        {coverageLow: filter.scatterDomain.y[0], coverageHigh: filter.scatterDomain.y[1]})
    }
  }
  console.log(query.getQueryAndParameters())
  return query.getMany()
}

export const getSamplesQuery = async (connection: Connection, recordId: number, taxonomyIds?: number[], filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository('sample').createQueryBuilder('sample')
    .select(['sample.id', 'sample.gc', 'sample.coverage', 'sample.length'])
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
