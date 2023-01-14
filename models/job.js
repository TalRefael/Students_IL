const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    detail:{
        type:String,
    },
    requirements:{
        type:String,
    },
    location:{
        type:String,
    },
    domain:{
        type:String,
    },
    scope:{
        type:String,
    },
    email:{
        type:String,
    },
    job_number:{
        type:String,
    },
}, { timestamps: true });

const job = mongoose.model('job', jobSchema);

module.exports = job;