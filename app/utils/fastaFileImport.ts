import * as fs from 'fs'
import * as _ from 'lodash'
import * as split2 from 'split2'
import {IFastaDict} from '../typings/fasta'

export const importFastaFile = async (file: string) => {
  let readStream = fs.createReadStream(file)
  let fastaDict: IFastaDict = {}
  await new Promise((resolve, reject) => readStream
    .pipe(split2('>'))
    .on('data', (data: any) => {
      let splitData: string[] = data.replace(/\n/, '_split').split('_split')
      let scaffoldName = splitData[0].trim().split(' ')[0].split('\t')[0]
      if (scaffoldName) {
        fastaDict[scaffoldName] = {content: splitData[1], originalKey: splitData[0]}
      }
    }).on('finish', resolve)
  )
  return fastaDict
}
