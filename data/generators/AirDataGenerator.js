function GenerateTemperature(){
    return GenerateRandomNumber(20, 26);
}

function GenerateHumidity(){
    return GenerateRandomNumber(38,62);
}

function GenerateNi(){
    return GenerateRandomNumber(77.5,78.7);
}
function GenerateO2(){
    return GenerateRandomNumber(19.2,21);
}
function GenerateCO2(){
    return GenerateRandomNumber(0.03,0.09);
}
function GeneratePM10(){
    return GenerateRandomNumber(0.005,0.05);
}
function GeneratePM2_5(){
    return GenerateRandomNumber(0.005,0.05);
}

function GenerateRandomNumber(max, min) {    
    return (Math.random() * (max - min) + min).toFixed(5);      
}

module.exports = {
    GenerateTemperature : GenerateTemperature,
    GenerateHumidity : GenerateHumidity,
    GenerateNi : GenerateNi,
    GenerateRandomNumber : GenerateRandomNumber,
    GenerateO2: GenerateO2,
    GenerateCO2: GenerateCO2,
    GeneratePM10: GeneratePM10,
    GeneratePM2_5: GeneratePM2_5 
};