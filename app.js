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
app.get("/airaverage/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let averageO2 = d3.mean(airs, d => d.o2);
      let averageCO2 = d3.mean(airs, d => d.co2);
      let averageNi = d3.mean(airs, d => d.ni);
      let data = [
        {
          'name': 'CO2',
          'amount': averageCO2 * 5
        },
        {
          'name': 'O2',
          'amount': averageO2 
        },
        {
          'name': 'N',
          'amount': averageNi 
        }];
      res.json(data);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
app.get("/airaverage", (req, res) => {
  res.render('airAverage');
});

app.get("/pmVsHum/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let humidity = [];
      for (let i = 0; i < airs.length; ++i) {
        let item = airs[i];
        let pollution = (item.pm10 + item.pm2_5); 
        humidity.push([pollution, item.humidity]);
      }
      res.json(humidity);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
app.get("/pmVsHum", (req, res) => {
  res.render('pmVsHum');
});

app.get("/pollution/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let year = new Date(2018, 12, 0, 30, 0, 0, 0);
      let lastYear = airs.filter(d => d.date > year);
      let pollution = [];
      for (let i = 0; i < lastYear.length; ++i) {
        let item = lastYear[i];
        pollution.push([item.date, item.pm10, item.pm2_5]);
      }
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

app.get("/tempandhum/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let year = new Date(2018, 12, 0, 30, 0, 0, 0);
      let lastYear = airs.filter(d => d.date > year);
      let pollution = [];
      for (let i = 0; i < lastYear.length; ++i) {
        let item = lastYear[i];
        pollution.push([item.date, item.temperature, item.humidity]);
      }
      res.json(pollution);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
app.get("/tempandhum", (req, res) => {
  res.render('tempAndHum');
});

app.get("/pmaverage/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let averagePm10 = d3.mean(airs, d => d.pm10);
      let averagePm25 = d3.mean(airs, d => d.pm2_5);
      let data = [
        {
          'name': 'pm10',
          'amount': averagePm10
        },
        {
          'name': 'pm2_5',
          'amount': averagePm25 
        }];
      res.json(data);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
app.get("/pmaverage", (req, res) => {
  res.render('pmAverage');
});

app.get("/aircomposition/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let year = new Date(2018, 12, 0, 30, 0, 0, 0);
      let lastYear = airs.filter(d => d.date > year);
      let air = [];
      for (let i = 0; i < lastYear.length; ++i) {
        let item = lastYear[i];
        air.push([item.date, item.co2, item.o2, item.ni]);
      }
      res.json(air);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
app.get("/aircomposition", (req, res) => {
  res.render('airComposition');
});

app.get("/humidity/data", (req, res) => {
  air.getAll()
    .then(airs => {      
      let humAndTemp = [];
      for (let i = 0; i < airs.length; ++i) {
        let item = airs[i];
        humAndTemp.push([item.temperature, item.humidity]);
      }
      let humidity = [];
      humidity.push([20, d3.mean(humAndTemp.filter(d => d[0] >= 20 && d[0] < 21), d => d[1]) ]);
      humidity.push([21, d3.mean(humAndTemp.filter(d => d[0] >= 21 && d[0] < 22), d => d[1])]);
      humidity.push([22, d3.mean(humAndTemp.filter(d => d[0] >= 22 && d[0] < 23), d => d[1])]);
      humidity.push([23, d3.mean(humAndTemp.filter(d => d[0] >= 23 && d[0] < 24), d => d[1])]);
      humidity.push([24, d3.mean(humAndTemp.filter(d => d[0] >= 24 && d[0] < 25), d => d[1])]);
      humidity.push([25, d3.mean(humAndTemp.filter(d => d[0] >= 25), d => d[1])]);
      humidity.unshift(["temp", "hum"]);
      res.json(humidity);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
app.get("/humidity", (req, res) => {
  res.render('humidity');
});

app.listen(config.ServerPort, () => console.log(`listening on port ${config.ServerPort}`));