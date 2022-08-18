const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardTypeSchema = new Schema({
    name: {type: String, required: true},
    icon: String,
    base_url: String,
    active: {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('CardType', CardTypeSchema);
