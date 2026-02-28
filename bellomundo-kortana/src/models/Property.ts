import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
    title: string;
    description: string;
    propertyType: 'apartment' | 'villa' | 'studio' | 'penthouse' | 'commercial';
    listingType: 'rent' | 'sale' | 'both';
    owner: string;
    ownershipTxHash?: string;
    address: {
        district: string;
        building: string;
        unit: string;
        gpsCoords?: { lat: number; lng: number };
    };
    pricePerMonth?: number; // DNR
    salePrice?: number; // DNR
    bedrooms?: number;
    bathrooms?: number;
    areaSqm?: number;
    floor?: number;
    totalFloors?: number;
    furnished: boolean;
    amenities: string[];
    images: { url: string; isPrimary: boolean; order: number }[];
    virtualTourUrl?: string;
    availability: {
        isAvailable: boolean;
        availableFrom?: Date;
    };
    ratings: { average: number; count: number };
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PropertySchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    propertyType: {
        type: String,
        enum: ['apartment', 'villa', 'studio', 'penthouse', 'commercial'],
        required: true
    },
    listingType: {
        type: String,
        enum: ['rent', 'sale', 'both'],
        required: true
    },
    owner: { type: String, required: true, index: true },
    ownershipTxHash: { type: String },
    address: {
        district: { type: String, required: true },
        building: { type: String, required: true },
        unit: { type: String, required: true },
        gpsCoords: { lat: { type: Number }, lng: { type: Number } }
    },
    pricePerMonth: { type: Number },
    salePrice: { type: Number },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    areaSqm: { type: Number },
    floor: { type: Number },
    totalFloors: { type: Number },
    furnished: { type: Boolean, default: false },
    amenities: [{ type: String }],
    images: [{
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        order: { type: Number, default: 0 }
    }],
    virtualTourUrl: { type: String },
    availability: {
        isAvailable: { type: Boolean, default: true },
        availableFrom: { type: Date }
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
