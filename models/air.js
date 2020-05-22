const mongoose = require('mongoose');

const airSchema = new mongoose.Schema(
	{
        temperature: {type: Number, required: true},
        humidity: {type: Number, required: true},
        ni: {type: Number, required: true},
        o2: {type: Number, required: true},
        co2: {type: Number, required: true},
        pm10: {type: Number, required: true},
        pm2_5: {type: Number, required: true},
        date: {type: Date, required: true},        
     }
);

const airModel = mongoose.model('air', airSchema);

module.exports = {
    getAll: function() {
        return airModel.find();
    },    
    create: async function(data) { 
        return airModel.insertMany(data);        
    },
    delete: function() {
        return airModel.deleteMany();
    }    
};