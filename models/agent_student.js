const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agent_studentSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    mail:{
        type:String,
    },
    mailstudent:{
        type:String,
    },
    job:{
        type:String,
    },

   
}, { timestamps: true });

const agent_student = mongoose.model('agent_student', agent_studentSchema);

module.exports = agent_student;