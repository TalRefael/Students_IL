const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hrSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    secondname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    companyname: {
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
}, { timestamps: true });

const hr = mongoose.model('hr', hrSchema);

module.exports = hr;