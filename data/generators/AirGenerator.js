const AirDataGenerator = require("./AirDataGenerator.js");

function GenerateAir(date) {
    const t = AirDataGenerator.GenerateTemperature();
    const h = AirDataGenerator.GenerateHumidity(t);    
    return {
        temperature: t,
        humidity: h,
        ni: AirDataGenerator.GenerateNi(),
        o2: AirDataGenerator.GenerateO2(),
        co2: AirDataGenerator.GenerateCO2(),
        pm10: AirDataGenerator.GeneratePM10(h),
        pm2_5: AirDataGenerator.GeneratePM2_5(h),
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