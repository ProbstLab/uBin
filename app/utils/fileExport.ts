
import * as fs from 'fs'
import {Sample} from '../db/entities/Sample'
import {Taxonomy} from '../db/entities/Taxonomy'
import {Bin} from '../db/entities/Bin'
import {IValueMap} from 'common'
import {Connection} from 'typeorm'
import {getSamplesWithScaffoldQuery, getSamplesWithScaffoldForBinQuery} from '../controllers/database/queries'
import {IFastaDict} from '../typings/fasta'
import {IImportRecord} from '../controllers/samples'

export const exportData = (exportDir: string, exportName: string, taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>,
                           activeRecord: IImportRecord, connection: Connection, fastaDict?: IFastaDict): Promise<any> => {
  let headers: string = ['scaffold', 'GC', 'coverage', 'length', 'taxonomy', 'Bin'].join('\t')

  return new Promise((resolve, reject) => {
    let addSlash: string = exportDir.endsWith('/') ? '' : '/'
    const recordId = activeRecord.id
    getSamplesWithScaffoldQuery(connection, recordId).then((data: Sample[]) => {
      let promises = [writeExportFile(data, taxonomies, bins, exportDir + addSlash + exportName, headers)]
      fastaDict ? promises.push(writeFastaFiles(bins, fastaDict, exportDir + addSlash, recordId, exportName, connection)) : undefined
      Promise.all(promises).then(resolve).catch(reject)
    })
  })
}

const writeExportFile = (samples: Sample[], taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>,
                         filePath: string, headers: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    let wstream = fs.createWriteStream(filePath + '.tsv')
    wstream.on('finish', () => {
      resolve(true)
    })
    wstream.on('error', err => {
      reject(err)
    })
    wstream.write(headers + '\n')
    for (let i: number = 0; i < samples.length; i++) {
      let taxonomyNames: string[] = []
      let sample: Sample = samples[i]
      sample.taxonomiesRelationString.split(';').slice(1, -1).forEach((key: string) => {
        taxonomyNames.push(taxonomies[key].name)
      })
      wstream.write([sample.scaffold, sample.gc.toString(), sample.coverage.toString(), sample.length.toString(), taxonomyNames.join(';'),
        sample.bin && sample.bin.id ? bins[sample.bin.id].name : ''].join('\t') + '\n')
    }
    wstream.end()
  })
}

const writeFastaFiles = (bins: IValueMap<Bin>, fastaDict: IFastaDict, filePath: string,
                         recordId: number, exportName: string, connection: Connection): Promise<any> => {
  let promises = []
  let binKeys = Object.keys(bins)
  for (let i=0; i < binKeys.length; i++) {
    let bin = bins[binKeys[i]]
    promises.push(new Promise((resolve, reject) => {
      getSamplesWithScaffoldForBinQuery(connection, recordId, bin.id).then((samples: Sample[]) => {
        const fastaFilePath = filePath + exportName + '_curated/'
        return new Promise((resolve, reject) => {
          if (!fs.existsSync(fastaFilePath)) {
            fs.mkdirSync(fastaFilePath)
          }
          let wstream = fs.createWriteStream(fastaFilePath + bin.name + '.fasta')
          wstream.on('finish', () => {
            resolve()
          })
          wstream.on('error', err => {
            reject(err)
          })
          for (let j = 0; j < samples.length; j++) {
            let fastaItem = fastaDict[samples[i].scaffold]
            if (fastaItem) {
              wstream.write('>' + fastaItem.originalKey + '\n' + fastaItem.content)
            }
          }
          wstream.end()
        })
      }).then(resolve).catch(reject)
    }))
  }
  return Promise.all(promises)
}
