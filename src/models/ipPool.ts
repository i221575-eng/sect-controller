import mongoose from 'mongoose';
const { Schema } = mongoose;

const ipPoolSchema = new Schema({
    currentIp: {
        type: String,
        required: true,
        default: '100.64.0.1'
    },
    availableIps: {
        type: [String],
        required: false
    }
})

export const ipPool: mongoose.Model<any> = mongoose.models['IpPool'] || mongoose.model('IpPool', ipPoolSchema);
