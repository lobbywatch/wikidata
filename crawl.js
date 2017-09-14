const fetch = require('node-fetch')
const fs = require('fs')
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
    JSON.stringify(response.data.parliamentarians, null, 2),
    'utf8'
  ))
