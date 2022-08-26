import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CardTypeSchema = new Schema({
    name: { type: String, required: true },
    icon: String,
    base_url: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const CardType = mongoose.model('CardType', CardTypeSchema);
export default CardType;
