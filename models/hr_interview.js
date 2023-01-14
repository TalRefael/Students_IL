const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const hr_interviewSchema = new mongoose.Schema({
    jobname:{
        type:String,
    },
    name:{
        type:String,
    },
    email:{
        type:String,
    },
  
    address:{
        type:String,
    },
    date:{
        type:String,
    },
    hour:{
        type:String,
    },
    phone:{
        type:String,
    },
    detail:{
        type:String,
    }
  

   
}, { timestamps: true });

const hr_interview = mongoose.model('hr_interview', hr_interviewSchema);

module.exports = hr_interview;