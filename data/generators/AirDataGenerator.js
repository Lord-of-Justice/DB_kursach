// function GenerateTemperature(){
//     return GenerateRandomNumber(20, 26);
// }

// function GenerateHumidity(){
//     return GenerateRandomNumber(38,62);
// }

function GenerateNi(){
    return GenerateRandomNumber(77.3,79);
}
function GenerateO2(){
    return GenerateRandomNumber(19,21.2);
}
function GenerateCO2(){
    return GenerateRandomNumber(0.02,0.11);
}
function GeneratePM(k, humidity) {  
    let eps = 0.02;    
    if(humidity < 80 && humidity > 30 && +GenerateRandomNumber(-1, 40) < 0)
        eps *= 5;
    return +k / +humidity + +GenerateRandomNumber(-eps, eps);
}
function GeneratePM10(humidity) {  
    return GeneratePM(15, humidity);
}
function GeneratePM2_5(humidity){
    return GeneratePM(9.25, humidity);
}

function GenerateRandomNumber(max, min) {    
    return (Math.random() * (max - min) + min).toFixed(5);      
}

module.exports = {
    // GenerateTemperature : GenerateTemperature,
    // GenerateHumidity : GenerateHumidity,
    GenerateNi : GenerateNi,
    GenerateRandomNumber : GenerateRandomNumber,
    GenerateO2: GenerateO2,
    GenerateCO2: GenerateCO2,
    GeneratePM10: GeneratePM10,
    GeneratePM2_5: GeneratePM2_5 
};