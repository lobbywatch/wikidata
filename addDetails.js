const { nest } = require('d3-collection')
const { ascending } = require('d3-array')
const { timeDay } = require('d3-time')

const wikidata = require('./wikidata.json').results.bindings
const wikidataIndex = wikidata.reduce(
  (index, item) => {
    const parliamentId = item.parliamentId && item.parliamentId.value
    if (parliamentId) {
      const wikidataId = item.human.value.split('/').pop()
      let entry = index[parliamentId]
      if (!entry) {
        entry = index[parliamentId] = {
          id: wikidataId,
          label: item.humanLabel.value,
          positions: []
        }
      }
      if (entry.id !== wikidataId) {
        throw new Error(`multiple wikidata ids for ${parliamentId}`)
      }
      entry.positions.push(item)
    }
    return index
  },
  {}
)

const positionHeld = 'P39'

const nationalCouncil = 'Q18510612'
const councilOfStates = 'Q18510613'
// const federalAssembly = 'Q18515554'
const federalCouncil = 'Q11811941'

const councilWikidataIds = {
  BR: federalCouncil,
  NR: nationalCouncil,
  SR: councilOfStates
}

const startTime = 'P580'
const endTime = 'P582'

const importedFrom = 'S143'
const retrieved = 'S813'
const referenceURL = 'S854'

const parliamentaryServices = 'Q970652'

const parlamentHistoric = require('./parlamentHistoric.json')

const gruppedMembers = nest()
  .key(d => d.id)
  .key(d => d.council.code)
  .entries(parlamentHistoric)

const toQSDay = date =>
  `+${date.toISOString().replace('00.000Z', '00Z')}/11`

gruppedMembers.forEach(({key: mpId, values: councils}) => {
  const mp = councils[0].values[0]

  const wikidataMp = wikidataIndex[mpId]
  if (wikidataMp) {
    // console.log(mp.firstName, mp.lastName, mpId)
    // console.log(wikidataMp.label, wikidataMp.id)

    // if ([mp.firstName, mp.lastName].join(' ') !== wikidataMp.label) {
    //   console.log(mp.firstName, mp.lastName, key)
    //   console.log(wikidataMp.label, wikidataMp.id)
    // }
    // return
  } else {
    return
  }

  // console.log('STATEMENTS')
  councils.forEach(({key, values}) => {
    const council = values[0].council.abbreviation
    // console.log(council)
    const periods = values
      .map(value => [
        new Date(value.membership.entryDate),
        value.membership.leavingDate
          ? new Date(value.membership.leavingDate)
          : null
      ])
      .sort((a, b) => ascending(a[0], b[0]))
      .reduce((all, period) => {
        const last = all[all.length - 1]
        if (last && timeDay.count(last[1], period[0]) < 6) {
          last[1] = period[1]
        } else {
          if (last) {
            // console.log('diff', timeDay.count(last[1], period[0]))
          }
          all.push(period)
        }
        return all
      }, [])

    // console.log(periods)
    periods.forEach(period => {
      const councilId = councilWikidataIds[council]
      if (!councilId) {
        console.warn('missing council', council)
        return
      }
      console.log([
        wikidataMp.id,
        positionHeld,
        councilId,
        startTime,
        toQSDay(period[0]),
        period[1] && endTime,
        period[1] && toQSDay(period[1]),
        importedFrom,
        parliamentaryServices,
        referenceURL,
        `"https://www.parlament.ch/en/biografie?CouncillorId=${mpId}"`,
        retrieved,
        '+2017-09-17T00:00:00Z/11'
      ].filter(Boolean).join('\t'))
    })
  })
})
