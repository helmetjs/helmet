var helmet = require('..')

var connect = require('connect')
var request = require('supertest')

describe('helmet() integration test', function () {
  it('sets all default headers', function () {
    var app = connect()
    app.use(helmet())
    app.use(function (req, res) {
      res.end('Hello world!')
    })

    var nonempty = /./
    return request(app).get('/')
      .expect('X-DNS-Prefetch-Control', nonempty)
      .expect('X-Frame-Options', nonempty)
      .expect('Strict-Transport-Security', nonempty)
      .expect('X-Download-Options', nonempty)
      .expect('X-Content-Type-Options', nonempty)
      .expect('X-XSS-Protection', nonempty)
  })
})
