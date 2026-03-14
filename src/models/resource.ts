import mongoose from 'mongoose';
const { Schema } = mongoose;

const resourceSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    alias: {
        type: String,
    },
    networkId: {
        type: String,
        // required: true
    },
    tcpStatus: {
        type: String,
        // required: true
    },
    udpStatus: {
        type: String,
        // required: true
    },
    icmpStatus: {
        type: String,
        // required: true
    },
    tcpPorts: {
        type: [String],
    },
    udpPorts: {
        type: [String],
    }
})

export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);

