import mongoose, { Schema, Document } from 'mongoose';

export interface IUtilityBill extends Document {
    residentWallet: string;
    propertyId: mongoose.Types.ObjectId;
    utilityType: 'electricity' | 'water' | 'internet' | 'gas' | 'waste' | 'heating';
    billingPeriodStart: Date;
    billingPeriodEnd: Date;
    dueDate: Date;
    amountDNR: number;
    usageData: {
        unit: string;
        currentReading: number;
        previousReading?: number;
        consumed: number;
    };
    status: 'unpaid' | 'paid' | 'overdue' | 'disputed';
    paymentTxHash?: string;
    paidAt?: Date;
    createdAt: Date;
}

const UtilityBillSchema: Schema = new Schema({
    residentWallet: { type: String, required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    utilityType: {
        type: String,
        enum: ['electricity', 'water', 'internet', 'gas', 'waste', 'heating'],
        required: true
    },
    billingPeriodStart: { type: Date, required: true },
    billingPeriodEnd: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    amountDNR: { type: Number, required: true },
    usageData: {
        unit: { type: String, required: true },
        currentReading: { type: Number },
        previousReading: { type: Number },
        consumed: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['unpaid', 'paid', 'overdue', 'disputed'],
        default: 'unpaid'
    },
    paymentTxHash: { type: String },
    paidAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.UtilityBill || mongoose.model<IUtilityBill>('UtilityBill', UtilityBillSchema);
