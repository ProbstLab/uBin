
import * as fs from "fs"
import {Sample} from '../db/entities/Sample'
import {Taxonomy} from '../db/entities/Taxonomy'
import {Bin} from '../db/entities/Bin'
import {IValueMap} from "common"
import {Connection} from 'typeorm'
import {getSamplesWithScaffoldQuery} from '../controllers/database/queries'

export const exportData = (exportDir: string, exportName: string, taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>,
                           recordId: number, connection: Connection): Promise<any> => {
  let headers: string = ['scaffold', 'GC', 'coverage', 'length', 'taxonomy', 'Bin'].join('\t')

  return new Promise((resolve, reject) => {
    let addSlash: string = exportDir.endsWith('/') ? '' : '/'
    getSamplesWithScaffoldQuery(connection, recordId).then((data: Sample[]) => {
      let wstream = fs.createWriteStream(exportDir + addSlash + exportName + '.csv')
      wstream.on('finish', () => {
        resolve(true)
      })
      wstream.on('error', err => {
        reject(err)
      })
      wstream.write(headers + '\n')
      for (let i: number = 0; i < data.length; i++) {
        let taxonomyNames: string[] = []
        let sample: Sample = data[i]
        sample.taxonomiesRelationString.split(';').slice(1, -1).forEach((key: string) => {
          taxonomyNames.push(taxonomies[key].name)
        })
        wstream.write([sample.scaffold, sample.gc.toString(), sample.coverage.toString(), sample.length.toString(), taxonomyNames.join(';'),
          sample.bin && sample.bin.id ? bins[sample.bin.id].name : ''].join('\t') + '\n')
      }
      wstream.end()
    })
  })
}