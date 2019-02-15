function makeTranslit(str, lang){
  var chars = {
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'h',
    'ґ': 'g',
    'д': 'd',
    'е': 'e',
    'є': 'ye',
    'ж': 'zh',
    'з': 'z',
    'и': 'y',
    'і': 'i',
    'ї': 'yi',
    'й': 'y',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'х': 'kh',
    'ц': 'ts',
    'ч': 'ch',
    'ш': 'sh',
    'щ': 'shch',
    'ь': '',
    'ю': 'yu',
    'я': 'ya',
    'ы': 'y',
    'ё': 'yo',
    'э': 'е',
    'ъ': '',
    '-': '-',
    ' ': ' '
  }

  const russian = {
    'г': 'g',
    'и': 'i'
  }

  if (lang === 'ru') {
    chars = Object.assign(chars, russian)
  }

  // lower letter
  for (let key of Object.keys(chars)) {
    str = str.replace( new RegExp(key, 'g'), chars[key]);
  }
  // capital letter
  for (let key of Object.keys(chars)) {
    str = str.replace( new RegExp(key.toUpperCase(), 'g'), chars[key].charAt(0).toUpperCase() + chars[key].substring(1));
  }
  return str;
}

module.exports = makeTranslit