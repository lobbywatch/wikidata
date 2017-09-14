const fetch = require('node-fetch')
const wdk = require('wikidata-sdk')

require('dotenv').config()


const config = {
  username: process.env.WIKI_USER,
  password: process.env.WIKI_PASS,
  verbose: false
}
const wdEdit = require('wikidata-edit')(config)

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
    fetch(wdk.searchEntities({
      search: mp.name,
      limit: 3
    }))
      .then(response => response.json())
      .then(json => {
        console.log('Missed', mp.name, mp.parliamentId)
        if (json.success) {
          // console.log('Wikidata Search', json.search.length)
          // console.log(json.search)
          const result = json.search[0]
          if (
            json.search.length === 1
          ) {
            if (result.description === 'Swiss politician') {
              console.log('- auto match', result.label, mp.name)
              console.log('-', result.id, 'P1307', mp.parliamentId)
              wdEdit.claim.add(result.id, 'P1307', mp.parliamentId)
            } else {
              console.log('- needs manual check')
            }
          } else {
            console.log('- multi match')
          }
        } else {
          console.log('- no match')
        }
      })
  }
})
