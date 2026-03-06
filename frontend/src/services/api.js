const API_BASE_URL = 'https://finflow-1-oqg2.onrender.com/api';

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

export const postVoucher = async (voucherData) => {
    const response = await fetch(`${API_BASE_URL}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData),
    });
    if (!response.ok) throw new Error('Failed to post voucher');
    return response.json();
};
