const fetch = require('node-fetch')
const fs = require('fs')
const wdk = require('wikidata-sdk')
const { createApolloFetch } = require('apollo-fetch')

const url = 'http://ws-old.parlament.ch/councillors/basicdetails'
const headers = {
  'Accept': 'text/json'
}

fetch(url, {headers})
  .then(response => response.json())
  .then(json => fs.writeFileSync(
    'parlament.json',
    JSON.stringify(json, null, 2),
    'utf8'
  ))


const apolloFetch = createApolloFetch({
  uri: 'https://lobbywatch.ch/graphql'
})

apolloFetch({
  query: `
    {
      parliamentarians(locale: de) {
        id
        name
        parliamentId
      }
    }
  `
})
  .then(response => fs.writeFileSync(
    'lobbywatch.json',
    JSON.stringify(response, null, 2),
    'utf8'
  ))


const nationalCouncil = 'Q18510612'
const councilOfStates = 'Q18510613'
const federalAssembly = 'Q18515554'

const sparql = `
SELECT DISTINCT ?human ?Swiss_parliament_ID ?humanLabel
WHERE {  
  {
    {?human wdt:P39 wd:${nationalCouncil}.}
    UNION {?human wdt:P39 wd:${councilOfStates}.}
    UNION {?human wdt:P39 wd:${federalAssembly}.}

    SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
    OPTIONAL { ?human wdt:P1307 ?Swiss_parliament_ID. }
  }
}
ORDER BY ASC(xsd:integer(?Swiss_parliament_ID)) ASC(?humanLabel)
`

fetch(wdk.sparqlQuery(sparql))
  .then(response => response.json())
  .then(json => fs.writeFileSync(
    'wikidata.json',
    JSON.stringify(json, null, 2),
    'utf8'
  ))

