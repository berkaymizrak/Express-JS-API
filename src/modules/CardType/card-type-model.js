import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const cardTypeSchema = new Schema({
    name: { type: String, required: true },
    icon: String,
    base_url: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const CardTypes = mongoose.model('CardTypes', cardTypeSchema);
export default CardTypes;
