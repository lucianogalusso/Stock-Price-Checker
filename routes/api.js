'use strict';

const axios = require('axios');
const mongoose = require('mongoose');

module.exports = function (app) {

  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const Schema = mongoose.Schema;

  const symbolSchema = new Schema({
    symbol: { type: String, required: true },
    likes: { type: Number, default: 0 }
  });

  const SYMBOL = mongoose.model("Symbol", symbolSchema);

  const ipSchema = new Schema({
    symbolId: { type: Schema.Types.ObjectId, ref: 'Symbol', required: true },
    ip: { type: String, required: true }
  });

  const IPDB = mongoose.model("Ip", ipSchema);

  app.route('/api/stock-prices')
    .get(function (req, res) {
      const stocks = [].concat(req.query.stock);
      let like = req.query.like;
      const ip = req.ip;

      if (like === undefined || like === 'false')
        like = false;

      if (stocks.length > 2)
        return res.json({ error: 'More than 2 stocks not allowed' });

      // Mapeamos las promesas para cada stock
      const stockPromises = stocks.map(stock => 
        axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
          .then(response => {
            let price = response.data.latestPrice;
            let symbolLikes = null;

            // Ver si se quiere poner un like
            if (like != false) {
              return IPDB.find({ ip: ip }).populate('symbolId')
                .then(ips => {
                  if (!ips || ips.length == 0 || (ips.length == 1 && ips[0].symbolId.symbol != stock)) {
                    //puede likear 2 veces el mismo?
                    return SYMBOL.findOneAndUpdate({ symbol: stock}, { $inc: { likes: 1 } }, { upsert: true, new: true })
                      .then(symbol => {
                        // Agregar la IP como usada
                        let newIp = new IPDB({
                          symbolId: symbol._id,
                          ip: ip
                        });
                        return newIp.save()
                          .then(() => {
                            symbolLikes = symbol.likes;
                            return { stock: stock, price: price, likes: symbolLikes };
                          });
                      });
                  } else {
                    return SYMBOL.findOne({ symbol: stock })
                      .then(symbol => {
                        if (!symbol) {
                          // Si no existe, lo insertamos
                          let newSymbol = new SYMBOL({
                            symbol: stock,
                            likes: 0
                          });
                          newSymbol.save();
                        }
                        return { stock: stock, price: price, likes: symbol ? symbol.likes : 0 };
                      });
                  }
                });
            } else {
              return SYMBOL.findOne({ symbol: stock })
                .then(symbol => {
                  if (!symbol) {
                    // Si no existe, lo insertamos
                    let newSymbol = new SYMBOL({
                      symbol: stock,
                      likes: 0
                    });
                    newSymbol.save();
                  }
                  return { stock: stock, price: price, likes: symbol ? symbol.likes : 0 };
                });
            }
          })
          .catch(error => ({ error: `Error fetching data for ${stock}, ${error}` }))
      );

      // Usamos Promise.all para esperar a que todas las promesas se resuelvan
      Promise.all(stockPromises)
        .then(stockDataAll => {
          let returnArr = [];
          if (stockDataAll && stockDataAll.length == 1)
            returnArr = stockDataAll[0];
          else if (stockDataAll && stockDataAll.length > 1) {
            let likesA = stockDataAll[0].likes;
            let likesB = stockDataAll[1].likes;
            let diffA = likesA-likesB;
            let diffB = likesB-likesA;
            returnArr = [
              {
                stock: stockDataAll[0].stock,
                price: stockDataAll[0].price,
                rel_likes : diffA
              },
              {
                stock: stockDataAll[1].stock,
                price: stockDataAll[1].price,
                rel_likes : diffB
              }
            ];
          } 
            
          return res.json({ stockData: returnArr });
        })
        .catch(error => {
          return res.json({ error: 'Error fetching stock data' });
        });
    });
    
};
