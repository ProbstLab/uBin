import { createSelector } from 'reselect'

import { ISamplesState } from './interfaces'

import { IClientState } from '..'
// import {IEnzyme} from '../../utils/interfaces'8
import {Enzyme} from '../../db/entities/Enzyme'

const getSamplesState = (state: IClientState) => state.samples

export const getImportRecords = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.importRecords
)

export const getTaxonomyTreeFull = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.taxonomyTreeFull ? Object.keys(state.taxonomyTreeFull).map(value => state.taxonomyTreeFull ? state.taxonomyTreeFull[value] : null) : undefined
)

export const getBacterialEnzymeDistributionForChart = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.enzymeDistribution ?
    state.enzymeDistribution.filter(value => value.bacterial)
      .map((value: Enzyme) => {return {name: value.name, amount: value.sampleCount, id: value.id}}) : []
)
export const getArchaealEnzymeDistributionForChart = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.enzymeDistribution ?
    state.enzymeDistribution.filter(value => value.archaeal)
      .map((value: Enzyme) => {return {name: value.name, amount: value.sampleCount, id: value.id}}) : []
)

export const getSamples = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.samples ? state.samples.map((value: any) => {
    let length: number = value.length/4000
    value.size = length > 3 ? length : 3
    return value
  }) : []
)
