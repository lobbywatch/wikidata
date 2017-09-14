const wikidata = require('./wikidata.json').results.bindings
const lobbywatch = require('./lobbywatch.json').data.parliamentarians
const parlament = require('./parlament.json')

const wikidataIndex = wikidata.reduce(
  (index, item) => {
    if (item.Swiss_parliament_ID) {
      index[item.Swiss_parliament_ID.value] = item
    }
    return index
  },
  {}
)

// console.log(wikidataIndex)

lobbywatch.forEach(mp => {
  const wikidataMp = wikidataIndex[mp.parliamentId]
  if (wikidataMp) {
    console.log('matched', mp.name, mp.id, wikidataMp.human.value)
  } else {
    console.log('missed', mp.name)
  }
})
