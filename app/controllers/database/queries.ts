import {Connection} from 'typeorm'

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