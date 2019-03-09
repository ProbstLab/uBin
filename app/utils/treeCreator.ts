import {IGenericAssociativeArray, ITaxonomy, ITaxonomyAssociativeArray, ITaxonomyForSunburst} from "./interfaces";
import * as colorConvert from 'color-convert'
import {KeyValueCreator} from './keyValueCreator'

export class TreeCreator {
  static createTree = (queries: any[]): IGenericAssociativeArray => {
    console.log("queries[1]", queries[1])
    const sampleCountArray: IGenericAssociativeArray = KeyValueCreator.createKeyValueObject(queries[1], 'taxonomy_id', 'sampleCount')
    console.log("sampleCountArray", sampleCountArray)
    delete queries[1]
    let query: any[] = queries[0]
    let tree: IGenericAssociativeArray = {}
    // Iteration through all taxnomy relation (lowest level)
    console.log("step 1")
    query.forEach((value: ITaxonomy, index: number) => {
      if (value.parent) {
        let rootTaxonomy: ITaxonomy = TreeCreator.findRoot(value.parent as ITaxonomy, {
          id: value.id,
          name: value.name,
          order: value.order,
          children: {},
          occurrences: value.id ? sampleCountArray[value.id] : 1
        } as ITaxonomy)
        // console.log(rootTaxonomy)
        TreeCreator.addToTree(tree, rootTaxonomy)
      }
    })
    console.log("step 2")
    Object.keys(tree).forEach((value: string) => {
      const hexVal: string = TreeCreator.setColour(tree[value])
      tree[value] = TreeCreator.treeToSunburstFormat(tree[value], hexVal)
      tree[value].hex = hexVal
    })
    console.log("step 3 - return")
    return tree
  }

  // Finding "root" of taxonomy recursively. Basically just looking up parents and then adding children to it
  static findRoot = (taxonomy: ITaxonomy, child: ITaxonomy): ITaxonomy => {
    if (child.id) {
      taxonomy.children = {}
      taxonomy.children[child.id] = child
      taxonomy.occurrences = child.occurrences
    }
    if (taxonomy.parent) {
      let taxonomyParent: ITaxonomy = {...taxonomy.parent as ITaxonomy}
      delete taxonomy.parent
      taxonomyParent.occurrences = child.occurrences
      taxonomy = TreeCreator.findRoot(taxonomyParent, taxonomy)
    }
    return taxonomy
  }

  // Adding children to their parents in proper tree structure. If node exists, add child, otherwise create node and add child
  static addToTree = (tree: ITaxonomyAssociativeArray, taxonomy: ITaxonomy) => {
    if (taxonomy.id) {
      if (!tree.hasOwnProperty(taxonomy.id)) {
        tree[taxonomy.id] = taxonomy
      } else if (taxonomy.children) {
        let occurrences: number | undefined = taxonomy.occurrences
        tree[taxonomy.id].occurrences = (occurrences || 1) + (tree[taxonomy.id].occurrences || 0)
        tree[taxonomy.id] = TreeCreator.addToTaxonomy(tree[taxonomy.id], taxonomy)
      }
    }
  }

  // If it has children, add them recursively
  static addToTaxonomy = (treeTaxonomy: ITaxonomy, taxonomy: ITaxonomy): ITaxonomy => {
    if (taxonomy.children) {
      let taxonomyKey: string = Object.keys(taxonomy.children)[0]
      if (treeTaxonomy.children.hasOwnProperty(taxonomyKey)) {
        let occurrences: number | undefined = treeTaxonomy.children[taxonomyKey].occurrences
        treeTaxonomy.children[taxonomyKey].occurrences = (occurrences || 1) + 1
        TreeCreator.addToTaxonomy(treeTaxonomy.children[taxonomyKey], taxonomy.children[taxonomyKey])
      } else {
        treeTaxonomy.children[taxonomyKey] = taxonomy.children[taxonomyKey]
      }
    }
    return treeTaxonomy
  }

  // Generating colours
  static treeToSunburstFormat = (taxonomy: ITaxonomy, hex?: string): ITaxonomyForSunburst => {
    let children: ITaxonomyForSunburst[] = []
    let numChildren: number = Object.keys(taxonomy.children).length
    Object.keys(taxonomy.children).forEach((value: string, index: number) => {
      const hexVal: string = TreeCreator.setColour(taxonomy.children[value], hex, index/(numChildren**2)+0.5)
      taxonomy.children[value] = TreeCreator.treeToSunburstFormat(taxonomy.children[value], hexVal)
      taxonomy.children[value].hex = hexVal
      children.push(taxonomy.children[value])
    })
    return {id: taxonomy.id, name: taxonomy.name, children, value: taxonomy.occurrences || 1, order: taxonomy.order}
  }

  static setColour = (taxonomy: ITaxonomy, hex?: string, step?: number): string => {
    switch (taxonomy.order) {
      case (0):
        switch (taxonomy.name) {
          case 'Bacteria':
            return '#009EE3'
          case 'Archaea':
            return '#FF7711'
          case 'Viruses':
            return '#98443A'
          case 'Eukaryota':
            return '#77C654'
          case 'unclassified':
            return '#B2ADA5'
          default:
            return '#5055e5'
        }
      case (1):
        switch (taxonomy.name) {
          case 'Firmicutes':
            return '#90C252'
          case 'Proteobacteria':
            return '#724942'
          case 'Bacteriodetes':
            return '#8C3F2D'
          case 'Ignavibacteriae':
            return '#009EE3'
          case 'Planctomycetes':
            return '#FCCB7C'
          case 'Cyanobacteria':
            return '#B0VV76'
          case 'ecological_metagenomes':
          case 'environmental_samples':
          case 'metagenomes':
            return '#B2ADA5'
          case 'Chloroflexi':
            return '#9B443A'
          case 'Actinobacteria':
            return '#4F3366'
          case 'Acidobacteria':
            return '#B5BF4F'
          case 'Spirochetes':
            return '#BF1933'
          case 'Omnitrophica':
            return '#54AFAD'
          case 'Altiarchaeota':
            return '#FFE814'
          case 'Euryarchaeota':
            return '#CC4284'
          case 'Crenarchaeota':
            return '#B2563F'
          case 'Taumarchaeota':
            return '#5F3F00'
          default:
            break
        }
        break
      case (2):
        switch (taxonomy.name) {
          case 'Gammaproteobacteria':
            return '#024F84'
          case 'Alphaproteobacteria':
            return '#C6E57A'
          case 'Betaproteobacteria':
            return '#81CFFD'
          case 'Deltaprotobacteria':
            return '#9B1C30'
          case 'Epsilonproteobacteria':
            return '#F39100'
          default:
            break
        }
        break
    }
    let newHex: string = ''
    if (hex) {
      let hsl: [number, number, number] = colorConvert.hex.hsl(hex)
      hsl[0] += 10
      if (!step) {
        hsl[1] = hsl[1] >= 60 ? hsl[1] - 8 : hsl[1] + 8
        hsl[2] += 6
      } else {
        hsl[1] = step*70
        hsl[2] += 10*step
      }
      newHex = colorConvert.hsl.hex(hsl)
    }
    return newHex
  }
}