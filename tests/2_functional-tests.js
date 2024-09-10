const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    /* 
    Viewing one stock: GET request to /api/stock-prices/
    Viewing one stock and liking it: GET request to /api/stock-prices/
    Viewing the same stock and liking it again: GET request to /api/stock-prices/
    Viewing two stocks: GET request to /api/stock-prices/
    Viewing two stocks and liking them: GET request to /api/stock-prices/
    */

    // Viewing one stock
    test('GET /api/stock-prices 1', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG' })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'likes');
            done();
        });
    });

    // Viewing one stock and liking it
    test('GET /api/stock-prices 2', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: 'true' })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'likes');
            assert.equal(res.body.stockData[0].likes, 1);
            done();
        });
    });

    // Viewing the same stock and liking it again
    test('GET /api/stock-prices 3', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: 'true' })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'likes');
            assert.equal(res.body.stockData[0].likes, 1);
            done();
        });
    });

    // Viewing two stocks
    test('GET /api/stock-prices 4', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'] })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData.length, 2);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[1], 'price');
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.property(res.body.stockData[1], 'rel_likes');
            done();
        });
    });

    // Viewing two stocks and liking them
    test('GET /api/stock-prices 5', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'], like: 'true' })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData.length, 2);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[1], 'price');
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.property(res.body.stockData[1], 'rel_likes');
            assert.equal(res.body.stockData[0].rel_likes, 0);
            assert.equal(res.body.stockData[1].rel_likes, 0);
            done();
        });
    });

});
