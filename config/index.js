const fileName = process.env.EVN_FILE_NAME || 'local'
console.log('===fileName', fileName)
const config = {
  default: Object.assign({}, require('./common'), require(`./${fileName}`)),
}

module.exports = config
