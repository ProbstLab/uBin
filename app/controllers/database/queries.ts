import {Connection} from 'typeorm'

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

export const getEnzymeDistributionQuery = async (connection: Connection, recordId: number, taxonomyIds?: number[]): Promise<any> => {
  let query = connection.getRepository('enzyme').createQueryBuilder('enzyme')
    .leftJoin('enzyme.samples', 'samples')
    .loadRelationCountAndMap('enzyme.sampleCount', 'enzyme.samples')
    .where('samples.importRecordId = :recordId', {recordId})
  if (taxonomyIds) {
    query.andWhere('samples.taxonomyId IN (:...taxonomyIds)', {taxonomyIds})
  }
  return query.getMany()
}

export const getSamplesQuery = async (connection: Connection, recordId: number, taxonomyIds?: number[]): Promise<any> => {
  let query = connection.getRepository('sample').createQueryBuilder('sample')
    .select(['sample.id', 'sample.gc', 'sample.coverage', 'sample.length'])
    .where('sample.importRecordId = :recordId', {recordId})
  if (taxonomyIds) {
    query.andWhere('sample.taxonomyId IN (:...taxonomyIds)', {taxonomyIds})
  }
  return query.getMany()
}