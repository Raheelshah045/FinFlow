import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User, Account, Product, Party, Voucher } from './models.js';
import { INITIAL_ACCOUNTS } from './data/initialData.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- AUTH MIDDLEWARE ---
const authenticate = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'User registration/login required' });
    req.userId = userId;
    next();
};

// --- INITIAL DATA SEEDING (HELPER) ---
const seedUserAccounts = async (username) => {
    const existing = await Account.findOne({ userId: username });
    if (!existing) {
        const freshAccounts = INITIAL_ACCOUNTS.map(a => ({
            ...a,
            userId: username,
            balance: 0
        }));
        await Account.insertMany(freshAccounts);
    }
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

        // On login, ensure they have initial accounts
        await seedUserAccounts(user.username);

        const { password: _, ...userData } = user._doc;
        res.json(userData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN ROUTES ---
app.post('/api/admin/users', async (req, res) => {
    try {
        const { name, email, username, password, phone } = req.body;
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) return res.status(400).json({ error: 'Username or Email already exists' });

        const newUser = new User({ name, email, username, password, phone });
        await newUser.save();

        // Initialize their clean account chart
        await seedUserAccounts(username);

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CLIENT DATA ROUTES ---
app.get('/api/accounts', authenticate, async (req, res) => {
    try {
        const accs = await Account.find({ userId: req.userId });
        res.json(accs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products', authenticate, async (req, res) => {
    try {
        res.json(await Product.find({ userId: req.userId }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/parties', authenticate, async (req, res) => {
    try {
        res.json(await Party.find({ userId: req.userId }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/vouchers', authenticate, async (req, res) => {
    try {
        res.json(await Voucher.find({ userId: req.userId }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/vouchers', authenticate, async (req, res) => {
    try {
        const voucherData = req.body;
        const { type, items, entries } = voucherData;
        const userId = req.userId;

        // 1. Process Inventory
        if (type === 'purchase' || type === 'sale') {
            for (const item of items) {
                const prod = await Product.findOne({ userId, id: item.productId });
                if (!prod) continue;

                if (type === 'purchase') {
                    const totalQty = (prod.stock || 0) + item.qty;
                    const totalValue = ((prod.stock || 0) * (prod.purchasePrice || 0)) + (item.qty * (item.unitPrice || 0));
                    prod.purchasePrice = totalValue / totalQty;
                    prod.stock = totalQty;
                } else {
                    prod.stock -= item.qty;
                }
                await prod.save();
            }
        }

        // 2. Process Ledger
        for (const entry of entries) {
            const acc = await Account.findOne({ userId, $or: [{ name: entry.account }, { id: entry.account }] });
            if (acc) {
                const mod = (entry.type === 'debit' ? 1 : -1);
                const isAssetExpense = acc.type === 'asset' || acc.type === 'expense';
                acc.balance += (isAssetExpense ? mod : -mod) * entry.amount;
                await acc.save();
            }
        }

        const newVoucher = new Voucher({ ...voucherData, userId });
        await newVoucher.save();

        const [finalProducts, finalAccounts] = await Promise.all([
            Product.find({ userId }),
            Account.find({ userId })
        ]);

        res.status(201).json({ voucher: newVoucher, products: finalProducts, accounts: finalAccounts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', authenticate, async (req, res) => {
    try {
        const newProd = new Product({ ...req.body, userId: req.userId });
        await newProd.save();
        res.status(201).json(newProd);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/parties', authenticate, async (req, res) => {
    try {
        const newParty = new Party({ ...req.body, userId: req.userId });
        await newParty.save();
        res.status(201).json(newParty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Real-World Multi-tenant Backend running at http://localhost:${port}`);
});
