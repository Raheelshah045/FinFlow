import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

const accountSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // username link for simplicity
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    balance: { type: Number, default: 0 }
});
export const Account = mongoose.model('Account', accountSchema);

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    unit: { type: String, default: 'pcs' }
});
export const Product = mongoose.model('Product', productSchema);

const partySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true }, // vendor, customer
    email: String,
    phone: String,
    address: String,
    balance: { type: Number, default: 0 }
});
export const Party = mongoose.model('Party', partySchema);

const voucherSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    id: { type: String, required: true },
    type: { type: String, required: true }, // purchase, sale, journal
    date: { type: String, required: true },
    party: String,
    paymentMode: String,
    total: { type: Number, required: true },
    status: { type: String, default: 'posted' },
    items: Array,
    entries: Array,
    margin: Number
});
export const Voucher = mongoose.model('Voucher', voucherSchema);
