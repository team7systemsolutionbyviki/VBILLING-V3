const PurchaseLogic = {
    cart: [],
    paymentMethod: 'CASH',
    billNo: '',

    init: function() {
        this.cart = [];
        this.paymentMethod = 'CASH';
        // Auto gen bill no
        const txns = LocalDB.load('transactions') || [];
        const purTxns = txns.filter(t => t.id && t.id.startsWith('PUR'));
        this.billNo = 'PUR-' + (1001 + purTxns.length);
        
        const bEl = document.getElementById('pur-bill-no');
        if(bEl) bEl.innerText = this.billNo;
        
        const dEl = document.getElementById('pur-date');
        if(dEl) dEl.value = new Date().toISOString().split('T')[0];

        // Setup datalists
        this.setupDatalists();
        this.updateUI();
    },

    setupDatalists: function() {
        // Suppliers
        const sList = document.getElementById('supplier-datalist');
        if(sList) {
            const customers = LocalDB.getCustomers() || [];
            sList.innerHTML = customers.map(c => `<option value="${c.name}">${c.phone}</option>`).join('');
        }

        // Products
        const pList = document.getElementById('pur-product-datalist');
        if(pList) {
            const products = LocalDB.getProducts() || [];
            const grouped = {};
            products.forEach(p => {
                const nameKey = p.name.trim();
                if (!grouped[nameKey]) {
                    grouped[nameKey] = { name: p.name, stock: 0 };
                }
                grouped[nameKey].stock += (p.stock || 0);
            });
            pList.innerHTML = Object.values(grouped).map(g => `<option value="${g.name}">Stock: ${g.stock}</option>`).join('');
        }

        // Marks
        const mList = document.getElementById('pur-mark-datalist');
        if(mList) {
            const products = LocalDB.getProducts() || [];
            const marks = [...new Set(products.map(p => p.mark).filter(Boolean))];
            mList.innerHTML = marks.map(m => `<option value="${m}"></option>`).join('');
        }
        
        // Auto fill mrp/cost when product/mark selected
        const autoFill = () => {
            const nameEl = document.getElementById('pur-item-search');
            const markEl = document.getElementById('pur-item-mark');
            const name = nameEl ? nameEl.value.trim() : '';
            const mark = markEl ? markEl.value.trim() : '';
            if(name) {
                const products = LocalDB.getProducts() || [];
                let found = products.find(p => p.name.toLowerCase() === name.toLowerCase() && (p.mark || '').toLowerCase() === mark.toLowerCase());
                if(!found && !mark) {
                    found = products.find(p => p.name.toLowerCase() === name.toLowerCase());
                }
                if(found) {
                    document.getElementById('pur-item-unit').innerText = found.unit || 'KG';
                    document.getElementById('pur-item-rate').value = found.costRate || found.price || 0; 
                    document.getElementById('pur-item-mrp').value = found.price || 0;
                }
            }
        };

        const pSearch = document.getElementById('pur-item-search');
        if(pSearch && !pSearch.dataset.listenerAttached) {
            pSearch.dataset.listenerAttached = 'true';
            pSearch.addEventListener('input', autoFill);
        }

        const mSearch = document.getElementById('pur-item-mark');
        if(mSearch && !mSearch.dataset.listenerAttached) {
            mSearch.dataset.listenerAttached = 'true';
            mSearch.addEventListener('input', autoFill);
        }
    },

    addItem: function() {
        const name = document.getElementById('pur-item-search').value;
        const mark = document.getElementById('pur-item-mark').value.trim();
        const qty = parseFloat(document.getElementById('pur-item-qty').value);
        const rate = parseFloat(document.getElementById('pur-item-rate').value);
        const mrp = parseFloat(document.getElementById('pur-item-mrp').value) || rate; 
        const unit = document.getElementById('pur-item-unit').innerText;

        if(!name || isNaN(qty) || isNaN(rate)) {
            alert("Please fill product details correctly.");
            return;
        }

        const total = qty * rate;

        this.cart.push({
            name: name,
            mark: mark,
            qty: qty,
            unit: unit,
            rate: rate,
            mrp: mrp,
            total: total
        });

        document.getElementById('pur-add-item-form').reset();
        document.getElementById('pur-item-unit').innerText = 'KG';
        document.getElementById('pur-item-search').focus();
        this.updateUI();
    },

    removeItem: function(index) {
        this.cart.splice(index, 1);
        this.updateUI();
    },

    updateUI: function() {
        const tbody = document.getElementById('pur-cart-table');
        if(!tbody) return;

        if(this.cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No items added to purchase yet.</td></tr>';
        } else {
            tbody.innerHTML = this.cart.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="fw-bold">${item.name}<br><small class="text-muted">MRP: ${AppState.settings.currency || '₹'}${item.mrp}</small></td>
                    <td class="text-center fw-semibold text-secondary">${item.mark || '-'}</td>
                    <td class="text-center">${item.qty} ${item.unit}</td>
                    <td class="text-end">${AppState.settings.currency || '₹'}${item.rate.toFixed(2)}</td>
                    <td class="text-end fw-bold text-primary">${AppState.settings.currency || '₹'}${item.total.toFixed(2)}</td>
                    <td class="text-center"><button class="btn btn-sm btn-outline-danger" onclick="PurchaseLogic.removeItem(${index})"><i class="fas fa-times"></i></button></td>
                </tr>
            `).join('');
        }

        this.calcTotals();
    },

    calcTotals: function() {
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const charges = parseFloat(document.getElementById('pur-charges').value || 0);
        const discount = parseFloat(document.getElementById('pur-discount').value || 0);
        
        const netTotal = subtotal + charges - discount;

        document.getElementById('pur-subtotal').innerText = (AppState.settings.currency || '₹') + subtotal.toFixed(2);
        document.getElementById('pur-net-total').innerText = (AppState.settings.currency || '₹') + netTotal.toFixed(2);
        document.getElementById('pur-total-display').innerText = (AppState.settings.currency || '₹') + netTotal.toFixed(2);
        
        this.calcDue();
    },

    setPayment: function(method) {
        this.paymentMethod = method;
        const buttons = [document.getElementById('btn-pur-pay-cash'), document.getElementById('btn-pur-pay-upi'), document.getElementById('btn-pur-pay-credit')];
        buttons.forEach(b => b.classList.remove('active'));
        
        if(method === 'CASH') document.getElementById('btn-pur-pay-cash').classList.add('active');
        if(method === 'UPI') document.getElementById('btn-pur-pay-upi').classList.add('active');
        if(method === 'CREDIT') document.getElementById('btn-pur-pay-credit').classList.add('active');

        const splitBox = document.getElementById('pur-split-box');
        if(method === 'CREDIT') {
            splitBox.classList.remove('d-none');
            // By default 0 paid if credit
            document.getElementById('pur-paid-amount').value = 0;
            this.calcDue();
        } else {
            splitBox.classList.add('d-none');
        }
    },

    calcDue: function() {
        if(this.paymentMethod !== 'CREDIT') return;
        
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const charges = parseFloat(document.getElementById('pur-charges').value || 0);
        const discount = parseFloat(document.getElementById('pur-discount').value || 0);
        const netTotal = subtotal + charges - discount;
        
        const paid = parseFloat(document.getElementById('pur-paid-amount').value) || 0;
        const due = netTotal - paid;
        
        document.getElementById('pur-due-amount').value = due.toFixed(2);
    },

    savePurchase: function() {
        if(this.cart.length === 0) {
            alert("Cannot save empty purchase!");
            return;
        }

        const supplier = document.getElementById('pur-supplier-search').value;
        if(!supplier) {
            alert("Please select or enter a supplier name!");
            return;
        }

        const date = document.getElementById('pur-date').value;
        const vehicle = document.getElementById('pur-vehicle').value;
        const invoice = document.getElementById('pur-invoice-no').value;

        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const charges = parseFloat(document.getElementById('pur-charges').value || 0);
        const discount = parseFloat(document.getElementById('pur-discount').value || 0);
        const netTotal = subtotal + charges - discount;

        let paidAmount = netTotal;
        if(this.paymentMethod === 'CREDIT') {
            paidAmount = parseFloat(document.getElementById('pur-paid-amount').value) || 0;
        }

        // 1. Create Purchase Transaction
        const txnId = this.billNo;
        const txn = {
            id: txnId,
            date: date,
            type: 'OUT',
            method: this.paymentMethod === 'CREDIT' ? 'CASH' : this.paymentMethod, // Payment made out of Cash/UPI
            party: supplier,
            desc: `Purchase ${invoice ? 'Inv: '+invoice : ''} (${vehicle})`,
            amount: paidAmount,
            gross: netTotal,
            charges: charges,
            discount: discount,
            items: [...this.cart],
            isPurchase: true
        };

        // 2. Save Transaction
        let txns = LocalDB.load('transactions') || [];
        txns.unshift(txn);
        LocalDB.save('transactions', txns);
        
        if(typeof db !== 'undefined' && db) {
            db.collection('transactions').doc(txn.id).set(txn);
        }

        // 3. Update Supplier Ledger if Due
        const due = netTotal - paidAmount;
        if(due > 0) {
            let customers = LocalDB.getCustomers() || [];
            let c = customers.find(cust => cust.name.toLowerCase() === supplier.toLowerCase());
            
            if(!c) {
                // Auto create supplier
                c = {
                    id: 'c' + Date.now(),
                    name: supplier,
                    phone: '',
                    type: 'Credit', // Treat as supplier with credit
                    balance: due
                };
                customers.push(c);
            } else {
                c.balance = (c.balance || 0) + due;
            }
            LocalDB.save('customers', customers);
            if(typeof db !== 'undefined' && db) {
                db.collection('customers').doc(c.id).set(c);
            }
        }

        // 4. Update Stock & Products
        let products = LocalDB.getProducts() || [];
        this.cart.forEach(item => {
            let p = products.find(prod => prod.name.toLowerCase() === item.name.toLowerCase() && (prod.mark || '').toLowerCase() === item.mark.toLowerCase());
            if(!p) {
                // Auto create product
                p = {
                    id: 'p' + Date.now() + Math.floor(Math.random()*1000),
                    name: item.name,
                    mark: item.mark,
                    fromWho: supplier,
                    category: 'Purchase',
                    price: item.mrp,
                    costRate: item.rate,
                    unit: item.unit,
                    stock: item.qty,
                    updatedAt: new Date().toISOString()
                };
                products.push(p);
            } else {
                // Update existing
                p.stock = (p.stock || 0) + item.qty;
                p.costRate = item.rate; // Update latest cost rate
                if(item.mrp > 0) p.price = item.mrp; // Update sale price if provided
                p.fromWho = supplier;
                p.updatedAt = new Date().toISOString();
            }
            if(typeof db !== 'undefined' && db) {
                db.collection('products').doc(p.id).set(p);
            }
        });
        LocalDB.save('products', products);

        alert("Purchase Completed Successfully!");
        
        // Reset Terminal
        document.getElementById('pur-supplier-search').value = '';
        document.getElementById('pur-invoice-no').value = '';
        document.getElementById('pur-vehicle').value = '';
        document.getElementById('pur-charges').value = '0';
        document.getElementById('pur-discount').value = '0';
        if(document.getElementById('pur-paid-amount')) document.getElementById('pur-paid-amount').value = '';
        
        this.init();
        app.renderAccounting(); // refresh dashboard totals
    }
};

window.PurchaseLogic = PurchaseLogic;
