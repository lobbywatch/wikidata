const wikidata = require('./wikidata.json').results.bindings
const lobbywatch = require('./lobbywatch.json').data.parliamentarians
const parlament = require('./parlament.json')

const wikidataIndex = wikidata.reduce(
  (index, item) => {
    const parliamentId = item.parliamentId && item.parliamentId.value
    if (parliamentId) {
      if (!index[parliamentId]) {
        index[parliamentId] = []
      }
      index[parliamentId].push(item)
    }
    return index
  },
  {}
)

lobbywatch.forEach(mp => {
  const wikidataMp = wikidataIndex[mp.parliamentId]
  if (wikidataMp) {
    // console.log('matched', mp.name, mp.id, wikidataMp[0].human.value)
  } else {
    console.log('missed', mp.name)
  }
})
