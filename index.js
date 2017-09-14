const fetch = require('node-fetch')
const wdk = require('wikidata-sdk')
const fs = require('fs')

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
`
const url = wdk.sparqlQuery(sparql)

fetch(url)
  .then(response => response.json())
  .then(json => fs.writeFileSync(
    'wikidata.json',
    JSON.stringify(json, null, 2),
    'utf8'
  ))
