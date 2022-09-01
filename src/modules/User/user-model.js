import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import bcryptjs from 'bcryptjs';

const userSchema = new Schema({
    username: { type: String, required: true, minLength: 3, maxLength: 200, unique: true, dropDups: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, dropDups: true },
    password: { type: String, required: true, minLength: 6, maxLength: 200 },
    phone: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function (next) {
    const user = this;
    if (user.isModified('email') || user.isNew) {
        user.email = user.email.toLowerCase();
    }
    if (user.isModified('password') || user.isNew) {
        bcryptjs.genSalt(10, (err, salt) => {
            if (err) return next(err);
            bcryptjs.hash(user.password, salt, (err, hash) => {
                if (err) return next(err);
                user.password = hash;
            });
        });
    }
    return next();
});

const Users = mongoose.model('Users', userSchema);
export default Users;
