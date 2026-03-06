import express from 'express';
import cors from 'cors';
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initial Data
import { INITIAL_ACCOUNTS, INITIAL_PRODUCTS, INITIAL_PARTIES, INITIAL_VOUCHERS } from './data/initialData.js';

// Store in-memory
let accounts = [...INITIAL_ACCOUNTS];
let products = [...INITIAL_PRODUCTS];
let parties = [...INITIAL_PARTIES];
let vouchers = [...INITIAL_VOUCHERS];

// Routes
app.get('/api/dashboard', (req, res) => {
    res.json({
        accounts,
        products,
        vouchers: vouchers.slice(-5)
    });
});

app.get('/api/accounts', (req, res) => res.json(accounts));
app.get('/api/products', (req, res) => res.json(products));
app.get('/api/parties', (req, res) => res.json(parties));
app.get('/api/vouchers', (req, res) => res.json(vouchers));

app.post('/api/vouchers', (req, res) => {
    const voucher = req.body;
    const { type, items, entries } = voucher;

    // 1. Stock Validation for Sales
    if (type === 'sale') {
        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            if (!product || product.stock < item.qty) {
                return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
            }
        }
    }

    // 2. Update Products and Inventory Valuation (WAC)
    if (type === 'purchase' || type === 'sale') {
        items.forEach(item => {
            const idx = products.findIndex(p => p.id === item.productId);
            if (idx === -1) return;
            const p = products[idx];

            if (type === 'purchase') {
                // Calculate Weighted Average Cost (WAC)
                const totalQty = p.stock + item.qty;
                const totalValue = (p.stock * p.purchasePrice) + (item.qty * item.unitPrice);
                products[idx].purchasePrice = totalValue / totalQty;
                products[idx].stock = totalQty;
            } else {
                products[idx].stock -= item.qty;
            }
        });
    }

    // 3. Update Account Balances
    entries.forEach(entry => {
        // Find account by name or id (assuming entry has account name for now based on previous code)
        // For robustness, usually we use IDs. Let's try matching name.
        const accIdx = accounts.findIndex(a => a.name === entry.account);
        if (accIdx !== -1) {
            if (entry.type === 'debit') {
                // Increase Asset/Expense, Decrease Liability/Revenue/Equity
                if (accounts[accIdx].type === 'asset' || accounts[accIdx].type === 'expense') {
                    accounts[accIdx].balance += entry.amount;
                } else {
                    accounts[accIdx].balance -= entry.amount;
                }
            } else {
                // Increase Liability/Revenue/Equity, Decrease Asset/Expense
                if (accounts[accIdx].type === 'asset' || accounts[accIdx].type === 'expense') {
                    accounts[accIdx].balance -= entry.amount;
                } else {
                    accounts[accIdx].balance += entry.amount;
                }
            }
        }
    });

    vouchers.push(voucher);
    res.status(201).json({ voucher, products, accounts });
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
