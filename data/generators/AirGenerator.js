const AirDataGenerator = require("./AirDataGenerator.js");

function GenerateAir(date) {
    return {
        temperature: AirDataGenerator.GenerateTemperature(),
        humidity: AirDataGenerator.GenerateHumidity(),
        ni: AirDataGenerator.GenerateNi(),
        o2: AirDataGenerator.GenerateO2(),
        co2: AirDataGenerator.GenerateCO2(),
        pm10: AirDataGenerator.GeneratePM10(),
        pm2_5: AirDataGenerator.GeneratePM2_5(),
        date: date
    };
}
function GenerateAirArray() {
    let array = [];
    let day = 1;
    for (let index = 0; index < 3652; index++) { // 3652 == 5 years
        array[index] = GenerateAir(new Date(2010, 0, day++, 0, 0, 0, 0));                 
    }
    return array;
}

module.exports = {
    GenerateAirArray: GenerateAirArray,
    GenerateAir: GenerateAir
};