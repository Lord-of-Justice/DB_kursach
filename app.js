"use strict";
const express = require('express');
const app = express();
const air = require("./models/air.js");
const generator = require("./data/generators/AirGenerator.js");
const validator = require("./data/validator.js");
const mongoose = require('mongoose');
const config = require('./config');
const consolidate = require('consolidate');
const path = require('path');

// for analys
let d3 = require("d3");
let _ = require("lodash");

let dbOptions = { useNewUrlParser: true };
if (config.DatabaseUrl.indexOf('replicaSet') > - 1) {
  dbOptions = {
    db: { native_parser: true },
    replset: {
      auto_reconnect: false,
      poolSize: 10,
      socketOptions: {
        keepAlive: 1000,
        connectTimeoutMS: 30000
      }
    },
    server: {
      poolSize: 5,
      socketOptions: {
        keepAlive: 1000,
        connectTimeoutMS: 30000
      }
    }
  };
};
mongoose.connect(config.DatabaseUrl, dbOptions)
  .then(() => console.log("MongoDB connected"))
  .catch(x => console.log("ERROR: MongoDB not connected" + x));

app.engine('html', consolidate.swig);

app.use("/diagrams", express.static(path.join(__dirname, 'diagrams')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.get("/", (req, res) => {
  console.log("Hello");
  const airs = validator.ValidateAirConstituents(generator.GenerateAirArray());
  air.create(airs).then(() => {
    console.log(`Added ${airs.length} items`);
    res.end();
  });

});

app.get("/drop", (req, res) => {
  air.delete().then(() => {
    console.log(`Drop`);
    res.end();
  });
});

app.get("/air", (req, res) => {
  air.getAll()
    .then(airs => {
      let i = 1;
      airs.forEach(air => {
        res.write(`id = ${i}, ${air}\n`);
        i++;
      });
      res.end();
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });

});

// for diagrams
app.get("/aircomposition/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let averageO2 = d3.mean(airs, d => d.o2);
      let averageCO2 = d3.mean(airs, d => d.co2);
      let averageNi = d3.mean(airs, d => d.ni);
      let data = [
        {
          'name': 'CO2',
          'amount': averageCO2 * 10
        },
        {
          'name': 'O2',
          'amount': averageO2 * 10
        },
        {
          'name': 'N',
          'amount': averageNi * 10
        }];
      res.json(data);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
app.get("/aircomposition", (req, res) => {
  res.render('airСomposition');
});

app.get("/humidity/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let humidity = [];
      for (let i = 0; i < airs.length; ++i) {
        let item = airs[i];
        let pollution = (item.pm10 + item.pm2_5)/2; 
        humidity.push([pollution, item.humidity]);
      }
      res.json(humidity);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
app.get("/humidity", (req, res) => {
  res.render('pmVsHum');
});

app.get("/pollution/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let year = new Date(2018, 12, 0, 30, 0, 0, 0);
      console.log(year);
      let lastYear = airs.filter(d => d.date > year);
      let pollution = [];
      for (let i = 0; i < lastYear.length; ++i) {
        let item = lastYear[i];
        pollution.push([item.date, item.pm10, item.pm2_5]);
      }
      console.log(lastYear[0].date);
      res.json(pollution);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
app.get("/pollution", (req, res) => {
  res.render('pollution');
});

app.listen(config.ServerPort, () => console.log(`listening on port ${config.ServerPort}`));