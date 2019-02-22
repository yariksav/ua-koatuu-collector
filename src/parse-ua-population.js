const csv = require('csvtojson')

const { uniq } = require('lodash')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const process = async (config = {}) => {

  const csvWriter = createCsvWriter({
    path: config.destination,
    fieldDelimiter: ';',
    header: [ 
      {id: 'Country', title: 'Country'},
      {id: 'Code', title: 'Code'},
      {id: 'State', title: 'State'},
      {id: 'District', title: 'District'},
      {id: 'Region', title: 'Region'},
      {id: 'Latin', title: 'Latin'},
      {id: 'RegionType', title: 'RegionType'},
      {id: 'Latitude', title: 'Latitude'},
      {id: 'Longitude', title: 'Longitude'},
      {id: 'Population', title: 'Population'},
      {id: 'Indexes', title: 'Indexes'},
    ]
  });

  let sourceData = await csv({
    delimiter: ';'
  })
  .fromFile(config.source)

  let populationData = await csv({
    delimiter: ';'
  })
  .fromFile(config.sourcePopulation)

  for(let item of sourceData) {
    let regions = populationData.filter(pitem => {
      return pitem.Region === item.Region &&
        (item.RegionType === 'city') &&
        (pitem.State === item.State || pitem.State === 'м. ' + item.State)
    })

    if (regions.length) {
      item.Population = regions[0].Population
      // console.log(regions[0].Region, regions[0].State, regions[0].Population, item.Population)
    }
  }
  await csvWriter.writeRecords(sourceData)
}

process({
  sourcePopulation: './data/population-ua.csv',
  source: './dist/koatuu-parsed-coords.csv',
  destination: './dist/koatuu-parsed-coords2.csv'
})