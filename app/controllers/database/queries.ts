import {Connection} from 'typeorm'
import {ISampleFilter} from 'samples'
import {Sample} from '../../db/entities/Sample'
import {compareArrayToString} from '../../utils/compare'
import {ThunkDispatch} from 'redux-thunk'
import {AnyAction} from 'redux'
import {SamplesActions} from '../samples'
import {Bin} from '../../db/entities/Bin'
import {Taxonomy} from "../../db/entities/Taxonomy";
import {Enzyme} from "../../db/entities/Enzyme";
import {ImportFile} from "../../db/entities/ImportFile";
import {ImportRecord} from "../../db/entities/ImportRecord";
import { IImportRecord } from 'app/utils/interfaces'

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
    if (filter.selectedTaxonomy) {
      query.andWhere('samples.taxonomiesRelationString like :selectedTaxonomy', {selectedTaxonomy: '%;' + filter.selectedTaxonomy + ';%'})
    }
  }
  return query
}

export const getTaxonomyCountQuery = async (connection: Connection, recordId: number, filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository(Taxonomy)
    .createQueryBuilder('taxonomy')
    .select('taxonomy.id')
    .addSelect('count(samples.id)', 'sampleCount')
    .leftJoin('taxonomy.samples', 'samples')
    .where('samples.importRecordId = :recordId', {recordId})
  return query.groupBy('taxonomy.id').getRawMany()
}

export const getTaxonomiesForImportQuery = async (connection: Connection, recordId: number, filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository(Taxonomy)
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
  return connection.getRepository(Taxonomy).createQueryBuilder('taxonomy').select('taxonomy').getMany()
}

export const getEnzymeDistributionQuery =
  async (connection: Connection, recordId: number, selectedTaxonomys?: number[], filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository(Enzyme).createQueryBuilder('enzyme')
    .leftJoin('enzyme.samples', 'samples')
    .loadRelationCountAndMap('enzyme.sampleCount', 'enzyme.samples')
    .where('samples.importRecordId = :recordId', {recordId})
  if (selectedTaxonomys) {
    query.andWhere('samples.selectedTaxonomy IN (:...selectedTaxonomys)', {selectedTaxonomys})
  } else if (filter) {
    if (filter.selectedTaxonomy) {
      query.andWhere('sample.taxonomiesRelationString like :selectedTaxonomy', {selectedTaxonomy: '%;' + filter.selectedTaxonomy + '%'})
    }
    query = scatterFilter(query, filter)
  }
  return query.getMany()
}

export const getSamplesQuery = async (connection: Connection, recordId: number, filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository(Sample).createQueryBuilder('sample')
    .select(['sample.id', 'sample.gc', 'sample.coverage', 'sample.length', 'sample.taxonomiesRelationString',
                      'enzymes.archaeal', 'enzymes.bacterial', 'enzymes.name', 'bin.id'])
    .leftJoin('sample.enzymes', 'enzymes')
    .leftJoin('sample.bin', 'bin')
    .where('sample.importRecordId = :recordId', {recordId})
   if (filter) {
     if (filter.selectedTaxonomy) {
       query.andWhere('sample.taxonomiesRelationString like :selectedTaxonomy', {selectedTaxonomy: '%;' + filter.selectedTaxonomy + '%'})
     }
   }
  return query.getMany()
}

export const getSamplesWithScaffoldQuery = async (connection: Connection, recordId: number, filter?: ISampleFilter): Promise<any> => {
  let query = connection.getRepository(Sample).createQueryBuilder('sample')
    .select(['sample.id', 'sample.scaffold', 'sample.gc', 'sample.coverage', 'sample.length', 'sample.taxonomiesRelationString', 'bin.id'])
    .leftJoin('sample.bin', 'bin')
    .where('sample.importRecordId = :recordId', {recordId})
  return query.getMany()
}

export const getSamplesWithScaffoldForBinQuery = async (connection: Connection, recordId: number, binId: number): Promise<any> => {
  let query = connection.getRepository(Sample).createQueryBuilder('sample')
    .select(['sample.id', 'sample.scaffold', 'sample.gc', 'sample.coverage', 'sample.length', 'sample.taxonomiesRelationString', 'bin.id'])
    .leftJoin('sample.bin', 'bin')
    .where('sample.importRecordId = :recordId', {recordId})
    .andWhere('sample.binId = :binId', {binId})
  return query.getMany()
}

export const getAllEnzymeTypesQuery = async(connection: Connection): Promise<any> => {
  return connection.getRepository(Enzyme).createQueryBuilder('enzyme').getMany()
}

export const getBinsQuery = async(connection: Connection, recordId: number): Promise<any> => {
  return connection.getRepository(Bin).createQueryBuilder('bin').select(['bin.id', 'bin.name'])
    .leftJoin('bin.samples', 'samples').where('samples.importRecordId = :recordId', {recordId})
    .getMany()
}

export const getSamplesForBinQuery = async (connection: Connection, recordId: number, binId: number): Promise<any> => {
  let query = connection.getRepository(Sample).createQueryBuilder('sample')
    .select(['sample.id', 'sample.gc', 'sample.coverage', 'sample.length', 'enzymes.archaeal', 'enzymes.bacterial', 'enzymes.name', 'bin.id'])
    .leftJoin('sample.enzymes', 'enzymes')
    .leftJoin('sample.bin', 'bin')
    .where('sample.importRecordId = :recordId', {recordId})
    .andWhere('sample.binId = :binId', {binId})
  return query.getMany()
}

const compareScaffoldWithFilters = (sample: Sample, filter: ISampleFilter, excludedTaxonomyStrings: string[], selectedTaxonomy?: string): boolean => {
  if (selectedTaxonomy) {
    if (sample.taxonomiesRelationString.indexOf(selectedTaxonomy) < 0) { return false }
  }
  if (excludedTaxonomyStrings.length) {
    if (compareArrayToString(sample.taxonomiesRelationString, excludedTaxonomyStrings)) { return false }
  }
  if (filter.domain) {
    if (filter.domain.x) {
      if (sample.gc < filter.domain.x[0] || sample.gc > filter.domain.x[1]) {
        return false
      }
    }
    if (filter.domain.y) {
      if (sample.coverage < filter.domain.y[0] || sample.coverage > filter.domain.y[1]) {
        return false
      }
    }
  }
  return true
}

export const saveBinQuery = async (connection: Connection, recordId: number, data: any[], filter: ISampleFilter,
                                   name: {covAvg?: number, gcAvg?: number, consensusName?: string, sampleName?: string},
                                   dispatch?: ThunkDispatch<{}, {}, AnyAction>): Promise<any> => {
  let idList: number[] = []
  let selectedTaxonomy: string|undefined = filter.selectedTaxonomy ? ';'+filter.selectedTaxonomy.id+';' : undefined
  let excludedTaxonomyStrings: string[] = filter.excludedTaxonomies ? filter.excludedTaxonomies.map(excludedTaxonomy => ';'+excludedTaxonomy.id.toString()+';') : []

  if (filter.binView && filter.bin) {
    for (let i: number = 0; i < data.length; i++) {
      if (data[i].bin && data[i].bin.id === filter.bin.id) {
        if (compareScaffoldWithFilters(data[i], filter, excludedTaxonomyStrings, selectedTaxonomy)) {
          idList.push(data[i].id)
        }
      }
    }
  } else {
    for (let i: number = 0; i < data.length; i++) {
      if (compareScaffoldWithFilters(data[i], filter, excludedTaxonomyStrings, selectedTaxonomy)) {
        idList.push(data[i].id)
      }
    }
  }
  let binName: string = [name.sampleName, name.consensusName, name.gcAvg, name.covAvg].join('_')
  let exists: number = await connection.getRepository(Bin).createQueryBuilder('bin')
                            .select('bin.id')
                            .where('bin.name = :binName', {binName})
                            .andWhere('bin.importRecord = :recordId', {recordId})
                            .getCount()
  let nameCounter: number = 2
  while (exists > 0) {
    binName = [name.sampleName, name.consensusName+nameCounter.toString(), name.gcAvg, name.covAvg].join('_')
    exists = await connection.getRepository(Bin).createQueryBuilder('bin')
              .select('bin.id')
              .where('bin.name = :binName', {binName})
              .andWhere('bin.importRecord = :recordId', {recordId})
              .getCount()
    nameCounter++
  }
  let importRecord: ImportRecord = await connection.getRepository(ImportRecord).findOneOrFail(recordId)
  let newBin: Bin = await connection.getRepository(Bin).save({name: binName, importRecord: importRecord})
  let promises: Promise<any>[] = []
  let ceiling: number = idList.length
  let bottom: number = 0
  while (bottom < ceiling) {
    promises.push(connection.getRepository(Sample).createQueryBuilder('sample')
                  .update('sample').set({bin: newBin})
                  .where('id IN (:...idList)', {idList: idList.slice(bottom, bottom+100)}).execute())
    bottom += 100
  }
  if (dispatch) {
    Promise.all([
    dispatch(SamplesActions.setNewBinToData(newBin as Bin, idList))])
      .then(() => Promise.all([dispatch(SamplesActions.setReloadSamples(true)), dispatch(SamplesActions.setBinFilter(newBin as Bin))])
        .then(() => Promise.all([
                                          dispatch(SamplesActions.setReloadSamples(false))])))
  }
  return Promise.all(promises)
}

export const deleteBinQuery = async (connection: Connection, bin: Bin): Promise<any> => {
  let query = connection.getRepository(Sample).createQueryBuilder('sample').update()
              .set({bin: null})
              .where('binId = :binId', {binId: bin.id})
  await query.execute()
  return connection.getRepository(Bin).createQueryBuilder('bin').delete().where('id = :id', {id: bin.id}).execute()
}

export const deleteRecordQuery = async (connection: Connection, record: IImportRecord): Promise<any> => {
  // let enzymesQuery = connection.getRepository(Enzyme).createQueryBuilder('enzyme')
  //                   .leftJoin('enzyme.samples', 'samples')
  //                   .delete()
  //                   .where('samples.importRecordId = :recordId', {recordId: record.id})
  let importFileQuery = connection.getRepository(ImportFile).createQueryBuilder('importFile')
                        .delete()
                        .where('importRecordId = :recordId', {recordId: record.id})
  let binQuery = connection.getRepository(Bin).createQueryBuilder('bin')
                  .delete()
                  .where('importRecordId = :recordId', {recordId: record.id})
  let samplesQuery = connection.getRepository(Sample).createQueryBuilder('sample')
                    .delete()
                    .where('importRecordId = :recordId', {recordId: record.id})
  let recordQuery = connection.getRepository(ImportRecord).createQueryBuilder('record')
                    .delete()
                    .where('id = :recordId', {recordId: record.id})
  return Promise.all([importFileQuery.execute(), binQuery.execute(), samplesQuery.execute()]).then(() => recordQuery.execute())
}

