const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true, minLength: 3, maxLength: 200},
    name: {type: String, required: true},
    surname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    phone: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    active: {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', UserSchema);
