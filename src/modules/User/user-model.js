import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import bcryptjs from 'bcryptjs';
import { defaultPPKey, defaultPPPath } from '../../config.js';

// validate: {
//     validator: function (el) {
//         return el === this.password;
//     },
//     message: "Passwords don't match.",
// }

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        minLength: 3,
        maxLength: 200,
        unique: true,
        dropDups: true,
    },
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, dropDups: true },
    password: { type: String, required: [true, 'Password is required'], minLength: 6, maxLength: 200 },
    profilePictureLocation: { type: String, default: defaultPPPath },
    profilePictureKey: { type: String, default: defaultPPKey },
    role: {
        type: String,
        enum: ['admin', 'member'],
        required: true,
        default: 'member',
    },
    // phone: String,
    // address: String,
    // city: String,
    // state: String,
    // zip: String,
    // country: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

userSchema.methods.isProfilePictureDefault = function (profilePictureKey) {
    return profilePictureKey === defaultPPKey;
};

userSchema.methods.isAdmin = function (role) {
    return role === 'admin';
};

userSchema.methods.hashPassword = async function (password) {
    return await bcryptjs
        .genSalt(10)
        .then(async salt => {
            return await bcryptjs.hash(password, salt).then(hash => {
                return {
                    status: 200,
                    success: true,
                    mes: 'Password hashed successfully',
                    data: hash,
                };
            });
        })
        .catch(error => {
            return { mes: 'Error hashing password', error };
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
            .catch(error => {
                return next(error);
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
            .catch(error => {
                return next(error);
            });
    }
    return next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcryptjs
        .compare(password, this.password)
        .then(isMatch => {
            if (isMatch) {
                return { status: 200, success: true, mes: 'Password matched' };
            } else {
                return { status: 400, success: false, mes: 'Password did not match' };
            }
        })
        .catch(error => {
            return { status: 500, success: false, error };
        });
};

const users = mongoose.model('users', userSchema);
export default users;
