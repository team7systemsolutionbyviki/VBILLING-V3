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
        { id: 'p1', name: 'Tomato (Local)', nameTa: 'தக்காளி (உள்ளூர்)', barcode: '890101', category: 'Vegetables', price: 40, costRate: 25, wholesaleRate: 35, vipRate: 32, dealerRate: 30, minRate: 28, unit: 'KG', stock: 500, color: '#ef4444', mark: 'KVR', fromWho: 'Ramesh', updatedAt: '2026-05-22T12:00:00.000Z' },
        { id: 'p2', name: 'Onion (Nasik)', nameTa: 'வெங்காயம் (நாசிக்)', barcode: '890102', category: 'Vegetables', price: 30, costRate: 18, wholesaleRate: 25, vipRate: 22, dealerRate: 20, minRate: 19, unit: 'KG', stock: 1200, color: '#fb923c', mark: 'AM', fromWho: 'Sundar', updatedAt: '2026-05-22T12:05:00.000Z' },
        { id: 'p3', name: 'Potato (Agra)', nameTa: 'உருளைக்கிழங்கு (ஆக்ரா)', barcode: '890103', category: 'Vegetables', price: 25, costRate: 14, wholesaleRate: 20, vipRate: 18, dealerRate: 17, minRate: 16, unit: 'KG', stock: 2000, color: '#eab308', mark: 'VR', fromWho: 'Kannan', updatedAt: '2026-05-22T12:10:00.000Z' },
        { id: 'p4', name: 'Carrot (Ooty)', nameTa: 'கேரட் (ஊட்டி)', barcode: '890104', category: 'Vegetables', price: 60, costRate: 40, wholesaleRate: 50, vipRate: 48, dealerRate: 45, minRate: 42, unit: 'KG', stock: 350, color: '#f97316', mark: 'OOT', fromWho: 'Mani', updatedAt: '2026-05-22T12:15:00.000Z' },
        { id: 'p5', name: 'Cabbage', nameTa: 'முட்டைக்கோஸ்', barcode: '890105', category: 'Vegetables', price: 20, costRate: 11, wholesaleRate: 16, vipRate: 15, dealerRate: 14, minRate: 12, unit: 'KG', stock: 600, color: '#22c55e', mark: 'G', fromWho: 'Selvam', updatedAt: '2026-05-22T12:20:00.000Z' },
        { id: 'p6', name: 'Apple (Shimla)', nameTa: 'ஆப்பிள் (சிம்லா)', barcode: '890106', category: 'Fruits', price: 150, costRate: 100, wholesaleRate: 130, vipRate: 120, dealerRate: 115, minRate: 110, unit: 'Box', stock: 120, color: '#ef4444', mark: 'SHM', fromWho: 'Naresh', updatedAt: '2026-05-22T12:25:00.000Z' },
        { id: 'p7', name: 'Banana (Robusta)', nameTa: 'வாழைப்பழம் (ரொபஸ்டா)', barcode: '890107', category: 'Fruits', price: 400, costRate: 280, wholesaleRate: 350, vipRate: 320, dealerRate: 300, minRate: 290, unit: 'Bunch', stock: 250, color: '#facc15', mark: 'ROB', fromWho: 'Kumaran', updatedAt: '2026-05-22T12:30:00.000Z' },
        { id: 'p8', name: 'Garlic (Hill)', nameTa: 'பூண்டு (மலை)', barcode: '890108', category: 'Vegetables', price: 140, costRate: 90, wholesaleRate: 120, vipRate: 115, dealerRate: 110, minRate: 100, unit: 'KG', stock: 400, color: '#cbd5e1', mark: 'HIL', fromWho: 'Palanisamy', updatedAt: '2026-05-22T12:35:00.000Z' }
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
        { id: 'c1', name: 'Walk-in Customer', phone: '', type: 'Retail', balance: 0 },
        { id: 'c2', name: 'Rajesh Hotel', phone: '9876543210', type: 'Wholesale', balance: 5000 },
        { id: 'c3', name: 'Murugan Supermarket', phone: '9876543211', type: 'Wholesale', balance: -1500 },
        { id: 'c4', name: 'Anand Traders', phone: '9876543212', type: 'Credit', balance: 12500 }
    ],
    bills: [],
    transactions: []
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
            this.save('customers', isShop ? [{ id: 'c1', name: 'Walk-in Customer', phone: '', type: 'Retail', balance: 0 }] : dummyData.customers);
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
        if (!this.load('billNo')) {
            this.save('billNo', 1001);
        }
        if (!this.load('special_rates')) {
            this.save('special_rates', []);
        }
    },
    getCategories: function() { return this.load('categories'); },
    getUnits: function() { return this.load('units'); },
    getProducts: function() { return this.load('products'); },
    getCustomers: function() { return this.load('customers'); },
    getBills: function() { return this.load('bills'); },
    
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
