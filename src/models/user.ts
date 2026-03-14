import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String, // "admin" | "user"
        required: true
    },
    image: {
        type: String, // URL to image
    },
    groups: {
        type: [String], // Array of group ids
        default: []
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    },
    ip: {
        type: String,
        required: true,
        unique: true,
    },
    accessToken: {
        type: String,
    },
    refreshToken: {
        type: String,
    }
})

export const User = mongoose.models.User || mongoose.model('User', userSchema);
