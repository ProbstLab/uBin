import {ITaxonomy, ITaxonomyAssociativeArray} from "./interfaces";

export class TreeCreator {
  static createTree = (query: any[]): ITaxonomyAssociativeArray => {
    let tree: ITaxonomyAssociativeArray = {}
    query.forEach((value: ITaxonomy, index: number) => {
      if (value.parent) {
        let rootTaxonomy: ITaxonomy = TreeCreator.findRoot(value.parent as ITaxonomy, {
          id: value.id,
          name: value.name,
          order: value.order,
          children: {}
        } as ITaxonomy)
        TreeCreator.addToTree(tree, rootTaxonomy)
      }
    })
    return tree
  }

  static findRoot = (taxonomy: ITaxonomy, child: ITaxonomy): ITaxonomy => {
    if (child.id) {
      taxonomy.children = {}
      taxonomy.children[child.id] = child
    }
    if (taxonomy.parent) {
      let taxonomyParent: ITaxonomy = {...taxonomy.parent as ITaxonomy}
      delete taxonomy.parent
      taxonomy = TreeCreator.findRoot(taxonomyParent, taxonomy)
    }
    return taxonomy
  }

  static addToTree = (tree: ITaxonomyAssociativeArray, taxonomy: ITaxonomy) => {
    if (taxonomy.id) {
      if (!tree.hasOwnProperty(taxonomy.id)) {
        taxonomy.occurrences = 1
        tree[taxonomy.id] = taxonomy
      } else if (taxonomy.children) {
        let occurrences: number | undefined = tree[taxonomy.id].occurrences
        tree[taxonomy.id].occurrences = (occurrences || 1) + 1
        tree[taxonomy.id] = TreeCreator.addToTaxonomy(tree[taxonomy.id], taxonomy)
      }
    }
  }

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
}