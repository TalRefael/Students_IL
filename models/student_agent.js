const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const student_agentSchema = new mongoose.Schema({
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

const student_agent = mongoose.model('student_agent', student_agentSchema);

module.exports = student_agent;