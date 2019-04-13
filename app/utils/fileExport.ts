
import * as fs from "fs"
import {Sample} from '../db/entities/Sample'
import {Taxonomy} from '../db/entities/Taxonomy'
import {Bin} from '../db/entities/Bin'
import {IValueMap} from "common"

export const exportData = (exportDir: string, exportName: string, data: Sample[], taxonomies: IValueMap<Taxonomy>, bins: IValueMap<Bin>): Promise<any> => {
  let headers: string = ['scaffold', 'GC', 'coverage', 'length', 'taxonomy', 'Bin'].join('\t')
  let rows: string = ''

  for (let i: number = 0; i < data.length; i++) {
    let taxonomyNames: string[] = []
    let sample: Sample = data[i]
    sample.taxonomiesRelationString.split(';').slice(1, -1).forEach((key: string) => {
      taxonomyNames.push(taxonomies[key].name)
    })
    rows += rows + [sample.scaffold, sample.gc.toString(), sample.coverage.toString(), sample.length.toString(), taxonomyNames.join(';'),
                    sample.bin && sample.bin.id ? bins[sample.bin.id] : 'UNKNOWN'].join('\t')+'\n'
  }

  return new Promise(resolve => {
    let addSlash: string = exportDir.endsWith('/') ? '' : '/'
    fs.writeFile(exportDir+addSlash+exportName+'.csv', headers+'\n'+rows, function (err) {
      if (err) {
        resolve(false)
      }
      resolve(true)
    })

  })
}