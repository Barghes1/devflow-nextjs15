import { model, models, Schema, Types } from "mongoose";

export interface IAccount {
  userId: Types.ObjectId; // Reference to the User model
  name: string;
  image?: string;
  password?: string;
  provider: string; // e.g., "google", "facebook", etc.
  providerAccountId: string;
}

const AccountSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    image: { type: String },
    password: { type: String },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
  },
  { timestamps: true }
);

const Account = models?.account || model<IAccount>("Account", AccountSchema);

export default Account;
