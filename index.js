var koa    = require('koa');
var router = require('koa-router');
var bodyParser = require('koa-body-parser');
var Q      = require('q');
var nconf  = require('nconf');
var Persist = require('./persist');

nconf.argv().env().file(__dirname + '/config.json')

var persist = new Persist(nconf.get('persist'));

var app = koa();

app.use(bodyParser());
app.use(router(app));

app.get('/Latest_plane_crash', function *(next) {
    yield persist.read('Latest_plane_crash')
        .then(function (res) {
            this.body = res;
        }.bind(this))
        .fail(function (reason) {
            this.status = 404;
            this.body = "couldn't retrieve article";
        });
});

app.post('/Latest_plane_crash', function *(next) {
    var fullRequestBody = this.request.body;
        requestBody = Object.keys(fullRequestBody)[0];
    if(!requestBody) {
        this.status = 404;
        this.body = "refusing to save empty article...";
        return;
    }
    yield persist.write('Latest_plane_crash', requestBody)
        .then(function (res) {
            this.body = "OK";
        }.bind(this))
        .fail(function (reason) {
            this.status = 404;
            this.body = "couldn't save article";
        });
});

app.listen(3000);
