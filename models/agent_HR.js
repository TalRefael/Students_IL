const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agent_HRSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    job_name:{
        type:String,
    },
    mail:{
        type:String,
    },
    mailhr:{
        type:String,
    },
    detail:{
        type:String,
    }
  

   
}, { timestamps: true });

const agent_HR = mongoose.model('agent_HR', agent_HRSchema);

module.exports = agent_HR;