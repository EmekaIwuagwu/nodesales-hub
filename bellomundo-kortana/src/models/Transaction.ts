import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    txHash: string;
    blockNumber?: number;
    status: 'pending' | 'confirmed' | 'failed';
    paymentType: string;
    payer: string;
    recipient: string;
    amount: string; // wei
    amountDNR: number;
    networkFee?: string; // wei
    referenceId?: string;
    serviceId?: mongoose.Types.ObjectId;
    serviceType?: string;
    description: string;
    receiptUrl?: string;
    confirmedAt?: Date;
    createdAt: Date;
    metadata?: any;
}

const TransactionSchema: Schema = new Schema({
    txHash: { type: String, required: true, unique: true, index: true },
    blockNumber: { type: Number },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    },
    paymentType: { type: String, required: true },
    payer: { type: String, required: true, index: true },
    recipient: { type: String, required: true },
    amount: { type: String, required: true }, // BigInt as string
    amountDNR: { type: Number, required: true },
    networkFee: { type: String },
    referenceId: { type: String },
    serviceId: { type: Schema.Types.ObjectId },
    serviceType: { type: String },
    description: { type: String, required: true },
    receiptUrl: { type: String },
    confirmedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed }
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
