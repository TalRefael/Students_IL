const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HR_agentSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    subject:{
        type:String,
    },
    content:{
        type:String,
    }
   
}, { timestamps: true });

const HR_agent = mongoose.model('HR_agent', HR_agentSchema);

module.exports = HR_agent;