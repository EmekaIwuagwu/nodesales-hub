import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
    proposalId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Active', 'Passed', 'Failed', 'Executed'],
        default: 'Active',
    },
    votesYes: {
        type: Number,
        default: 0,
    },
    votesNo: {
        type: Number,
        default: 0,
    },
    voters: [{
        address: String,
        choice: String,
        timestamp: Date
    }],
    timeLeft: {
        type: String,
        required: true,
    },
    proposer: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Proposal || mongoose.model('Proposal', ProposalSchema);
