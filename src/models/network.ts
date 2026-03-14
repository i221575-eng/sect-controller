import mongoose from 'mongoose';
const { Schema } = mongoose;

const networkSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    }
})

export const Network = (mongoose.models.Network || mongoose.model('Network', networkSchema)) as mongoose.Model<any>;
