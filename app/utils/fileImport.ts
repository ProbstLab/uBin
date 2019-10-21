import * as fs from "fs"
import {
  ISample,
  IDynamicAssociativeArray,
  IEnzyme,
  ITaxonomy,
  ITaxonomyAssociativeArray,
  IBin,
} from "./interfaces"
import * as csv from 'csv-parser'
import {Connection} from "typeorm"
import {IFile} from "files"
import * as _ from 'lodash'
import {Taxonomy} from '../db/entities/Taxonomy'
import {ImportFile} from "../db/entities/ImportFile";
import {ImportRecord} from "../db/entities/ImportRecord";
import {Enzyme} from "../db/entities/Enzyme";
import {Bin} from "../db/entities/Bin";

export const importFiles = async (addedFiles: IFile[], connection: Connection, importName: string, importSetting: number = 0) => {
  const taxonomyFile: IFile = addedFiles[0]
  const enzymeFile: IFile = addedFiles[1]
  let taxonomyMap: ITaxonomyAssociativeArray = {}
  let enzymeMap: IDynamicAssociativeArray = {}
  let sampleMap: IDynamicAssociativeArray = {}
  let binMap: IDynamicAssociativeArray = {}
  let binList: string[] = []
  return new Promise(resolve => {
    fs.createReadStream(taxonomyFile.filePath)
      .pipe(csv({separator: '\t', mapHeaders: ({header, index}) => header.toLowerCase()}))
      .on('data', async (data: any) => {
        let taxonomies = data.taxonomy.split(';')
        let sample: ISample = {
          scaffold: data.scaffold,
          coverage: data.coverage,
          gc: data.gc,
          length: data.length,
          taxonomyKeys: [],
          enzymeKeys: [],
          binName: data.bin,
        }
        if (data.bin && binList.indexOf(data.bin) < 0) {
          binList.push(data.bin)
        }
        let pathToChildren: string[] = []
        taxonomies.map((taxonomy: string, index: number) => {
          if (taxonomy) {
            sample.taxonomyKeys.push(taxonomy)
            if (!index && !taxonomyMap.hasOwnProperty(taxonomy)) {
              taxonomyMap[taxonomy] = {name: taxonomy, order: index, children: {}}
              pathToChildren.push(taxonomy, 'children')
            } else if (index) {
              pathToChildren.push(taxonomy)
              if (! _.get(taxonomyMap, pathToChildren)) {
                _.set(taxonomyMap, pathToChildren, {name: taxonomy, order: index, children: {}})
              }
              pathToChildren.push('children')
            } else {
              pathToChildren.push(taxonomy, 'children')
            }
          }
        })
        if (importSetting === 0 || (importSetting === 1 && data.bin) || (importSetting === 2 && !data.bin)) {
          sampleMap[data.scaffold] = sample
        }
      }).on('end', () => {
      let enzymeList: string[]
      fs.createReadStream(enzymeFile.filePath)
        .pipe(csv({separator: ','}))
        .on('headers', (headers: string[]) => {
          headers.shift()
          enzymeList = headers
        })
        .on('data', async (data: any) => {

          if (sampleMap.hasOwnProperty(data.scaffolds)) {
            let item: ISample = sampleMap[data.scaffolds] as ISample
            for (let key of enzymeList) {
              item.enzymeKeys.push(+data[key])
            }
            sampleMap[data.scaffolds] = item
          }
        }).on('end', async () => {
          await saveSamples(enzymeFile, taxonomyFile, connection, importName, enzymeList, enzymeMap, taxonomyMap, sampleMap, binList, binMap)
          resolve(true)
      })
    })
  })
}

const saveSamples = async (enzymeFile: IFile, taxonomyFile: IFile, connection: Connection, importName: string, enzymeList: string[],
                           enzymeMap: IDynamicAssociativeArray, taxonomyMap: ITaxonomyAssociativeArray, sampleMap: IDynamicAssociativeArray,
                           binList: string[], binMap: IDynamicAssociativeArray) => {
  console.log(1)
  let enzymeFileSaved = await connection.getRepository(ImportFile).save({ name: enzymeFile.filePath })
  console.log(1.1)
  let taxonomyFileSaved = await connection.getRepository(ImportFile).save({ name: taxonomyFile.filePath })
  console.log(1.2)
  let importRecord: ImportRecord = undefined
  try {
    console.log(1.3)
    importRecord = await connection.getRepository(ImportRecord).save({name: importName, files: [enzymeFileSaved, taxonomyFileSaved],})
    console.log(1.4)
  } catch (e) {
    if (enzymeFileSaved.id && taxonomyFileSaved.id) {
      await deleteImportFiles([enzymeFileSaved.id, taxonomyFileSaved.id], connection)
    }
    return e
  }
  console.log(2)
  // Save new Enzymes and load already saves ones from database
  try {
    await Promise.all(enzymeList.map(async (value: string, index: number) => {
      let exists = await connection.getRepository(Enzyme).count({where: {name: value}})
      if (exists) {
        enzymeMap[value] = await connection.getRepository(Enzyme).findOne({where: {name: value}})
      } else {
        enzymeMap[value] = await connection.getRepository(Enzyme).save({name: value, bacterial: index <= 50, archaeal: index > 50})
      }
    }))
  } catch (e) {
    if (enzymeFileSaved.id && taxonomyFileSaved.id && importRecord.id) {
      await revertImport(importRecord.id, [enzymeFileSaved.id, taxonomyFileSaved.id], connection)
    }
    return e
  }
  console.log(3)

  // Save bins and link them to new record
  try {
    await Promise.all(binList.map(async (value: string) => {
      binMap[value] = await connection.getRepository(Bin).save({name: value, importRecord: importRecord})
    }))
  } catch (e) {
    if (enzymeFileSaved.id && taxonomyFileSaved.id && importRecord.id) {
      await revertImport(importRecord.id, [enzymeFileSaved.id, taxonomyFileSaved.id], connection)
    }
    return e
  }
  console.log(4)

  // Create new Taxonomy tree/Add new taxonomies to existing parents
  try {
    // console.log("taxonomy Map")
    // console.log(taxonomyMap)
    // console.log("______________")
    await saveTaxonomy(taxonomyMap, connection)
  } catch (e) {
    if (enzymeFileSaved.id && taxonomyFileSaved.id && importRecord.id) {
      await revertImport(importRecord.id, [enzymeFileSaved.id, taxonomyFileSaved.id], connection)
    }
    return e
  }

  let itemList: ISample[] = []
  Object.keys(sampleMap).map( (key: string) => {
    let item = sampleMap[key] as ISample
    let newEnzymes: IEnzyme[] = []

    let tmpTaxonomy: ITaxonomy = taxonomyMap[item.taxonomyKeys[0]]
    let taxonomyIds: number[] = []
    if (tmpTaxonomy) {
      if (tmpTaxonomy && tmpTaxonomy.id) {
        taxonomyIds.push(tmpTaxonomy.id)
      }
      for (let i: number = 1; i < item.taxonomyKeys.length; i ++) {
        tmpTaxonomy = tmpTaxonomy.children[item.taxonomyKeys[i]]
        if (tmpTaxonomy) {
          taxonomyIds.push(tmpTaxonomy.id || 0)
        } else {
          break
        }
      }
    }
    for (let i: number = item.taxonomyKeys.length-1; i > 0; i--) {
      item.taxonomyKeys.splice(i, 0, 'children')
    }
    try {
      item.taxonomy = {id: _.get(taxonomyMap, item.taxonomyKeys).id}
      item.taxonomiesRelationString = ';'+taxonomyIds.join(';')+';'
    } catch (e) {
      console.log(e)
    }
    for (let enzymeKey of item.enzymeKeys.map((e: number, i: number) => e === 1 ? i : undefined).filter((x: number) => x !== undefined)) {
      if (enzymeKey !== undefined) {
        newEnzymes.push(enzymeMap[enzymeList[enzymeKey]] as IEnzyme)
      }
    }

    if (item.binName && binMap.hasOwnProperty(item.binName) && binMap[item.binName] !== undefined) {
        item.bin = binMap[item.binName] as IBin
    }

    item.enzymes = newEnzymes
    item.importRecord = importRecord
    itemList.push(item)
  })
  let samplePromises: Promise<ISample[]>[] = []
  while (itemList.length > 0) {
    try {
      await connection.getRepository('sample').save([...itemList.splice(0, 500)])
    } catch (e) {
      if (enzymeFileSaved.id && taxonomyFileSaved.id && importRecord.id) {
        await revertImport(importRecord.id, [enzymeFileSaved.id, taxonomyFileSaved.id], connection)
      }
      return e
    }
  }
  await Promise.all(samplePromises)
  itemList = []
}

const saveTaxonomy = async (taxonomyMap: ITaxonomyAssociativeArray, connection: Connection, parent?: ITaxonomy) => {
  await Promise.all(Object.keys(taxonomyMap).map(async (key: string) => {
    let exists: number
    if (parent) {
      exists = await connection.getRepository('taxonomy').createQueryBuilder('taxonomy')
                                .select('taxonomy.id')
                                .where('taxonomy.name = :taxonomyName', {taxonomyName: taxonomyMap[key].name})
                                .andWhere('taxonomy.order = :order', {order: taxonomyMap[key].order})
                                .andWhere('taxonomy.parentId = :parentId', {parentId: parent.id})
                                .getCount()
      if (exists) {
        let taxonomyId: Taxonomy = await connection.getRepository('taxonomy').createQueryBuilder('taxonomy')
                                                    .select('taxonomy.id')
                                                    .where('taxonomy.name = :taxonomyName', {taxonomyName: taxonomyMap[key].name})
                                                    .andWhere('taxonomy.order = :order', {order: taxonomyMap[key].order})
                                                    .andWhere('taxonomy.parentId = :parentId', {parentId: parent.id})
                                                    .getOne() as Taxonomy
        taxonomyMap[key].id = taxonomyId.id
      } else {
        taxonomyMap[key].parent = parent.id
        console.log(taxonomyMap[key])
        taxonomyMap[key] = await connection.getRepository('taxonomy').save(taxonomyMap[key]) as ITaxonomy
      }
    } else {
      exists = await connection.getRepository('taxonomy').createQueryBuilder('taxonomy')
                                .select('taxonomy.id')
                                .where('taxonomy.name = :taxonomyName', {taxonomyName: taxonomyMap[key].name})
                                .andWhere('taxonomy.order = :order', {order: taxonomyMap[key].order})
                                .getCount()
      if (exists) {
        let taxonomyId: Taxonomy = await connection.getRepository('taxonomy').createQueryBuilder('taxonomy')
                                            .select('taxonomy.id')
                                            .where('taxonomy.name = :taxonomyName', {taxonomyName: taxonomyMap[key].name})
                                            .andWhere('taxonomy.order = :order', {order: taxonomyMap[key].order})
                                            .getOne() as Taxonomy
        taxonomyMap[key].id = taxonomyId.id
      } else {
        console.log(taxonomyMap[key])
        taxonomyMap[key] = await connection.getRepository('taxonomy').save(taxonomyMap[key]) as ITaxonomy
      }
    }
    if (taxonomyMap[key].id && taxonomyMap[key].children) {
      await saveTaxonomyChildren(taxonomyMap[key].children, connection, taxonomyMap[key])
    }
  }))
}

export const saveTaxonomyChildren = async (taxonomyMap: ITaxonomyAssociativeArray, connection: Connection, parent: ITaxonomy) => {
  let existsArray: string[] = []
  await Promise.all(Object.keys(taxonomyMap).map(async (key: string) => {
    let exists: number = await connection.getRepository('taxonomy').createQueryBuilder('taxonomy')
      .select('taxonomy.id')
      .where('taxonomy.name = :taxonomyName', {taxonomyName: taxonomyMap[key].name})
      .andWhere('taxonomy.order = :order', {order: taxonomyMap[key].order})
      .andWhere('taxonomy.parentId = :parentId', {parentId: parent.id})
      .getCount()
    if (exists) {
      existsArray.push(key)
    }
  }))
  if (existsArray.length) {
    let order: number = parent.order + 1
    let query: Taxonomy[] = await connection.getRepository('taxonomy').createQueryBuilder('taxonomy')
      .select(['taxonomy.id', 'taxonomy.name'])
      .where('taxonomy.name IN (:...taxonomyNames)', {taxonomyNames: existsArray})
      .andWhere('taxonomy.order = :order', {order})
      .andWhere('taxonomy.parentId = :parentId', {parentId: parent.id})
      .getMany() as Taxonomy[]
    query.forEach((value: Taxonomy) => {
      taxonomyMap[value.name] = {...taxonomyMap[value.name], id: value.id}
    })
  }
  let newTaxonomies: string[] = Object.keys(taxonomyMap).filter(key => !existsArray.includes(key))
  if (newTaxonomies.length) {
    let saved = await connection.getRepository('taxonomy').save(newTaxonomies.map(
                                                            value => {return {...taxonomyMap[value], parent: parent.id}})) as ITaxonomy[]
    saved.forEach(value => taxonomyMap[value.name].id = value.id)
  }
  return Promise.all(Object.keys(taxonomyMap).map(async (key: string) => {
    await saveTaxonomyChildren(taxonomyMap[key].children, connection, taxonomyMap[key])
  }))
}

const revertImport = async (recordId: number, importFiles: number[], connection: Connection) => {
  await deleteImportFiles(importFiles, connection)
  await deleteSamples(recordId, connection)
  await deleteRecord(recordId, connection)
}

const deleteImportFiles = async (importFiles: number[], connection: Connection) => {
  await connection.getRepository('import_file').createQueryBuilder('import_file')
    .where('id in (:...importFiles)', {importFiles})
    .getMany()
  return connection.getRepository('import_file').createQueryBuilder('import_file').delete()
                   .where('id in (:...importFiles)', {importFiles})
                   .execute()
}

const deleteSamples = (recordId: number, connection: Connection) => {
  return connection.getRepository('sample').createQueryBuilder('sample').delete()
                   .where('sample.importRecordId = :recordId', {recordId})
                   .execute()
}

const deleteRecord = (recordId: number, connection: Connection) => {
  return connection.getRepository('import_record').createQueryBuilder('import_record').delete()
                   .where('id = :recordId', {recordId})
                   .execute()
}
