import * as fs from "fs";
import {
  ISample,
  IDynamicAssociativeArray,
  IImportFile,
  IImportRecord,
  IEnzyme,
  ITaxonomy,
  IdValuePair,
  ITaxonomyAssociativeArray,
} from "./interfaces"
import * as csv from 'csv-parser'
import {Connection, InsertResult} from "typeorm"
import {IFile} from "files";
import * as _ from 'lodash'
import {Taxonomy} from '../db/entities/Taxonomy'

export const importFiles = async (addedFiles: IFile[], connection: Connection) => {
  const taxonomyFile: IFile = addedFiles[0]
  const enzymeFile: IFile = addedFiles[1]
  let taxonomyMap: ITaxonomyAssociativeArray = {}
  let enzymeMap: IDynamicAssociativeArray = {}
  let sampleMap: IDynamicAssociativeArray = {}
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
          enzymeKeys: []
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
        sampleMap[data.scaffold] = sample
      }).on('end', () => {
      let enzymeList: string[]
      fs.createReadStream(enzymeFile.filePath)
        .pipe(csv({separator: ','}))
        .on('headers', (headers: string[]) => {
          headers.shift();
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
          await saveSamples(enzymeFile, taxonomyFile, connection, enzymeList, enzymeMap, taxonomyMap, sampleMap)
          resolve(true)
      })
    })
  })
}

const saveSamples = async (enzymeFile: IFile, taxonomyFile: IFile, connection: Connection, enzymeList: string[],
                     enzymeMap: IDynamicAssociativeArray, taxonomyMap: ITaxonomyAssociativeArray, sampleMap: IDynamicAssociativeArray) => {
  let t0 = performance.now();

  let enzymeFileSaved = await connection.getRepository('import_file').save({ name: enzymeFile.filePath }) as IImportFile
  let taxonomyFileSaved = await connection.getRepository('import_file').save({ name: taxonomyFile.filePath }) as IImportFile
  let importRecord: IImportRecord = {
    name: 'Import_'+Date.now().toString(),
    files: [enzymeFileSaved, taxonomyFileSaved]
  }
  await connection.getRepository('import_record').save(importRecord)
  await Promise.all(enzymeList.map(async (value: string, index: number) => {
    let exists = await connection.getRepository('enzyme')
      .count({where: {name: value }})
    if (exists) {
      enzymeMap[value] = await connection.getRepository('enzyme')
        .findOne({where: {name: value }}) as IEnzyme
    } else {
      enzymeMap[value] = await connection.getRepository('enzyme').save({ name: value, archaeal: index <= 50, bacterial: index > 50 } ) as IEnzyme
    }
  }))
  console.log("map before:", {...taxonomyMap})
  await saveTaxonomy(taxonomyMap, connection)
  console.log("map after:", taxonomyMap)
  let itemList: ISample[] = []
  await Promise.all(Object.keys(sampleMap).map(async (key: string) => {
    let item = sampleMap[key] as ISample
    let exists = await connection.getRepository('sample').count({where: {scaffold: item.scaffold}})
    if (!exists) {
      let newTaxonomies: IdValuePair = {}
      let newEnzymes: IEnzyme[] = []
      let taxonomyPath: string[] = []
      let keyNum: number = item.taxonomyKeys.length
      for (let taxonomyKey of item.taxonomyKeys) {
        keyNum--
        taxonomyPath.push(taxonomyKey)
        if (!keyNum){
          let taxonomy = _.get(taxonomyMap, taxonomyPath) as ITaxonomy
          try {
            if (taxonomy.id) {
              newTaxonomies = {id: taxonomy.id}
            }
          } catch (e) {
          }
        }
        taxonomyPath.push('children')
      }
      for (let enzymeKey of item.enzymeKeys.map((e: number, i: number) => e === 1 ? i : 0).filter((x: number) => x > 0)) {
        newEnzymes.push(enzymeMap[enzymeList[enzymeKey]] as IEnzyme)
      }
      item.taxonomy = newTaxonomies
      item.enzymes = newEnzymes
      item.importRecord = importRecord
      // await connection.getRepository('sample').save(item).catch(reason => console.log("!!!!!! BROKE !!11", reason))
      itemList.push(item)
      // console.log("itemList", itemList.length, itemList.length >= 100)
      // if (itemList.length >= 100) {
      //   console.log("save", itemList.length)
      //   await connection.getRepository('sample').save([...itemList]).catch(reason => console.log("!!!!!! BROKE !!11", reason))
      //   itemList = []
      // }
    }
  }))
  let samplePromises: Promise<InsertResult>[] = []
  while (itemList.length >= 100) {
    samplePromises.push(connection.createQueryBuilder().insert().into('sample').values([...itemList.splice(0, 100)]).execute())
    // await connection.getRepository('sample').save([...itemList.splice(0, 1000)]).catch(reason => console.log("!!!!!! BROKE !!11", reason))
  }
  await Promise.all(samplePromises)
  if (itemList.length){
    await connection.getRepository('sample').save([...itemList]).catch(reason => console.log("!!!!!! BROKE !!11", reason))
    itemList = []
  }
  var t1 = performance.now()
  console.log("finished")
  console.log("import took " + (t1 - t0) + " milliseconds.");
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
      console.log("exists:", exists)
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
        taxonomyMap[key] = await connection.getRepository('taxonomy').save(taxonomyMap[key]) as ITaxonomy
      }
    }
    if (taxonomyMap[key].id && taxonomyMap[key].children) {
      await saveTaxonomyChildren(taxonomyMap[key].children, connection, taxonomyMap[key])
      // return saveTaxonomy(taxonomyMap[key].children, connection, taxonomyMap[key])
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