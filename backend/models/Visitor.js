import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
    visitorId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    ip: {
        type: String,
        required: false
    },
    lastVisit: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
