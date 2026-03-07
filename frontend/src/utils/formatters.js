export const fmt = (n) => "PKR " + Number(n || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 });

export const fmtShort = (n) => {
    if (n >= 1000000) return "PKR " + (n / 1000000).toFixed(2) + "M";
    if (n >= 1000) return "PKR " + (n / 1000).toFixed(1) + "K";
    return "PKR " + n;
};

export const fmtNum = (n) => Number(n || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 });

export const fmtNumShort = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
};

export const today = () => new Date().toISOString().slice(0, 10);

export const newId = (prefix) => prefix + "-" + String(Date.now()).slice(-5);
