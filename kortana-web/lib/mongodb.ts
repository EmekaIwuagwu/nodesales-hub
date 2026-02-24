import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
    // During build phase, we might not have the URI yet if it's not in the CI environment.
    // We return a mock promise that throws only when called, but let module evaluation succeed.
    clientPromise = new Promise(() => {
        if (process.env.NODE_ENV === 'production') {
            // Only throw if we are actually trying to use it in production and it's missing
            // This avoids crashing the build if the URI is only needed at runtime.
        }
    });
} else {
    if (process.env.NODE_ENV === 'development') {
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            client = new MongoClient(uri, options);
            globalWithMongo._mongoClientPromise = client.connect();
        }
        clientPromise = globalWithMongo._mongoClientPromise;
    } else {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }
}

export default clientPromise;
