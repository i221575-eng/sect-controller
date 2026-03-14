import mongoose from 'mongoose';
const { Schema } = mongoose;

const PolicySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        required: true
    },
    ids: {
        type: [String],
    },
    resourceIds: {
        type: [String],
    }
})

export const Policy = mongoose.models.Policy || mongoose.model('Policy', PolicySchema);

