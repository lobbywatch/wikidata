const fetch = require('node-fetch')
const fs = require('fs')
const wdk = require('wikidata-sdk')
const { createApolloFetch } = require('apollo-fetch')

// fetch('http://ws-old.parlament.ch/councillors/basicdetails', {
//   headers: {
//     'Accept': 'text/json'
//   }
// })
//   .then(response => response.json())
//   .then(json => fs.writeFileSync(
//     'parlament.json',
//     JSON.stringify(json, null, 2),
//     'utf8'
//   ))

const sleep = ms => new Promise(resolve => {
  setTimeout(resolve, ms)
})

const getHistoric = async (page = 1, prev = []) => {
  console.log('fetch historic', page, prev.length)

  await sleep(200)

  return fetch(
    `http://ws-old.parlament.ch/councillors/historic?pageNumber=${page}`,
    {
      headers: {
        'Accept': 'text/json'
      }
    }
  )
    .then(response => response.json())
    .then(json => prev.concat(json))
    .then(json => json[json.length - 1].hasMorePages
      ? getHistoric(page + 1, json)
      : json
    )
}

// getHistoric()
//   .then(json => fs.writeFileSync(
//     'parlamentHistoric.json',
//     JSON.stringify(json, null, 2),
//     'utf8'
//   ))

// const apolloFetch = createApolloFetch({
//   uri: 'https://lobbywatch.ch/graphql'
// })

// apolloFetch({
//   query: `
//     {
//       parliamentarians(locale: de) {
//         id
//         name
//         parliamentId
//         council
//       }
//     }
//   `
// })
//   .then(response => fs.writeFileSync(
//     'lobbywatch.json',
//     JSON.stringify(response, null, 2),
//     'utf8'
//   ))

// const nationalCouncil = 'Q18510612'
// const councilOfStates = 'Q18510613'
// const federalAssembly = 'Q18515554'

// fetch(wdk.sparqlQuery(`
// SELECT DISTINCT ?human ?parliamentId ?humanLabel
// WHERE {
//   {
//     {?human wdt:P39 wd:${nationalCouncil}.}
//     UNION {?human wdt:P39 wd:${councilOfStates}.}
//     UNION {?human wdt:P39 wd:${federalAssembly}.}

//     SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
//     OPTIONAL { ?human wdt:P1307 ?parliamentId. }
//   }
// }
// ORDER BY ASC(xsd:integer(?parliamentId)) ASC(?humanLabel)
// `))
//   .then(response => response.json())
//   .then(json => fs.writeFileSync(
//     'wikidata.json',
//     JSON.stringify(json, null, 2),
//     'utf8'
//   ))

fetch(wdk.sparqlQuery(`
SELECT ?human ?parliamentId ?humanLabel ?positionHeld
WHERE {
  {
    ?human wdt:P1307 ?parliamentId.

    SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
    OPTIONAL { ?human wdt:P39 ?positionHeld. }
  }
}
ORDER BY ASC(xsd:integer(?parliamentId)) ASC(?humanLabel)
`))
  .then(response => response.json())
  .then(json => fs.writeFileSync(
    'wikidata.json',
    JSON.stringify(json, null, 2),
    'utf8'
  ))
