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
const fs = require("fs");
const d3 = require("d3");
const Correlation = require('node-correlation');
const Regression = require('regression');
const _ = require("lodash");

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


app.get("/drop", (req, res) => {
  air.delete().then(() => {
    console.log(`Drop`);
    res.end();
  });
});

app.get("/data", (req, res) => {
  fs.readFile("/home/ivan/DB_kursach/posible_data/weather_Kyiv.csv", "utf8", function (error, data) {
    data = d3.csvParse(data);
    let neededData = data.map(obj => {
      const date = new Date(obj.Kyiv_date.slice(0, -6).replace(/\./g, ' ').split(" ").reverse().join('-'));
      const temperature = +obj.T;
      const humidity = +obj.U;
      return [date, temperature, humidity];
    });
    dataForDb = dataForDb.filter(d => d[0] > new Date(2012, 12, 0, 30, 0, 0, 0) && d[0] < new Date(2020, 0, 1, 0, 0, 0, 0));
    let dataForDb = [];
    for (let i = 0; i < neededData.length; i += 2) {
      let item = neededData[i];
      dataForDb.push([item[0], item[1], item[2]]);
    }

    console.log("Hello");
    const airs = validator.ValidateAirConstituents(generator.GenerateAirArray(dataForDb));
    air.create(airs).then(() => {
      console.log(`Added ${airs.length} items`);
      res.end();
    });
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
      const airAverage = addDays(airs);
      let averageO2 = d3.mean(airAverage, d => d.o2);
      let averageCO2 = d3.mean(airAverage, d => d.co2);
      let averageNi = d3.mean(airAverage, d => d.ni);
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

app.get("/pmVsHum/data", async (req, res) => {
  const airs = await air.getAll();
  let humidity = [];
  let data = addDays(airs);
  for (let i = 0; i < data.length; ++i) {
    let item = airs[i];
    let pollution = (item.pm10 + item.pm2_5);
    humidity.push([pollution, item.humidity]);
  }
  res.json(humidity);
});
app.get("/pmVsHum", (req, res) => {
  res.render('pmVsHum');
});

app.get("/pollution/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let data = addDays(airs);
      let year = new Date(2018, 12, 0, 30, 0, 0, 0);
      let lastYear = data.filter(d => d.date > year);
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
      let data = addDays(airs);
      let lastYear = data.filter(d => d.date.getFullYear() > 2018);
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
      let data = addDays(airs);
      let averagePm10 = d3.mean(data, d => d.pm10);
      let averagePm25 = d3.mean(data, d => d.pm2_5);
      let pmAverage = [
        {
          'name': 'pm10',
          'amount': averagePm10
        },
        {
          'name': 'pm2_5',
          'amount': averagePm25
        }];
      res.json(pmAverage);
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
      let data = addDays(airs);
      let year = new Date(2018, 12, 0, 30, 0, 0, 0);
      let lastYear = data.filter(d => d.date > year);
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

// need to delete
app.get("/temperaturethrouhg7years/data", (req, res) => {
  air.getAll()
    .then(airs => {
      let data = addDays(airs);
      let year19 = data.filter(d => d.date.getFullYear() > 2018);
      let year18 = data.filter(d => d.date.getFullYear() > 2017 && d.date.getFullYear() < 2019);
      let year17 = data.filter(d => d.date.getFullYear() > 2016 && d.date.getFullYear() < 2018);
      let year16 = data.filter(d => d.date.getFullYear() > 2015 && d.date.getFullYear() < 2017);
      let year15 = data.filter(d => d.date.getFullYear() > 2014 && d.date.getFullYear() < 2016);
      let year14 = data.filter(d => d.date.getFullYear() > 2013 && d.date.getFullYear() < 2015);
      let year13 = data.filter(d => d.date.getFullYear() > 2012 && d.date.getFullYear() < 2014);
      const yearsStat = [
        getMonthTemperature(year13),
        getMonthTemperature(year14),
        getMonthTemperature(year15),
        getMonthTemperature(year16),
        getMonthTemperature(year17),
        getMonthTemperature(year18),
        getMonthTemperature(year19),
      ];
      res.json(yearsStat);
    })
    .catch(() => {
      res.status(404).write("Not found");
      res.end();
    });
});
function getMonthTemperature(year){
  return d3.nest()
  .key(function (d) { return d.date.getMonth() + 1; })
  .rollup(function (leaves) {
    return d3.mean(leaves, function (d) {
      return d.temperature;
    });
  }).entries(year)
  .map(function (d) {
    return d.value;
  });
}
app.get("/temperaturethrouhg7years", (req, res) => {
  res.render('temperatureThrouhg7Years');
});

app.get("/correlation", async (req, res) => {
  const data = await air.getAll();
  const pollutionArr = data.map(obj => obj.pm10 + obj.pm2_5);
  const humidityArr = data.map(obj => obj.humidity);
  res.write(`${Correlation.calc(humidityArr, pollutionArr)}`);
  res.end();
});

app.get("/regression", async (req, res) => {
  const airs = await air.getAll();
  const data = addDays(airs);
  let reg = [];

  let regLine = await regression(data);
  let min = d3.min(data, d => d.pm10 + d.pm2_5);
  let max = d3.max(data, d => d.pm10 + d.pm2_5);
  let step = (max - min) / data.length;

  for (let i = 0; i < data.length; ++i) {
    let y = regLine.equation[0] * min + regLine.equation[1];
    reg.push([min, y]);
    min += step;
  }
  res.json(reg);
});
async function regression(data) {
  const coordinates = data.map(obj => {
    const pollution = obj.pm10 + obj.pm2_5;
    const humidity = +obj.humidity;
    return [pollution, humidity];
  });
  const result = Regression.linear(coordinates);
  return result;
};

function addDays(air) {
  let newAir = [];
  for (let i = 0; i < air.length; ++i) {
    let item = air[i];
    let nextItem = air[i + 1];
    let temp = 0;
    let hum = 0;
    let o2 = 0;
    let co2 = 0;
    let ni = 0;
    let pm10 = 0;
    let pm2_5 = 0;
    let j = 0;
    while (item.date.getDate() === nextItem.date.getDate()) {
      temp += item.temperature;
      hum += item.humidity;
      ni += item.ni;
      o2 += item.o2;
      co2 += item.co2;
      pm10 += item.pm10;
      pm2_5 += item.pm2_5;
      j++;
      i++;
      if (i >= air.length)
        break;
      nextItem = air[i];
    }
    let obj = {
      date: item.date,
      temperature: temp / j,
      humidity: hum / j,
      ni: ni / j,
      o2: o2 / j,
      co2: co2 / j,
      pm10: pm10 / j,
      pm2_5: pm2_5 / j,
    };
    newAir.push(obj);
  }
  return newAir;
};



app.listen(config.ServerPort, () => console.log(`listening on port ${config.ServerPort}`));