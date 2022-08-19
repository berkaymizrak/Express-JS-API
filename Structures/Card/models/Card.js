const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardSchema = new Schema({
    name: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    card_type_id: { type: Schema.Types.ObjectId, ref: 'CardType' },
    url_path: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Card', CardSchema);
