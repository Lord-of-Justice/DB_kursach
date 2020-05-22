function ValidateAirConstituents(items){
    return items.filter(item =>  +item.ni + +item.o2 + +item.co2 < 100);        
};

module.exports = {
    ValidateAirConstituents: ValidateAirConstituents
};
