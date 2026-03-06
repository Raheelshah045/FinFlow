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
    const newVoucher = req.body;
    vouchers.push(newVoucher);
    // In a real app, you'd update accounts and products here too
    res.status(201).json(newVoucher);
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
