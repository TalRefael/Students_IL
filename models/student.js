const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    secondname: {
        type: String,
        required: true
    },
    id_number: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    security: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fileupload: {
        type: Buffer,
        required: true
    },
    favjobs: {
        type: Array
    },
    domain:{
        type:String
    },
    search:{
        type:String
    },
    city:{
        type:String
    },
    Job_selection:{
        type:String
    }
}, { timestamps: true });

const Student = mongoose.model('student', studentSchema);

module.exports = Student;