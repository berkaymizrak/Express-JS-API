import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    cardTypeId: { type: Schema.Types.ObjectId, ref: 'cardTypes' },
    urlPath: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const cards = mongoose.model('cards', cardSchema);
export default cards;
