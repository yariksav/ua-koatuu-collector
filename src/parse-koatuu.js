const csv = require('csvtojson')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const regionTypes = {
  'С': 'village', // - С — село;
  'Щ': 'settlement',// - Щ — селище;
  'Т': 'urban_village',// - Т — селище міського типу;
  'М': 'city',// - М — місто;
  'Р': 'district' // - Р — район міста.
}

const skipStates = ['01', '85']

statesKeys = Object.values

function ucFirstAllWords(str, separator) {
  var pieces = str.split(separator);
  for ( var i = 0; i < pieces.length; i++ ) {
      var j = pieces[i].charAt(0).toUpperCase()
      pieces[i] = j + pieces[i].substr(1).toLowerCase()
  }
  return pieces.join(separator)
}

function removeSlash (str) {
  if (str.indexOf('/') >= 0) {
    return str.slice(0, str.indexOf('/'))
  }
  return str
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
        {id: 'RegionType', title: 'RegionType'},
    ]
  });

  let result = []
  let counts = {
    success: 0,
    notfound: 0
  }

  let koatuuData = await csv({
    delimiter: ';'
  })
  .fromFile(config.source)

  let states = {}
  let districts = {}

  for(let item of koatuuData) {
    let code = item.TE
    let type = item.NP
    let name = item.NU
    name = name.indexOf('-') >= 0 ? ucFirstAllWords(name, '-') : ucFirstAllWords(name, ' ')
    let codeFirst = code.substr(0, 5)
    let codeLast = code.substr(5, 5)

    if (skipStates.indexOf(code.slice(0, 2)) >= 0) {
      continue
    }

    if (codeLast === '00000') {
      switch (code[2]) {
        case '0':
          if (name.startsWith('М.')) {
            name = ucFirstAllWords(name.replace('М.', ''))
            type = 'М'
          }
          states[code.slice(0, 2)] = removeSlash(name).replace(/ область/ig, '')
          break;
        case '1':
          if (code[4] !== '0') {
            districts[codeFirst] = name
          }
          break;
        case '2': 
          districts[codeFirst] = removeSlash(name).replace(/ район/ig, '')
          break;
      }
    }
    if (!type && code[2] === '1' && code[4] !== '0' && codeLast === '00000') {
      type = 'М'
    }

    if (type && type !== 'Р') {
      result.push({
        Country: 'ua',
        State: states[code.slice(0, 2)],
        District: districts[codeFirst] !== name ? districts[codeFirst] : undefined,
        Region: name,
        RegionType: regionTypes[type],
        Code: code
      })
    }
  }
  await csvWriter.writeRecords(result)
}

process({
  source: './data/koatuu.csv',
  destination: './dist/koatuu-parsed.csv'
})