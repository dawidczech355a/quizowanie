import mongoose from 'mongoose';

export interface UserInterface {
  _id: string;
  login: string;
  password: string;
  gameIds: string[];
}

export default new mongoose.Schema<UserInterface>({
  login: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gameIds: {
    type: [String],
    required: true
  }
});
