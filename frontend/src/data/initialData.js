export const INITIAL_ACCOUNTS = [
    { id: "cash", name: "Cash", type: "asset", balance: 500000 },
    { id: "bank", name: "Bank (HBL)", type: "asset", balance: 1200000 },
    { id: "sales_revenue", name: "Sales Revenue", type: "revenue", balance: 0 },
    { id: "inventory", name: "Inventory Asset", type: "asset", balance: 0 },
    { id: "expenses", name: "Operating Expenses", type: "expense", balance: 0 },
];

export const INITIAL_PRODUCTS = [
    { id: "p1", sku: "LPT-001", name: "Laptop Pro 15\"", purchasePrice: 85000, salePrice: 110000, stock: 12, threshold: 3 },
    { id: "p2", sku: "MON-002", name: "4K Monitor 27\"", purchasePrice: 42000, salePrice: 58000, stock: 8, threshold: 2 },
    { id: "p3", sku: "KBD-003", name: "Mechanical Keyboard", purchasePrice: 7500, salePrice: 12000, stock: 25, threshold: 5 },
    { id: "p4", sku: "MSE-004", name: "Wireless Mouse", purchasePrice: 3200, salePrice: 5500, stock: 2, threshold: 5 },
    { id: "p5", sku: "HDR-005", name: "Headset Pro", purchasePrice: 18000, salePrice: 28000, stock: 0, threshold: 3 },
    { id: "p6", sku: "WEB-006", name: "HD Webcam", purchasePrice: 9500, salePrice: 15000, stock: 6, threshold: 2 },
];

export const INITIAL_PARTIES = [
    { id: "v1", name: "Tech Distributors Ltd.", type: "vendor" },
    { id: "v2", name: "Global Electronics Co.", type: "vendor" },
    { id: "v3", name: "Karachi Systems Inc.", type: "vendor" },
    { id: "v4", name: "Lahore Tech Solutions", type: "vendor" },
    { id: "v5", name: "Islamabad IT Hub", type: "vendor" },
];

export const INITIAL_VOUCHERS = [
    {
        id: "PV-001", type: "purchase", date: "2025-01-10", party: "Tech Distributors Ltd.",
        paymentMode: "bank", total: 340000, status: "posted",
        items: [{ productId: "p1", name: "Laptop Pro 15\"", qty: 2, unitPrice: 85000, subtotal: 170000 }, { productId: "p2", name: "4K Monitor 27\"", qty: 4, unitPrice: 42000, subtotal: 168000 }],
        entries: [{ account: "Inventory Asset", type: "debit", amount: 340000 }, { account: "Bank (HBL)", type: "credit", amount: 340000 }]
    },
    {
        id: "SV-001", type: "sale", date: "2025-01-15", party: "Karachi Systems Inc.",
        paymentMode: "bank", total: 294000, status: "posted",
        items: [{ productId: "p1", name: "Laptop Pro 15\"", qty: 2, unitPrice: 110000, subtotal: 220000 }, { productId: "p2", name: "4K Monitor 27\"", qty: 2, unitPrice: 58000, subtotal: 116000 }],
        entries: [{ account: "Bank", type: "debit", amount: 294000 }, { account: "Sales Revenue", type: "credit", amount: 294000 }],
        margin: 51000
    },
    {
        id: "PV-002", type: "purchase", date: "2025-02-03", party: "Global Electronics Co.",
        paymentMode: "cash", total: 187500, status: "posted",
        items: [{ productId: "p3", name: "Mechanical Keyboard", qty: 25, unitPrice: 7500, subtotal: 187500 }],
        entries: [{ account: "Inventory Asset", type: "debit", amount: 187500 }, { account: "Cash", type: "credit", amount: 187500 }]
    },
    {
        id: "SV-002", type: "sale", date: "2025-02-20", party: "Lahore Tech Solutions",
        paymentMode: "cash", total: 180000, status: "posted",
        items: [{ productId: "p3", name: "Mechanical Keyboard", qty: 15, unitPrice: 12000, subtotal: 180000 }],
        entries: [{ account: "Cash", type: "debit", amount: 180000 }, { account: "Sales Revenue", type: "credit", amount: 180000 }],
        margin: 67500
    },
    {
        id: "SV-003", type: "sale", date: "2025-03-01", party: "Islamabad IT Hub",
        paymentMode: "bank", total: 90000, status: "posted",
        items: [{ productId: "p4", name: "Wireless Mouse", qty: 5, unitPrice: 5500, subtotal: 27500 }, { productId: "p6", name: "HD Webcam", qty: 4, unitPrice: 15000, subtotal: 60000 }],
        entries: [{ account: "Bank", type: "debit", amount: 90000 }, { account: "Sales Revenue", type: "credit", amount: 90000 }],
        margin: 25100
    },
];
