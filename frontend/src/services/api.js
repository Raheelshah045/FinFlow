const API_BASE_URL = 'http://localhost:5000/api'; // Local Backend
// const API_BASE_URL = 'https://finflow-1-oqg2.onrender.com/api'; // Deployed Backend

export const fetchDashboardData = async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
};

export const fetchAccounts = async () => {
    const response = await fetch(`${API_BASE_URL}/accounts`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
};

export const fetchProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

export const fetchVouchers = async () => {
    const response = await fetch(`${API_BASE_URL}/vouchers`);
    if (!response.ok) throw new Error('Failed to fetch vouchers');
    return response.json();
};

export const fetchParties = async () => {
    const response = await fetch(`${API_BASE_URL}/parties`);
    if (!response.ok) throw new Error('Failed to fetch parties');
    return response.json();
};

export const postVoucher = async (voucherData) => {
    const response = await fetch(`${API_BASE_URL}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData),
    });
    if (!response.ok) throw new Error('Failed to post voucher');
    return response.json();
};

export const postProduct = async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to post product');
    return response.json();
};

export const postParty = async (partyData) => {
    const response = await fetch(`${API_BASE_URL}/parties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partyData),
    });
    if (!response.ok) throw new Error('Failed to post party');
    return response.json();
};
