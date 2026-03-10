const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let currentUser = null;

export const setAuthUser = (user) => {
    currentUser = user;
};

const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (currentUser) {
        headers['x-user-id'] = currentUser.username;
    }
    return headers;
};

export const login = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Invalid credentials');
    const user = await response.json();
    currentUser = user;
    return user;
};

export const adminCreateUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create user');
    }
    return response.json();
};

export const adminFetchUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
};

export const fetchAccounts = async () => {
    const response = await fetch(`${API_BASE_URL}/accounts`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
};

export const updateAccount = async (id, balance) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ balance }),
    });
    if (!response.ok) throw new Error('Failed to update account');
    return response.json();
};

export const fetchProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

export const fetchVouchers = async () => {
    const response = await fetch(`${API_BASE_URL}/vouchers`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch vouchers');
    return response.json();
};

export const fetchParties = async () => {
    const response = await fetch(`${API_BASE_URL}/parties`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch parties');
    return response.json();
};

export const postVoucher = async (voucherData) => {
    const response = await fetch(`${API_BASE_URL}/vouchers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(voucherData),
    });
    if (!response.ok) throw new Error('Failed to post voucher');
    return response.json();
};

export const postProduct = async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to post product');
    return response.json();
};

export const postParty = async (partyData) => {
    const response = await fetch(`${API_BASE_URL}/parties`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(partyData),
    });
    if (!response.ok) throw new Error('Failed to post party');
    return response.json();
};
