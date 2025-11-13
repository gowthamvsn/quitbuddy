// src/lib/mongodb.ts
import { MongoClient, Db, Collection } from 'mongodb';

const uri = import.meta.env.VITE_MONGO_URI;
if (!uri) throw new Error('Add VITE_MONGO_URI=mongodb+srv://... to .env');

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect().then(() => {
    console.log('MongoDB Atlas connected');
    return client;
  });
}

export const getDB = async (): Promise<Db> => {
  const c = await clientPromise;
  return c.db('quitbuddy');
};

export const getUsers = async (): Promise<Collection> => (await getDB()).collection('users');
export const getConversations = async (): Promise<Collection> => (await getDB()).collection('conversations');
export const getProfiles = async (): Promise<Collection> => (await getDB()).collection('user_profiles');