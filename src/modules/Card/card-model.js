import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    cardTypeId: { type: Schema.Types.ObjectId, ref: 'CardTypes' },
    urlPath: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Cards = mongoose.model('Cards', cardSchema);
export default Cards;
