import { createSelector } from 'reselect'
import * as _ from 'lodash'

import { IValueMap } from 'common'
import { ISampleFilter, ISample } from 'samples'

import { ISamplesState } from './interfaces'

import { IClientState } from '..'
// import {IEnzyme} from '../../utils/interfaces'8
import {Enzyme} from '../../db/entities/Enzyme'

const getSamplesState = (state: IClientState) => state.samples

const getSamplesMap = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.samples,
)

const getSamplesFilter = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.filter,
)

const getSamplesAsArray = createSelector(
  getSamplesMap,
  (samples: IValueMap<ISample>) => Object.keys(samples).map(id => samples[id]),
)

export const getFilteredSamples = createSelector(
  getSamplesAsArray,
  getSamplesFilter,
  (samples: ISample[], filter: ISampleFilter) =>
    samples.filter(r => filter.taxonomy.every(taxonomy => _.includes(r.taxonomy, taxonomy))),
)

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
    state.enzymeDistribution.map((value: Enzyme) => {return {x: value.name, y: value.sampleCount, id: value.id}}) : []
)
export const getArchaealEnzymeDistributionForChart = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.enzymeDistribution ?
    state.enzymeDistribution.filter(value => value.archaeal).map((value: Enzyme) => {return {x: value.name, y: value.sampleCount, id: value.id}}) : []
)
