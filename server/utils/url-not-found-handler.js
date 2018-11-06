'use strict'

var path = require('path')

module.exports = function () {
  // 4XX - URLs not found
  return function customRaiseUrlNotFoundError (req, res, next) {
    if (/^(.*\..*)/.test(req.path)) {
      res.send(req.originalUrl)
    } else {
      res.sendFile(path.resolve('dist/client/index.html'))
    }
  }
}
