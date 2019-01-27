import {Connection} from 'typeorm'

export const getTaxonimiesForImportQuery = async (connection: Connection, recordId: number): Promise<any> => {

  // const result: any = await connection.getTreeRepository('taxonomy')
  //   .createAncestorsQueryBuilder()
  //   .andWhere("category.type = 'secondary'")
  //   .getMany();
  // console.log()

  return await connection.getRepository('taxonomy')
    .createQueryBuilder('taxonomy').select('taxonomy')
    .leftJoinAndSelect('taxonomy.parent', 'taxonomyParent')
    .leftJoin('taxonomy.samples', 'samples')
    .where('samples.importRecordId = :recordId', {recordId})
    .getMany()
}