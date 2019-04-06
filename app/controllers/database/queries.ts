import {Connection} from 'typeorm'
import {ISampleFilter} from 'samples'

export const scatterFilter = (query: any, filter?: ISampleFilter): any => {
  if (filter) {
    if (filter.domain && filter.domain.x) {
      query.andWhere('samples.gc >= :gcLow AND samples.gc <= :gcHigh',
        {gcLow: filter.domain.x[0], gcHigh: filter.domain.x[1]})
    }
    if (filter.domain && filter.domain.y) {
      query.andWhere('samples.coverage >= :coverageLow AND samples.coverage <= :coverageHigh',
        {coverageLow: filter.domain.y[0], coverageHigh: filter.domain.y[1]})
    }
    if (filter.bin && filter.binView) {
      query.andWhere('samples.binId = :binId', {binId: filter.bin.id})
    }
    if (filter.taxonomyId) {
      query.andWhere('samples.taxonomiesRelationString like :taxonomyId', {taxonomyId: '%;' + filter.taxonomyId + ';%'})
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

export const getAllTaxonomiesQuery = async (connection: Connection): Promise<any> => {
  return connection.getRepository('taxonomy').createQueryBuilder('taxonomy').select('taxonomy').getMany()
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
    if (filter.taxonomyId) {
      query.andWhere('sample.taxonomiesRelationString like :taxonomyId', {taxonomyId: '%;' + filter.taxonomyId + '%'})
    }
    query = scatterFilter(query, filter)
  }
  return query.getMany()
}

export const getSamplesQuery = async (connection: Connection, recordId: number, filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository('sample').createQueryBuilder('sample')
    .select(['sample.id', 'sample.gc', 'sample.coverage', 'sample.length', 'sample.taxonomiesRelationString',
                      'enzymes.archaeal', 'enzymes.bacterial', 'enzymes.name', 'bin.id'])
    .leftJoin('sample.enzymes', 'enzymes')
    .leftJoin('sample.bin', 'bin')
    .where('sample.importRecordId = :recordId', {recordId})
   if (filter) {
     if (filter.taxonomyId) {
       query.andWhere('sample.taxonomiesRelationString like :taxonomyId', {taxonomyId: '%;' + filter.taxonomyId + '%'})
     }
   }
  return query.getMany()
}

export const getAllEnzymeTypesQuery = async(connection: Connection): Promise<any> => {
  return connection.getRepository('enzyme').createQueryBuilder('enzyme').getMany()
}

export const getBinsQuery = async(connection: Connection, recordId: number): Promise<any> => {
  return connection.getRepository('bin').createQueryBuilder('bin').select(['bin.id', 'bin.name'])
    .leftJoin('bin.samples', 'samples').where('samples.importRecordId = :recordId', {recordId})
    .getMany()
}

export const getSamplesForBinQuery = async (connection: Connection, recordId: number, binId: number): Promise<any> => {
  let query = connection.getRepository('sample').createQueryBuilder('sample')
    .select(['sample.id', 'sample.gc', 'sample.coverage', 'sample.length', 'enzymes.archaeal', 'enzymes.bacterial', 'enzymes.name', 'bin.id'])
    .leftJoin('sample.enzymes', 'enzymes')
    .leftJoin('sample.bin', 'bin')
    .where('sample.importRecordId = :recordId', {recordId})
    .andWhere('sample.binId = :binId', {binId})
  return query.getMany()
}