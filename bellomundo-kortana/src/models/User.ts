import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    walletAddress: string;
    displayName?: string;
    email?: string;
    profileImage?: string;
    kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
    kycDocuments: {
        type: string;
        ipfsHash: string;
        submittedAt: Date;
    }[];
    eResidencyCardId?: mongoose.Types.ObjectId;
    notificationPreferences: {
        email: boolean;
        push: boolean;
        paymentConfirmations: boolean;
        upcomingBills: boolean;
        billsDue: number;
    };
    autoPaySchedules: {
        serviceType: string;
        serviceId: mongoose.Types.ObjectId;
        enabled: boolean;
        dayOfMonth: number;
        maxAmount: number;
    }[];
    onboardingCompleted: boolean;
    lastLoginAt: Date;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    walletAddress: { type: String, required: true, unique: true, index: true },
    displayName: { type: String },
    email: { type: String },
    profileImage: { type: String },
    kycStatus: {
        type: String,
        enum: ['none', 'pending', 'verified', 'rejected'],
        default: 'none'
    },
    kycDocuments: [{
        type: { type: String },
        ipfsHash: { type: String },
        submittedAt: { type: Date, default: Date.now }
    }],
    eResidencyCardId: { type: Schema.Types.ObjectId, ref: 'EResidencyCard' },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        paymentConfirmations: { type: Boolean, default: true },
        upcomingBills: { type: Boolean, default: true },
        billsDue: { type: Number, default: 3 }
    },
    autoPaySchedules: [{
        serviceType: { type: String },
        serviceId: { type: Schema.Types.ObjectId },
        enabled: { type: Boolean, default: false },
        dayOfMonth: { type: Number },
        maxAmount: { type: Number }
    }],
    onboardingCompleted: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
