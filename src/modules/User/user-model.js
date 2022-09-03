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

userSchema.methods.hashPassword = async function (password) {
    return await bcryptjs
        .genSalt(10)
        .then(async salt => {
            return await bcryptjs
                .hash(password, salt)
                .then(hash => {
                    return {
                        status: 200,
                        success: true,
                        mes: 'Password hashed successfully',
                        data: hash,
                    };
                })
                .catch(err => {
                    return { mes: 'Error hashing password', err };
                });
        })
        .catch(err => {
            return { mes: 'Error hashing password', err };
        });
};

userSchema.pre('save', async function (next) {
    if (this.isModified('email') || this.isNew) {
        this.email = this.email.toLowerCase();
    }
    if (this.isModified('password') || this.isNew) {
        await this.hashPassword(this.password)
            .then(data => {
                if (data.success) {
                    this.password = data.data;
                }
            })
            .catch(err => {
                return next({ mes: 'Error saving password', err });
            });
    }
    return next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
    if (this._update.email) {
        this._update.email = this._update.email.toLowerCase();
    }
    if (this._update.password) {
        await this.schema.methods
            .hashPassword(this._update.password)
            .then(data => {
                if (data.success) {
                    this._update.password = data.data;
                }
            })
            .catch(err => {
                return next({ mes: 'Error saving password', err });
            });
    }
    return next();
});

userSchema.methods.comparePassword = function (password, callback) {
    bcryptjs.compare(password, this.password, (err, isMatch) => {
        if (err) return callback(err);
        return callback(null, isMatch);
    });
};

const users = mongoose.model('users', userSchema);
export default users;
