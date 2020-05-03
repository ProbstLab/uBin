import {Dimension} from 'crossfilter2'
import {compareArrayToString} from './compare'
import { Sample } from '../db/entities/Sample'
import { Taxonomy } from '../db/entities/Taxonomy'
import { IBin } from 'samples'

export function filterBin (dim: Dimension<Sample, number>, bin: IBin, binView: boolean) {
    if (dim) {
        if (bin && binView) {
            dim.filterExact(bin.id)
        } else {
            dim.filterAll()
        }
    }
}

export function filterTaxonomy (dim: Dimension<Sample, string>, selectedTaxonomy: Taxonomy, excludedTaxonomies: Taxonomy[]) {
    if (selectedTaxonomy) {
        let taxonomyString: string = ';'+selectedTaxonomy.id.toString()+';'
        let excludedTaxonomyStrings: string[] = excludedTaxonomies ? excludedTaxonomies.map(excludedTaxonomy => ';'+excludedTaxonomy.id.toString()+';') : []
        if (excludedTaxonomyStrings.length) {
        dim.filterFunction((d: string) => d.indexOf(taxonomyString) >= 0 && !compareArrayToString(d, excludedTaxonomyStrings))
        } else {
        dim.filterFunction((d: string) => d.indexOf(taxonomyString) >= 0)
        }
    } else if (excludedTaxonomies && excludedTaxonomies.length) {
        let excludedTaxonomyStrings: string[] = excludedTaxonomies ? excludedTaxonomies.map(excludedTaxonomy => ';'+excludedTaxonomy.id.toString()+';') : []
        dim.filterFunction((d: string) => !compareArrayToString(d, excludedTaxonomyStrings))
    } else {
        dim.filterAll()
    }
}

export function filterRange (dim: Dimension<Sample, number>, range: [number, number]) {
    if (range) {
        dim.filterRange(range)
    } else {
        dim.filterAll()
    }
}