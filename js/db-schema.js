/**
 * Database Schema & Advanced Dummy Data Generator
 * 
 * Collections (Firestore & LocalDB sync):
 * - products: {id, name, nameTa, barcode, category, price, costRate, wholesaleRate, vipRate, dealerRate, minRate, unit, stock, color}
 * - customers: {id, name, phone, type, balance, creditLimit, address, gstin}
 * - bills: {billNo, date, time, customerId, customerName, items: [], subtotal, charges, discount, total, paymentMethod, splitCash, splitUpi}
 * - transactions: {id, date, type, method, party, desc, amount, gross, charges, discount, items, isPurchase, isExpense, isCredit}
 * - categories: {id, name}
 * - units: {id, name}
 */

const dummyData = {
    products: [
        { id: 'p1', name: 'Tomato (Local)', nameTa: 'தக்காளி (உள்ளூர்)', barcode: '890101', category: 'Vegetables', price: 40, costRate: 25, wholesaleRate: 35, vipRate: 32, dealerRate: 30, minRate: 28, unit: 'KG', stock: 500, color: '#ef4444', mark: 'KVR', fromWho: 'Ramesh', updatedAt: '2026-05-22T12:00:00.000Z', expiryDate: '2026-05-28' },
        { id: 'p2', name: 'Onion (Nasik)', nameTa: 'வெங்காயம் (நாசிக்)', barcode: '890102', category: 'Vegetables', price: 30, costRate: 18, wholesaleRate: 25, vipRate: 22, dealerRate: 20, minRate: 19, unit: 'KG', stock: 1200, color: '#fb923c', mark: 'AM', fromWho: 'Sundar', updatedAt: '2026-05-22T12:05:00.000Z', expiryDate: '2026-06-30' },
        { id: 'p3', name: 'Potato (Agra)', nameTa: 'உருளைக்கிழங்கு (ஆக்ரா)', barcode: '890103', category: 'Vegetables', price: 25, costRate: 14, wholesaleRate: 20, vipRate: 18, dealerRate: 17, minRate: 16, unit: 'KG', stock: 2000, color: '#eab308', mark: 'VR', fromWho: 'Kannan', updatedAt: '2026-05-22T12:10:00.000Z', expiryDate: '2026-07-15' },
        { id: 'p4', name: 'Carrot (Ooty)', nameTa: 'கேரட் (ஊட்டி)', barcode: '890104', category: 'Vegetables', price: 60, costRate: 40, wholesaleRate: 50, vipRate: 48, dealerRate: 45, minRate: 42, unit: 'KG', stock: 350, color: '#f97316', mark: 'OOT', fromWho: 'Mani', updatedAt: '2026-05-22T12:15:00.000Z', expiryDate: '2026-05-29' },
        { id: 'p5', name: 'Cabbage', nameTa: 'முட்டைக்கோஸ்', barcode: '890105', category: 'Vegetables', price: 20, costRate: 11, wholesaleRate: 16, vipRate: 15, dealerRate: 14, minRate: 12, unit: 'KG', stock: 600, color: '#22c55e', mark: 'G', fromWho: 'Selvam', updatedAt: '2026-05-22T12:20:00.000Z', expiryDate: '2026-05-25' },
        { id: 'p6', name: 'Apple (Shimla)', nameTa: 'ஆப்பிள் (சிம்லா)', barcode: '890106', category: 'Fruits', price: 150, costRate: 100, wholesaleRate: 130, vipRate: 120, dealerRate: 115, minRate: 110, unit: 'Box', stock: 120, color: '#ef4444', mark: 'SHM', fromWho: 'Naresh', updatedAt: '2026-05-22T12:25:00.000Z', expiryDate: '2026-06-15' },
        { id: 'p7', name: 'Banana (Robusta)', nameTa: 'வாழைப்பழம் (ரொபஸ்டா)', barcode: '890107', category: 'Fruits', price: 400, costRate: 280, wholesaleRate: 350, vipRate: 320, dealerRate: 300, minRate: 290, unit: 'Bunch', stock: 250, color: '#facc15', mark: 'ROB', fromWho: 'Kumaran', updatedAt: '2026-05-22T12:30:00.000Z', expiryDate: '2026-06-01' },
        { id: 'p8', name: 'Garlic (Hill)', nameTa: 'பூண்டு (மலை)', barcode: '890108', category: 'Vegetables', price: 140, costRate: 90, wholesaleRate: 120, vipRate: 115, dealerRate: 110, minRate: 100, unit: 'KG', stock: 400, color: '#cbd5e1', mark: 'HIL', fromWho: 'Palanisamy', updatedAt: '2026-05-22T12:35:00.000Z', expiryDate: '2026-04-10' }
    ],
    categories: [
        { id: 'cat1', name: 'Vegetables' },
        { id: 'cat2', name: 'Fruits' },
        { id: 'cat3', name: 'Other' }
    ],
    units: [
        { id: 'u1', name: 'KG' },
        { id: 'u2', name: 'Box' },
        { id: 'u3', name: 'Bunch' },
        { id: 'u4', name: 'Sack' },
        { id: 'u5', name: 'Piece' }
    ],
    customers: [
        { id: 'c1', name: 'Walk-in Customer', phone: '', type: 'Retail', balance: 0, loyaltyPoints: 12, creditLimit: 0, address: '', gstin: '' },
        { id: 'c2', name: 'Rajesh Hotel', phone: '9876543210', type: 'Wholesale', balance: 5000, loyaltyPoints: 340, creditLimit: 25000, address: 'Anna Nagar, Chennai', gstin: '33AABCR1234F1Z1' },
        { id: 'c3', name: 'Murugan Supermarket', phone: '9876543211', type: 'Wholesale', balance: -1500, loyaltyPoints: 120, creditLimit: 15000, address: 'Koyambedu, Chennai', gstin: '33AMNPC9876C2Z3' },
        { id: 'c4', name: 'Anand Traders', phone: '9876543212', type: 'Credit', balance: 12500, loyaltyPoints: 850, creditLimit: 50000, address: 'T. Nagar, Chennai', gstin: '33APQRS4321A1Z2' }
    ],
    bills: [
        { billNo: 1001, date: '23/05/2026', time: '08:15 AM', customerId: 'c1', customerName: 'Walk-in Customer', items: [{ id: 'p1', name: 'Tomato (Local)', qty: 5, price: 40, unit: 'KG', total: 200, mark: 'KVR' }, { id: 'p2', name: 'Onion (Nasik)', qty: 4, price: 30, unit: 'KG', total: 120, mark: 'AM' }], subtotal: 320, charges: 10, discount: 10, total: 320, paymentMethod: 'cash', staffName: 'VIKI', counterId: 'Counter 1' },
        { billNo: 1002, date: '23/05/2026', time: '09:45 AM', customerId: 'c2', customerName: 'Rajesh Hotel', items: [{ id: 'p3', name: 'Potato (Agra)', qty: 40, price: 20, unit: 'KG', total: 800, mark: 'VR' }, { id: 'p4', name: 'Carrot (Ooty)', qty: 20, price: 50, unit: 'KG', total: 1000, mark: 'OOT' }], subtotal: 1800, charges: 50, discount: 50, total: 1800, paymentMethod: 'credit', staffName: 'Staff 1', counterId: 'Counter 1' },
        { billNo: 1003, date: '23/05/2026', time: '11:30 AM', customerId: 'c3', customerName: 'Murugan Supermarket', items: [{ id: 'p6', name: 'Apple (Shimla)', qty: 10, price: 130, unit: 'Box', total: 1300, mark: 'SHM' }, { id: 'p7', name: 'Banana (Robusta)', qty: 5, price: 350, unit: 'Bunch', total: 1750, mark: 'ROB' }, { id: 'p1', name: 'Tomato (Local)', qty: 10, price: 35, unit: 'KG', total: 350, mark: 'KVR' }], subtotal: 3400, charges: 100, discount: 0, total: 3500, paymentMethod: 'upi', staffName: 'VIKI', counterId: 'Counter 2' },
        { billNo: 1004, date: '23/05/2026', time: '02:15 PM', customerId: 'c4', customerName: 'Anand Traders', items: [{ id: 'p2', name: 'Onion (Nasik)', qty: 100, price: 25, unit: 'KG', total: 2500, mark: 'AM' }, { id: 'p3', name: 'Potato (Agra)', qty: 80, price: 20, unit: 'KG', total: 1600, mark: 'VR' }], subtotal: 4100, charges: 150, discount: 50, total: 4200, paymentMethod: 'split', splitCash: 2000, splitUpi: 2200, staffName: 'Staff 1', counterId: 'Counter 1' },
        { billNo: 1005, date: '23/05/2026', time: '05:00 PM', customerId: 'c1', customerName: 'Walk-in Customer', items: [{ id: 'p4', name: 'Carrot (Ooty)', qty: 10, price: 60, unit: 'KG', total: 600, mark: 'OOT' }], subtotal: 600, charges: 0, discount: 0, total: 600, paymentMethod: 'upi', staffName: 'VIKI', counterId: 'Counter 1' },
        { billNo: 1006, date: '22/05/2026', time: '10:00 AM', customerId: 'c2', customerName: 'Rajesh Hotel', items: [{ id: 'p1', name: 'Tomato (Local)', qty: 30, price: 35, unit: 'KG', total: 1050, mark: 'KVR' }, { id: 'p2', name: 'Onion (Nasik)', qty: 50, price: 25, unit: 'KG', total: 1250, mark: 'AM' }], subtotal: 2300, charges: 100, discount: 0, total: 2400, paymentMethod: 'credit', staffName: 'Staff 2', counterId: 'Counter 1' },
        { billNo: 1007, date: '22/05/2026', time: '03:30 PM', customerId: 'c4', customerName: 'Anand Traders', items: [{ id: 'p6', name: 'Apple (Shimla)', qty: 30, price: 130, unit: 'Box', total: 3900, mark: 'SHM' }, { id: 'p8', name: 'Garlic (Hill)', qty: 15, price: 120, unit: 'KG', total: 1800, mark: 'HIL' }], subtotal: 5700, charges: 100, discount: 0, total: 5800, paymentMethod: 'upi', staffName: 'VIKI', counterId: 'Counter 2' },
        { billNo: 1008, date: '22/05/2026', time: '05:45 PM', customerId: 'c1', customerName: 'Walk-in Customer', items: [{ id: 'p5', name: 'Cabbage', qty: 50, price: 20, unit: 'KG', total: 1000, mark: 'G' }], subtotal: 1000, charges: 0, discount: 50, total: 950, paymentMethod: 'cash', staffName: 'Staff 1', counterId: 'Counter 1' },
        { billNo: 1009, date: '20/05/2026', time: '11:15 AM', customerId: 'c1', customerName: 'Walk-in Customer', items: [{ id: 'p3', name: 'Potato (Agra)', qty: 50, price: 25, unit: 'KG', total: 1250, mark: 'VR' }], subtotal: 1250, charges: 0, discount: 50, total: 1200, paymentMethod: 'cash', staffName: 'VIKI', counterId: 'Counter 1' },
        { billNo: 1010, date: '15/05/2026', time: '02:00 PM', customerId: 'c2', customerName: 'Rajesh Hotel', items: [{ id: 'p7', name: 'Banana (Robusta)', qty: 10, price: 350, unit: 'Bunch', total: 3500, mark: 'ROB' }, { id: 'p4', name: 'Carrot (Ooty)', qty: 20, price: 50, unit: 'KG', total: 1000, mark: 'OOT' }], subtotal: 4500, charges: 100, discount: 100, total: 4500, paymentMethod: 'credit', staffName: 'Staff 1', counterId: 'Counter 1' },
        { billNo: 1011, date: '10/05/2026', time: '09:00 AM', customerId: 'c3', customerName: 'Murugan Supermarket', items: [{ id: 'p6', name: 'Apple (Shimla)', qty: 50, price: 130, unit: 'Box', total: 6500, mark: 'SHM' }, { id: 'p7', name: 'Banana (Robusta)', qty: 4, price: 350, unit: 'Bunch', total: 1400, mark: 'ROB' }], subtotal: 7900, charges: 200, discount: 100, total: 8000, paymentMethod: 'upi', staffName: 'VIKI', counterId: 'Counter 1' }
    ],
    transactions: [
        { id: 'TXN-1001', date: '23/05/2026', type: 'IN', method: 'CASH', party: 'Walk-in Customer', desc: 'Sales Patti Bill #1001', amount: 320 },
        { id: 'TXN-1002', date: '23/05/2026', type: 'IN', method: 'CREDIT', party: 'Rajesh Hotel', desc: 'Sales Patti Bill #1002', amount: 1800, isCredit: true },
        { id: 'TXN-1003', date: '23/05/2026', type: 'IN', method: 'UPI', party: 'Murugan Supermarket', desc: 'Sales Patti Bill #1003', amount: 3500 },
        { id: 'TXN-1004', date: '23/05/2026', type: 'IN', method: 'SPLIT', party: 'Anand Traders', desc: 'Sales Patti Bill #1004 [Split: Cash 2000, UPI 2200]', amount: 4200, splitCash: 2000, splitUpi: 2200 },
        { id: 'TXN-1005', date: '23/05/2026', type: 'IN', method: 'UPI', party: 'Walk-in Customer', desc: 'Sales Patti Bill #1005', amount: 600 },
        { id: 'TXN-1006', date: '22/05/2026', type: 'IN', method: 'CREDIT', party: 'Rajesh Hotel', desc: 'Sales Patti Bill #1006', amount: 2400, isCredit: true },
        { id: 'TXN-1007', date: '22/05/2026', type: 'IN', method: 'UPI', party: 'Anand Traders', desc: 'Sales Patti Bill #1007', amount: 5800 },
        { id: 'TXN-1008', date: '22/05/2026', type: 'IN', method: 'CASH', party: 'Walk-in Customer', desc: 'Sales Patti Bill #1008', amount: 950 },
        { id: 'TXN-1009', date: '20/05/2026', type: 'IN', method: 'CASH', party: 'Walk-in Customer', desc: 'Sales Patti Bill #1009', amount: 1200 },
        { id: 'TXN-1010', date: '15/05/2026', type: 'IN', method: 'CREDIT', party: 'Rajesh Hotel', desc: 'Sales Patti Bill #1010', amount: 4500, isCredit: true },
        { id: 'TXN-1011', date: '10/05/2026', type: 'IN', method: 'UPI', party: 'Murugan Supermarket', desc: 'Sales Patti Bill #1011', amount: 8000 },
        // Expenses
        { id: 'EXP-1001', date: '23/05/2026', type: 'OUT', method: 'CASH', party: 'Selvam Loader', desc: '[Coolie] Tomato Unloading', amount: 250, category: 'Coolie', isExpense: true },
        { id: 'EXP-1002', date: '22/05/2026', type: 'OUT', method: 'BANK', party: 'Bazaar Owner', desc: '[Rent] Shop Rent Monthly', amount: 12000, category: 'Rent', isExpense: true },
        { id: 'EXP-1003', date: '22/05/2026', type: 'OUT', method: 'CASH', party: 'Tea Stall', desc: '[Tea & Snacks] Daily Staff Refreshments', amount: 180, category: 'Tea & Snacks', isExpense: true },
        { id: 'EXP-1004', date: '20/05/2026', type: 'OUT', method: 'UPI', party: 'TNEB', desc: '[Electricity] Power Bill', amount: 2450, category: 'Electricity', isExpense: true },
        { id: 'EXP-1005', date: '18/05/2026', type: 'OUT', method: 'CASH', party: 'City Stationers', desc: '[Office] Receipt books and ledger registers', amount: 450, category: 'Office', isExpense: true },
        // Purchases
        { id: 'PUR-1001', date: '22/05/2026', type: 'OUT', method: 'CASH', party: 'Ramesh', desc: 'Purchase Lot: LOT-420 (TN-01-AB-1234)', amount: 4000, gross: 5000, charges: 200, discount: 100, items: [{ name: 'Tomato (Local)', qty: 100, rate: 25, unit: 'KG', total: 2500, mark: 'KVR' }, { name: 'Onion (Nasik)', qty: 100, rate: 18, unit: 'KG', total: 1800, mark: 'AM' }], isPurchase: true },
        { id: 'PUR-1002', date: '18/05/2026', type: 'OUT', method: 'UPI', party: 'Sundar', desc: 'Purchase Lot: LOT-310 (TN-01-CD-5678)', amount: 15000, gross: 15000, charges: 500, discount: 500, items: [{ name: 'Onion (Nasik)', qty: 500, rate: 18, unit: 'KG', total: 9000, mark: 'AM' }, { name: 'Potato (Agra)', qty: 400, rate: 15, unit: 'KG', total: 6000, mark: 'VR' }], isPurchase: true }
    ],
    damaged_products: [
        { id: 'dmg1', date: '20/05/2026', name: 'Tomato (Local)', qty: 15, unit: 'KG', mark: 'KVR', reason: 'Spoiled due to rain moisture', cost: 25 },
        { id: 'dmg2', date: '22/05/2026', name: 'Apple (Shimla)', qty: 5, unit: 'Box', mark: 'SHM', reason: 'Bruised during transit vibration', cost: 100 }
    ],
    stock_adjustments: [
        { id: 'adj1', date: '18/05/2026', name: 'Onion (Nasik)', prevStock: 1000, newStock: 1200, unit: 'KG', reason: 'Physical stock verification count correction', user: 'VIKI' },
        { id: 'adj2', date: '21/05/2026', name: 'Potato (Agra)', prevStock: 2050, newStock: 2000, unit: 'KG', reason: 'Weight shrinkage / drying loss', user: 'Staff 1' }
    ],
    purchase_returns: [
        { id: 'ret1', date: '19/05/2026', supplier: 'Ramesh', invoiceNo: 'LOT-420', items: [{ name: 'Tomato (Local)', qty: 20, unit: 'KG', rate: 25, total: 500, mark: 'KVR' }], total: 500, reason: 'Low quality supplies' }
    ],
    staff: [
        { id: 'st1', name: 'Staff 1 (Cashier)', username: 'staff1', password: 'password1', role: 'Cashier', phone: '9876543220', status: 'Active' },
        { id: 'st2', name: 'Staff 2 (Manager)', username: 'staff2', password: 'password1', role: 'Manager', phone: '9876543221', status: 'Active' }
    ]
};

// Local storage wrapper for robust offline capability
const LocalDB = {
    save: function(key, data) {
        const currentShopId = sessionStorage.getItem('currentShopId');
        if (key === 'global_shops') {
            localStorage.setItem('vmasterbilling_global_shops', JSON.stringify(data));
        } else if (currentShopId) {
            localStorage.setItem('vmasterbilling_' + currentShopId + '_' + key, JSON.stringify(data));
        } else {
            localStorage.setItem('vmasterbilling_' + key, JSON.stringify(data));
        }
    },
    load: function(key) {
        const currentShopId = sessionStorage.getItem('currentShopId');
        let data;
        if (key === 'global_shops') {
            data = localStorage.getItem('vmasterbilling_global_shops');
        } else if (currentShopId) {
            data = localStorage.getItem('vmasterbilling_' + currentShopId + '_' + key);
        } else {
            data = localStorage.getItem('vmasterbilling_' + key);
        }
        return data ? JSON.parse(data) : null;
    },
    init: function() {
        const isShop = !!sessionStorage.getItem('currentShopId');
        
        if (!this.load('products')) {
            this.save('products', isShop ? [] : dummyData.products);
        }
        if (!this.load('customers')) {
            this.save('customers', isShop ? [{ id: 'c1', name: 'Walk-in Customer', phone: '', type: 'Retail', balance: 0, loyaltyPoints: 0, creditLimit: 0 }] : dummyData.customers);
        }
        if (!this.load('bills')) {
            this.save('bills', dummyData.bills);
        }
        if (!this.load('categories')) {
            this.save('categories', dummyData.categories);
        }
        if (!this.load('units')) {
            this.save('units', dummyData.units);
        }
        if (!this.load('transactions')) {
            this.save('transactions', dummyData.transactions);
        }
        if (!this.load('damaged_products')) {
            this.save('damaged_products', dummyData.damaged_products);
        }
        if (!this.load('stock_adjustments')) {
            this.save('stock_adjustments', dummyData.stock_adjustments);
        }
        if (!this.load('purchase_returns')) {
            this.save('purchase_returns', dummyData.purchase_returns);
        }
        if (!this.load('billNo')) {
            this.save('billNo', 1012);
        }
        if (!this.load('special_rates')) {
            this.save('special_rates', []);
        }
        if (!this.load('staff')) {
            this.save('staff', dummyData.staff);
        }
    },
    getCategories: function() { return this.load('categories'); },
    getUnits: function() { return this.load('units'); },
    getProducts: function() { return this.load('products'); },
    getCustomers: function() { return this.load('customers'); },
    getBills: function() { return this.load('bills'); },
    getStaff: function() { return this.load('staff') || []; },
    saveStaff: function(staffList) { this.save('staff', staffList); },
    
    addBill: function(bill) {
        const bills = this.load('bills') || [];
        bills.unshift(bill); // Add to top
        this.save('bills', bills);
        
        // Auto deduct stock quantities on billing save if setting is enabled
        const autoDeduct = (typeof AppState !== 'undefined' && AppState && AppState.settings) ? AppState.settings.autoDeductStock : true;
        if (autoDeduct && bill.items) {
            let products = this.load('products') || [];
            let updated = [];
            bill.items.forEach(item => {
                let p = products.find(prod => prod.id === item.id);
                if (p) {
                    p.stock = (p.stock || 0) - item.qty;
                    p.updatedAt = new Date().toISOString();
                    updated.push(p);
                }
            });
            if (updated.length > 0) {
                this.save('products', products);
                if (typeof db !== 'undefined' && db) {
                    updated.forEach(p => {
                        db.collection('products').doc(p.id).set(p)
                            .catch(err => console.error("Error updating product stock on cloud:", err));
                    });
                }
            }
        }
        
        // Update bill counter
        let billNo = this.load('billNo') || 1000;
        this.save('billNo', billNo + 1);
        
        // Update customer balance locally
        if (bill.paymentMethod === 'credit' && bill.customerId !== 'c1') {
            const customers = this.load('customers');
            const idx = customers.findIndex(c => c.id === bill.customerId);
            if(idx > -1) {
                customers[idx].balance = (customers[idx].balance || 0) + bill.total;
                this.save('customers', customers);
            }
            
            // Add custom ledger transaction entry automatically
            const txn = {
                id: 'TXN-' + bill.billNo,
                date: bill.date,
                type: 'IN',
                method: 'CREDIT',
                party: bill.customerName,
                desc: 'Sales Patti Bill #' + bill.billNo,
                amount: bill.total,
                isCredit: true
            };
            let txns = this.load('transactions') || [];
            txns.unshift(txn);
            this.save('transactions', txns);
        } else {
            // Cash / UPI bills are standard transaction cash-ins
            const txn = {
                id: 'TXN-' + bill.billNo,
                date: bill.date,
                type: 'IN',
                method: bill.paymentMethod.toUpperCase(),
                party: bill.customerName,
                desc: 'Sales Patti Bill #' + bill.billNo,
                amount: bill.total
            };
            let txns = this.load('transactions') || [];
            txns.unshift(txn);
            this.save('transactions', txns);
        }

        // Push to cloud if online
        if (typeof db !== 'undefined' && db) {
            CloudSync.uploadBill(bill);
        }
    },
    getNextBillNo: function() {
        return this.load('billNo') || 1001;
    }
};

const ShopManager = {
    getShops: function() {
        const data = localStorage.getItem('vmasterbilling_global_shops');
        return data ? JSON.parse(data) : [];
    },
    saveShopsLocally: function(shops) {
        localStorage.setItem('vmasterbilling_global_shops', JSON.stringify(shops));
    },
    createShop: function(name, adminUsername, adminPassword, amcPlan, amcExpiryDate) {
        const id = 'shop_' + Date.now();
        const newShop = {
            id: id,
            name: name,
            adminUsername: adminUsername,
            adminPassword: adminPassword,
            amcPlan: amcPlan || 'Yearly',
            amcExpiryDate: amcExpiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        
        // Save locally
        const shops = this.getShops();
        shops.push(newShop);
        this.saveShopsLocally(shops);
        
        // Save to Firestore if online
        if (typeof db !== 'undefined' && db) {
            db.collection('shops').doc(id).set(newShop)
                .then(() => console.log("Shop saved to cloud:", id))
                .catch(err => console.error("Error saving shop to cloud:", err));
        }
        return newShop;
    },
    updateShopPlan: function(id, plan, expiryDate) {
        let shops = this.getShops();
        const idx = shops.findIndex(s => s.id === id);
        if (idx > -1) {
            shops[idx].amcPlan = plan;
            shops[idx].amcExpiryDate = expiryDate;
            this.saveShopsLocally(shops);
            
            // Save to Firestore if online
            if (typeof db !== 'undefined' && db) {
                db.collection('shops').doc(id).update({
                    amcPlan: plan,
                    amcExpiryDate: expiryDate
                })
                .then(() => console.log("Shop AMC updated on cloud:", id))
                .catch(err => console.error("Error updating shop AMC on cloud:", err));
            }
        }
    },
    deleteShop: function(id) {
        // Remove locally
        let shops = this.getShops();
        shops = shops.filter(s => s.id !== id);
        this.saveShopsLocally(shops);
        
        // Remove from Firestore if online
        if (typeof db !== 'undefined' && db) {
            db.collection('shops').doc(id).delete()
                .then(() => console.log("Shop deleted from cloud:", id))
                .catch(err => console.error("Error deleting shop from cloud:", err));
        }
    },
    initSync: function() {
        if (typeof db === 'undefined' || !db) return;
        
        const unsub = db.collection('shops').onSnapshot(snapshot => {
            if (snapshot.empty) return;
            const shops = [];
            snapshot.forEach(doc => shops.push({id: doc.id, ...doc.data()}));
            this.saveShopsLocally(shops);
            if (typeof app !== 'undefined' && app.currentPage === 'shops') {
                app.renderShopsList();
            }
        });
        CloudSync.unsubscribes.push(unsub);
    }
};

const CloudSync = {
    unsubscribes: [],

    init: function() {
        if (typeof db === 'undefined' || !db) return;
        
        // Disconnect previous listeners
        this.disconnect();
        
        console.log("Initializing Firestore Real-time Sync...");
        
        // Always listen to shops (global)
        ShopManager.initSync();
        
        const currentShopId = sessionStorage.getItem('currentShopId');
        if (!currentShopId) {
            console.log("No active shop selected. Sync listeners deferred.");
            return;
        }
        
        const isShop = !!currentShopId;

        // Sync Products
        const unsubProducts = db.collection('products').onSnapshot(snapshot => {
            if (snapshot.empty) {
                if (isShop) {
                    LocalDB.save('products', []);
                    if (typeof app !== 'undefined') app.refresh();
                } else {
                    this.seedData('products', dummyData.products);
                }
                return;
            }
            const products = [];
            snapshot.forEach(doc => products.push({id: doc.id, ...doc.data()}));
            LocalDB.save('products', products);
            if (typeof app !== 'undefined') app.refresh();
        });
        this.unsubscribes.push(unsubProducts);

        // Sync Customers
        const unsubCustomers = db.collection('customers').onSnapshot(snapshot => {
            if (snapshot.empty) {
                if (isShop) {
                    const defaultCusts = [{ id: 'c1', name: 'Walk-in Customer', phone: '', type: 'Retail', balance: 0 }];
                    this.seedData('customers', defaultCusts);
                } else {
                    this.seedData('customers', dummyData.customers);
                }
                return;
            }
            const customers = [];
            snapshot.forEach(doc => customers.push({id: doc.id, ...doc.data()}));
            LocalDB.save('customers', customers);
            if (typeof app !== 'undefined') app.refresh();
        });
        this.unsubscribes.push(unsubCustomers);

        // Sync Bills (pull recent)
        const unsubBills = db.collection('bills').orderBy('billNo', 'desc').limit(50).onSnapshot(snapshot => {
            if (snapshot.empty) return;
            const bills = [];
            snapshot.forEach(doc => bills.push({id: doc.id, ...doc.data()}));
            LocalDB.save('bills', bills);
            
            const maxBillNo = Math.max(...bills.map(b => b.billNo));
            if (maxBillNo >= (LocalDB.load('billNo') || 0)) {
                LocalDB.save('billNo', maxBillNo + 1);
            }
            
            if (typeof app !== 'undefined') app.refresh();
        });
        this.unsubscribes.push(unsubBills);
    },

    disconnect: function() {
        this.unsubscribes.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        this.unsubscribes = [];
        console.log("Firestore Sync listeners disconnected.");
    },

    seedData: function(collection, dataArray) {
        const batch = db.batch();
        dataArray.forEach(item => {
            const ref = db.collection(collection).doc(item.id);
            batch.set(ref, item);
        });
        batch.commit().then(() => console.log(collection + " seeded successfully"));
    },

    uploadBill: function(bill) {
        db.collection('bills').add(bill).then(() => {
            if (bill.paymentMethod === 'credit' && bill.customerId !== 'c1') {
                const custRef = db.collection('customers').doc(bill.customerId);
                db.runTransaction(transaction => {
                    return transaction.get(custRef).then(doc => {
                        if (doc.exists) {
                            const newBalance = (doc.data().balance || 0) + bill.total;
                            transaction.update(custRef, { balance: newBalance });
                        }
                    });
                });
            }
        }).catch(err => console.error("Cloud Sync Error: ", err));
    }
};

// Initialize DB on load
LocalDB.init();

// Wait for Firebase to initialize before starting cloud sync
setTimeout(() => {
    CloudSync.init();
}, 500);
