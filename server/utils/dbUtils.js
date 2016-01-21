'use strict'

module.exports.connectCallback = (err) => {
  if (err) {
    console.error('Database connect error: ', err)
    process.exit(-1)
  }
}
