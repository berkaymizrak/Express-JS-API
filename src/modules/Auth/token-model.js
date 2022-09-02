import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // the expiry time in seconds will expire after 1 hour
});

const tokens = mongoose.model('tokens', tokenSchema);
export default tokens;
