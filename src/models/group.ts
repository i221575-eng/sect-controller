import mongoose from 'mongoose';
const { Schema } = mongoose;

const groupSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
})

export const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
