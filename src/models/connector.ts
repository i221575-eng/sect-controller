import mongoose from 'mongoose';
const { Schema } = mongoose;

const connectorSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    networkId: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
    },
    refreshToken: {
        type: String,
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
    }
})

export const Connector = mongoose.models.Connector || mongoose.model('Connector', connectorSchema);
