const AirDataGenerator = require("./AirDataGenerator.js");

function GenerateAir(data) {
    // const t = AirDataGenerator.GenerateTemperature();
    // const h = AirDataGenerator.GenerateHumidity(t);    
    // return {
    //     temperature: t,
    //     humidity: h,
    //     ni: AirDataGenerator.GenerateNi(),
    //     o2: AirDataGenerator.GenerateO2(),
    //     co2: AirDataGenerator.GenerateCO2(),
    //     pm10: AirDataGenerator.GeneratePM10(h),
    //     pm2_5: AirDataGenerator.GeneratePM2_5(h),
    //     date: date
    // };
    
    const h = data[2];    
    return {
        temperature: data[1],
        humidity: h,
        ni: AirDataGenerator.GenerateNi(),
        o2: AirDataGenerator.GenerateO2(),
        co2: AirDataGenerator.GenerateCO2(),
        pm10: AirDataGenerator.GeneratePM10(h),
        pm2_5: AirDataGenerator.GeneratePM2_5(h),
        date: data[0]
    };
}
function GenerateAirArray(dataFromCsv) {
    // let array = [];
    // let day = 1;
    // for (let index = 0; index < 3652; index++) { // 3652 == 5 years
    //     array[index] = GenerateAir(new Date(2010, 0, day++, 0, 0, 0, 0));                 
    // }
    // return array;
    let array = [];
    for (let index = 0; index < dataFromCsv.length; index++) {
        array[index] = GenerateAir(dataFromCsv[index]);                 
    }
    return array;
}

module.exports = {
    GenerateAirArray: GenerateAirArray,
    GenerateAir: GenerateAir
};