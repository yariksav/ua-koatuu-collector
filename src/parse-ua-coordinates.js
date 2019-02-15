const csv = require('csvtojson')
const translit = require('./translit.js')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const states = {
  1: 'Черкаська',
  2: 'Чернігівська',
  3: 'Чернівецька',
  4: 'Дніпропетровська',
  5: 'Донецька',
  6: 'Івано-Франківська',
  7: 'Харківська',
  8: 'Херсонська',
  9: 'Хмельницька',
  10: 'Кіровоградська',
  11: 'Автономна Республіка Крим',
  12: 'Київ',
  13: 'Київська',
  14: 'Луганська',
  15: 'Львівська',
  16: 'Миколаївська',
  17: 'Одеська',
  18: 'Полтавська',
  19: 'Рівненська',
  20: 'Севастополь',
  21: 'Сумська',
  22: 'Тернопільська',
  23: 'Вінницька',
  24: 'Волинська',
  25: 'Закарпатська',
  26: 'Запорізька',
  27: 'Житомирська'
}

const suffixes = {
  'івка': 'овка',
  'ськ': 'ск',
  'ове': 'ово',
  'ове': 'ова',
  'ськe': 'ское',
  'ине': 'ино',
  'іне': 'іно'
}
const suffixesKeys = Object.keys(suffixes)
const prefixes = {
  'Велика ': 'Великая ',
  'Великі ': 'Великие ',
  'Мала ': 'Малая '
}
const prefixesKeys = Object.keys(prefixes)

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
    ]
  });

  let result = []
  let counts = {
    success: 0,
    notfound: 0
  }
  let nativeData = await csv({
    delimiter: ';'
  })
  .fromFile(config.source)

  let latinData = await csv({
    delimiter: ';'
  })
  .fromFile(config.sourceCoords)

  for(let item of nativeData) {
    item.Country = 'ua'
    let name = item.Region

    let names = [name]
    suffixesKeys.forEach(item => {
      if (name.endsWith(item)) {
        names.push(name.replace(item, suffixes[item]))
      }
    })
    prefixesKeys.forEach(item => {
      if (name.startsWith(item)) {
        names.push(name.replace(item, prefixes[item]))
      }
    })
    if (name.indexOf("'") >= 0) {
      names.push(name.replace("'", '"'))
    }

    let translites = []
    names.forEach(name => {
      translites.push(translit(name).toLowerCase().replace(/\-/g, ''))
      translites.push(translit(name, 'ru').toLowerCase().replace(/\-/g, ''))
    })

    item.Latin = translit(name)

    stateCode = getKeyByValue(states, item.State)

    let regions = latinData.filter(item => {
      return translites.indexOf(item.Slug) >= 0 && +item.StateCode === +stateCode
    })

    if (regions && regions.length) {
      item.Latitude = +regions.find(region => region.Latitude).Latitude
      item.Longitude = +regions.find(region => region.Longitude).Longitude
      item.Population = +((regions.find(region => region.Population) || {}).Population || 0)
      counts.success++
    } else {
      counts.notfound++
    }

    result.push(item)
  }
  console.log(counts)
  await csvWriter.writeRecords(result)
}

process({
  source: './dist/koatuu-parsed.csv',
  sourceCoords: './data/coordinates-ua.csv',
  destination: './dist/koatuu-parsed-coords.csv'
})