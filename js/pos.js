/**
 * V Master Billing - POS Patti Billing & Cart Controller
 * Advanced features: USB Barcode scanning, synthesized sound effects, dynamic UPI QR code, multi-format printing.
 */

const POS = {
    cart: [],
    billNo: 1001,
    paymentMethod: 'cash',
    scannerActive: false,

    init: function() {
        this.billNo = LocalDB.getNextBillNo();
        
        const billNoEl = document.getElementById('pos-bill-no');
        if(billNoEl) billNoEl.innerText = this.billNo;
        
        const dateEl = document.getElementById('pos-date');
        if(dateEl) dateEl.innerText = new Date().toLocaleDateString('en-GB');

        this.loadProducts();
        this.loadCustomers();
        this.populateCategoryFilter();
        this.setupEventListeners();
        this.setupUSBBarcodeScanner();
        this.updateCartUI();
        this.updateHeldCount();
    },

    populateCategoryFilter: function() {
        const filter = document.getElementById('pos-category-filter');
        if(!filter) return;
        const cats = LocalDB.getCategories() || [];
        filter.innerHTML = '<option value="all">All Categories</option>' + 
            cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    },

    setupEventListeners: function() {
        // Product text-search
        const pSearch = document.getElementById('pos-product-search');
        if(pSearch) {
            pSearch.addEventListener('input', (e) => {
                this.loadProducts(e.target.value);
            });
        }

        // Charges input
        const chargesInput = document.getElementById('pos-charges');
        if(chargesInput) {
            chargesInput.addEventListener('input', () => {
                this.calculateTotals();
            });
        }

        // Discount input
        const discountInput = document.getElementById('pos-discount');
        if(discountInput) {
            discountInput.addEventListener('input', () => {
                this.calculateTotals();
            });
        }

        // Customer smart search dropdown
        const cSearch = document.getElementById('pos-customer-search');
        if(cSearch) {
            cSearch.addEventListener('input', (e) => {
                const name = e.target.value;
                const customers = LocalDB.getCustomers() || [];
                const found = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
                if(found) {
                    document.getElementById('pos-customer-id').value = found.id;
                    this.updateCartPrices(); // Recalculate based on wholesale/retail rules
                } else {
                    document.getElementById('pos-customer-id').value = 'c1'; // Fallback Walk-in
                }
            });
        }
    },

    /**
     * USB Barcode Scanner Integration
     * Tracks hardware keystroke intervals (< 40ms per key) to capture USB scanners ending in Enter.
     */
    setupUSBBarcodeScanner: function() {
        let buffer = '';
        let lastKeyTime = Date.now();

        window.addEventListener('keypress', (e) => {
            // Check if focus is in a text input (avoid interrupting normal typing)
            const activeTag = document.activeElement.tagName.toLowerCase();
            const activeId = document.activeElement.id;
            
            // Only bypass input restriction for specific POS fields or if not in normal text area
            if (activeTag === 'textarea' || (activeTag === 'input' && activeId !== 'pos-product-search')) {
                return; // Let standard inputs behave normally
            }

            const now = Date.now();
            if (now - lastKeyTime > 50) {
                buffer = ''; // Slow speed = human typing, clear buffer
            }
            lastKeyTime = now;

            if (e.key === 'Enter') {
                if (buffer.length >= 4) {
                    e.preventDefault();
                    this.handleScannedCode(buffer);
                    buffer = '';
                }
            } else if (e.key.match(/[a-zA-Z0-9]/)) {
                buffer += e.key;
            }
        });
    },

    handleScannedCode: function(code) {
        console.log("Barcode Scanned: ", code);
        const products = LocalDB.getProducts() || [];
        const product = products.find(p => p.barcode === code);

        if(product) {
            this.addToCart(product.id);
            this.playHardwareBeep(true); // High success beep
            
            // Flash a quick search input feedback
            const searchInput = document.getElementById('pos-product-search');
            if (searchInput) {
                searchInput.value = '';
                searchInput.placeholder = `Scanned: ${product.name}`;
                setTimeout(() => { searchInput.placeholder = "Search product or scan barcode (F1)"; }, 1500);
            }
        } else {
            this.playHardwareBeep(false); // Low error buzz
            alert(`Scanned Barcode [${code}] not found in inventory!`);
        }
    },

    /**
     * Synthesizes physical hardware terminal beep using Web Audio API
     */
    playHardwareBeep: function(success) {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            if (success) {
                osc.frequency.value = 1350; // crisp scanner beep
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.08);
            } else {
                osc.frequency.value = 180; // low buzz
                gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.22);
            }
        } catch (e) {
            console.warn("Audio Context beep initialization bypass: ", e);
        }
    },

    toggleCameraScanner: function() {
        const container = document.getElementById('camera-scan-container');
        if(!container) return;
        
        const isHidden = container.classList.contains('d-none');
        if (isHidden) {
            container.classList.remove('d-none');
            this.scannerActive = true;
        } else {
            container.classList.add('d-none');
            this.scannerActive = false;
        }
    },

    simulateScan: function() {
        const mockCode = document.getElementById('camera-mock-code').value || '890101';
        this.handleScannedCode(mockCode);
        document.getElementById('camera-mock-code').value = '';
        this.toggleCameraScanner();
    },

    loadProducts: function(searchTerm = '', category = 'all') {
        const grid = document.getElementById('pos-product-grid');
        if(!grid) return;
        
        let products = LocalDB.getProducts() || [];
        
        if(searchTerm) {
            products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode && p.barcode.includes(searchTerm)));
        }
        
        if(category !== 'all') {
            products = products.filter(p => p.category === category);
        }

        if(products.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="fas fa-search fa-3x mb-3 text-muted opacity-50"></i><br>No products matching search criterion.</div>';
            return;
        }

        grid.innerHTML = products.map(p => {
            const displayColor = p.color || '#0d6efd';
            const displayName = (i18n.currentLang === 'ta' && p.nameTa) ? p.nameTa : p.name;
            const stockVal = p.stock !== undefined ? p.stock : 0;
            
            return `
                <div class="col-6 col-sm-4 col-md-3">
                    <div class="card pos-product-card border-0 shadow-sm text-white" 
                         style="background-color: ${displayColor};"
                         onclick="POS.addToCart('${p.id}')">
                        <div class="card-body p-2 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <small class="text-uppercase text-white-50 fw-bold" style="font-size: 8px;">${p.category}</small>
                                    ${p.mark ? `<span class="badge bg-warning text-dark fw-bold" style="font-size: 9px; padding: 2px 4px;">${p.mark}</span>` : ''}
                                </div>
                                <h6 class="fw-bold mb-1 prod-title-grid">${displayName}</h6>
                                <small class="text-white-50 font-monospace d-block mb-1" style="font-size: 9px;"><i class="fas fa-cubes"></i> Stock: ${stockVal} ${p.unit}</small>
                                ${p.barcode ? `<small class="text-white-50 font-monospace d-block" style="font-size: 9px;"><i class="fas fa-barcode"></i> ${p.barcode}</small>` : ''}
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-2 border-top border-white border-opacity-10 pt-2">
                                <span class="badge bg-white bg-opacity-20 font-monospace">${p.unit}</span>
                                <h5 class="fw-bold mb-0 font-monospace">${AppState.settings.currency || '₹'}${p.price}</h5>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterProducts: function() {
        const filter = document.getElementById('pos-category-filter').value;
        const search = document.getElementById('pos-product-search').value;
        this.loadProducts(search, filter);
    },

    loadCustomers: function() {
        const datalist = document.getElementById('customer-datalist');
        const listGroup = document.getElementById('customer-list');
        const customers = LocalDB.getCustomers() || [];
        
        if(datalist) {
            datalist.innerHTML = customers.map(c => `<option value="${c.name}">`).join('');
        }
        
        if(listGroup) {
            listGroup.innerHTML = customers.map(c => `
                <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2" onclick="POS.selectCustomer('${c.id}', '${c.name}')">
                    <div>
                        <div class="fw-bold text-dark">${c.name}</div>
                        <small class="text-muted font-monospace">${c.phone || 'Walk-in'}</small>
                    </div>
                    <span class="badge bg-info">${c.type}</span>
                </button>
            `).join('');
        }
    },

    filterCustomerList: function(term) {
        const listGroup = document.getElementById('customer-list');
        const customers = LocalDB.getCustomers() || [];
        const filtered = customers.filter(c => 
            c.name.toLowerCase().includes(term.toLowerCase()) || 
            (c.phone && c.phone.includes(term))
        );
        
        if(listGroup) {
            listGroup.innerHTML = filtered.map(c => `
                <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2" onclick="POS.selectCustomer('${c.id}', '${c.name}')">
                    <div>
                        <div class="fw-bold text-dark">${c.name}</div>
                        <small class="text-muted font-monospace">${c.phone || 'Walk-in'}</small>
                    </div>
                    <span class="badge bg-info">${c.type}</span>
                </button>
            `).join('');
        }
    },

    selectCustomer: function(id, name) {
        document.getElementById('pos-customer-id').value = id;
        document.getElementById('pos-customer-search').value = name;
        this.updateCartPrices();
        
        const modalEl = document.getElementById('customerModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
    },

    updateCartPrices: function() {
        const custId = document.getElementById('pos-customer-id').value;
        this.cart.forEach(item => {
            item.price = PricingLogic.getBestRate(custId, item.id);
            item.total = item.qty * item.price;
        });
        this.updateCartUI();
    },

    quickAddCustomer: function() {
        const name = document.getElementById('quick-cust-name').value;
        const mobile = document.getElementById('quick-cust-mobile').value;
        const type = document.getElementById('quick-cust-type').value;

        if(!name || !mobile) {
            alert("Name and Mobile are required!");
            return;
        }

        const newCust = {
            id: 'c' + Date.now(),
            name: name,
            phone: mobile,
            type: type,
            balance: 0
        };

        const customers = LocalDB.getCustomers() || [];
        customers.push(newCust);
        LocalDB.save('customers', customers);

        if(typeof db !== 'undefined' && db) {
            db.collection('customers').doc(newCust.id).set(newCust);
        }

        this.selectCustomer(newCust.id, newCust.name);
        this.loadCustomers();

        document.getElementById('quick-cust-name').value = '';
        document.getElementById('quick-cust-mobile').value = '';
        
        alert("New Customer Added & Selected!");
    },

    addToCart: function(productId) {
        const products = LocalDB.getProducts() || [];
        const product = products.find(p => p.id === productId);
        if(!product) return;

        const custId = document.getElementById('pos-customer-id').value;
        const bestRate = PricingLogic.getBestRate(custId, productId);

        const existing = this.cart.find(i => i.id === productId);
        if(existing) {
            existing.qty += 1;
            existing.total = existing.qty * existing.price;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                nameTa: product.nameTa || '',
                price: bestRate,
                qty: 1,
                unit: product.unit,
                total: bestRate,
                mark: product.mark || ''
            });
        }
        this.updateCartUI();
    },

    updateItem: function(index, field, value) {
        const val = parseFloat(value);
        if(isNaN(val) || val <= 0) return;

        if(field === 'qty') {
            this.cart[index].qty = val;
        } else if(field === 'price') {
            this.cart[index].price = val;
        }
        
        this.cart[index].total = this.cart[index].qty * this.cart[index].price;
        this.calculateTotals();
    },

    updateItemMark: function(index, value) {
        if(this.cart[index]) {
            this.cart[index].mark = value;
        }
    },

    removeItem: function(index) {
        this.cart.splice(index, 1);
        this.updateCartUI();
    },

    clearCart: function() {
        if(confirm('Clear current bill?')) {
            this.cart = [];
            document.getElementById('pos-customer-id').value = 'c1';
            document.getElementById('pos-customer-search').value = '';
            document.getElementById('pos-charges').value = 0;
            document.getElementById('pos-discount').value = 0;
            this.updateCartUI();
        }
    },

    holdBill: function() {
        if(this.cart.length === 0) {
            alert("Nothing to hold!");
            return;
        }

        const heldData = {
            id: 'h' + Date.now(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            customerId: document.getElementById('pos-customer-id').value,
            customerName: document.getElementById('pos-customer-search').value || 'Walk-in',
            items: [...this.cart],
            charges: parseFloat(document.getElementById('pos-charges').value) || 0,
            discount: parseFloat(document.getElementById('pos-discount').value) || 0,
            total: (this.cart.reduce((sum, item) => sum + item.total, 0) + (parseFloat(document.getElementById('pos-charges').value) || 0)) - (parseFloat(document.getElementById('pos-discount').value) || 0)
        };

        let heldBills = LocalDB.load('held_bills') || [];
        heldBills.push(heldData);
        LocalDB.save('held_bills', heldBills);

        this.cart = [];
        document.getElementById('pos-charges').value = 0;
        document.getElementById('pos-discount').value = 0;
        document.getElementById('pos-customer-id').value = 'c1';
        document.getElementById('pos-customer-search').value = '';
        
        this.updateCartUI();
        this.updateHeldCount();
        alert("Bill placed on hold!");
    },

    showHeldBills: function() {
        const heldBills = LocalDB.load('held_bills') || [];
        const list = document.getElementById('held-bills-list');
        if(!list) return;

        if(heldBills.length === 0) {
            list.innerHTML = '<li class="list-group-item text-center py-4 text-muted">No held bills found.</li>';
        } else {
            list.innerHTML = heldBills.map((b, index) => `
                <li class="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div>
                        <div class="fw-bold">${b.customerName}</div>
                        <small class="text-muted">${b.time} | ${b.items.length} items | ${AppState.settings.currency || '₹'}${b.total.toFixed(2)}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary me-1" onclick="POS.recallBill(${index})"><i class="fas fa-play"></i> Resume</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="POS.deleteHeldBill(${index})"><i class="fas fa-times"></i></button>
                    </div>
                </li>
            `).join('');
        }

        new bootstrap.Modal(document.getElementById('heldBillsModal')).show();
    },

    recallBill: function(index) {
        let heldBills = LocalDB.load('held_bills') || [];
        const bill = heldBills[index];
        if(!bill) return;

        this.cart = bill.items;
        document.getElementById('pos-customer-id').value = bill.customerId;
        document.getElementById('pos-customer-search').value = bill.customerName;
        document.getElementById('pos-charges').value = bill.charges;
        document.getElementById('pos-discount').value = bill.discount;

        heldBills.splice(index, 1);
        LocalDB.save('held_bills', heldBills);

        this.updateCartUI();
        this.updateHeldCount();
        
        const modalEl = document.getElementById('heldBillsModal');
        if(modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if(modal) modal.hide();
        }
    },

    deleteHeldBill: function(index) {
        if(confirm("Discard this held bill?")) {
            let heldBills = LocalDB.load('held_bills') || [];
            heldBills.splice(index, 1);
            LocalDB.save('held_bills', heldBills);
            this.showHeldBills();
            this.updateHeldCount();
        }
    },

    updateHeldCount: function() {
        const heldBills = LocalDB.load('held_bills') || [];
        const el = document.getElementById('held-count');
        if(el) el.innerText = heldBills.length;
    },

    updateCartUI: function() {
        const tbody = document.getElementById('pos-cart-items');
        if(!tbody) return;

        if(this.cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Cart is empty. Select products (F1) or scan barcodes.</td></tr>';
            this.calculateTotals();
            return;
        }

        tbody.innerHTML = this.cart.map((item, index) => {
            const displayName = (i18n.currentLang === 'ta' && item.nameTa) ? item.nameTa : item.name;
            return `
                <tr>
                    <td class="align-middle fw-bold">
                        ${displayName}
                        <br><small class="text-muted font-monospace">${item.unit}</small>
                    </td>
                    <td class="align-middle">
                        <input type="text" class="form-control form-control-sm text-center font-monospace" 
                               value="${item.mark || ''}" placeholder="-"
                               onchange="POS.updateItemMark(${index}, this.value)">
                    </td>
                    <td>
                        <input type="number" class="form-control form-control-sm text-center font-monospace" 
                               value="${item.qty}" min="0.01" step="0.01" 
                               onchange="POS.updateItem(${index}, 'qty', this.value)">
                    </td>
                    <td>
                        <input type="number" class="form-control form-control-sm text-end font-monospace" 
                               value="${item.price}" min="0" step="0.01" 
                               onchange="POS.updateItem(${index}, 'price', this.value)">
                    </td>
                    <td class="text-end fw-bold align-middle font-monospace text-primary">${AppState.settings.currency || '₹'}${item.total.toFixed(2)}</td>
                    <td class="text-center align-middle">
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="POS.removeItem(${index})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        this.calculateTotals();
    },

    calculateTotals: function() {
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const charges = parseFloat(document.getElementById('pos-charges')?.value || 0);
        const discount = parseFloat(document.getElementById('pos-discount')?.value || 0);
        const total = (subtotal + charges) - discount;

        const subEl = document.getElementById('pos-subtotal');
        const totEl = document.getElementById('pos-total');
        const ptotEl = document.getElementById('payment-amount-display');
        
        if(subEl) subEl.innerText = (AppState.settings.currency || '₹') + subtotal.toFixed(2);
        if(totEl) totEl.innerText = (AppState.settings.currency || '₹') + total.toFixed(2);
        if(ptotEl) ptotEl.innerText = (AppState.settings.currency || '₹') + total.toFixed(2);
    },

    payAndPrint: function() {
        if(this.cart.length === 0) {
            alert("Cart is empty!");
            return;
        }
        
        // Setup initial splits cash/upi
        const total = (this.cart.reduce((sum, item) => sum + item.total, 0) + (parseFloat(document.getElementById('pos-charges')?.value || 0))) - (parseFloat(document.getElementById('pos-discount')?.value || 0));
        
        const splitCash = document.getElementById('split-cash');
        const splitUpi = document.getElementById('split-upi');
        if (splitCash) splitCash.value = (total / 2).toFixed(2);
        if (splitUpi) splitUpi.value = (total / 2).toFixed(2);

        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
    },

    setPaymentMethod: function(method) {
        this.paymentMethod = method;
        
        const cardParent = document.getElementById('paymentModal');
        const buttons = cardParent.querySelectorAll('#btn-pay-cash, #btn-pay-upi, #btn-pay-split, #btn-pay-credit');
        buttons.forEach(b => b.classList.remove('active'));
        
        const clickedBtn = document.getElementById('btn-pay-' + method);
        if(clickedBtn) clickedBtn.classList.add('active');
        
        const splitInputs = document.getElementById('split-payment-inputs');
        if(method === 'split') {
            if(splitInputs) splitInputs.classList.remove('d-none');
        } else {
            if(splitInputs) splitInputs.classList.add('d-none');
        }

        // Validate credit party selection
        if(method === 'credit') {
            const customerId = document.getElementById('pos-customer-id').value;
            if(customerId === 'c1') {
                alert("CREDIT Sales require a registered Customer ledger! Please select or add a Customer.");
                const cModal = new bootstrap.Modal(document.getElementById('customerModal'));
                cModal.show();
            }
        }
    },
    
    calcSplit: function(source) {
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const charges = parseFloat(document.getElementById('pos-charges').value || 0);
        const discount = parseFloat(document.getElementById('pos-discount').value || 0);
        const total = (subtotal + charges) - discount;
        
        const cashInput = document.getElementById('split-cash');
        const upiInput = document.getElementById('split-upi');
        
        let cash = parseFloat(cashInput.value) || 0;
        
        if(source === 'cash') {
            upiInput.value = (total - cash).toFixed(2);
        } else if(source === 'upi') {
            let upi = parseFloat(upiInput.value) || 0;
            cashInput.value = (total - upi).toFixed(2);
        }
    },

    finalizePrint: function() {
        const customerId = document.getElementById('pos-customer-id').value;
        const customerName = document.getElementById('pos-customer-search').value || 'Walk-in Customer';
        
        if(this.paymentMethod === 'credit' && customerId === 'c1') {
            alert("CREDIT bills cannot be created under Walk-in accounts!");
            return;
        }

        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const charges = parseFloat(document.getElementById('pos-charges').value || 0);
        const discount = parseFloat(document.getElementById('pos-discount').value || 0);
        const total = (subtotal + charges) - discount;

        let splitCash = 0;
        let splitUpi = 0;
        if(this.paymentMethod === 'split') {
            splitCash = parseFloat(document.getElementById('split-cash').value) || 0;
            splitUpi = parseFloat(document.getElementById('split-upi').value) || 0;
        }

        const bill = {
            billNo: this.billNo,
            date: new Date().toLocaleDateString('en-GB'),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            customerId: customerId,
            customerName: customerName,
            items: [...this.cart],
            subtotal: subtotal,
            charges: charges,
            discount: discount,
            total: total,
            paymentMethod: this.paymentMethod,
            splitCash: splitCash,
            splitUpi: splitUpi
        };

        // Save Bill offline to Cache & sync
        LocalDB.addBill(bill);

        // Generate Print Format
        this.printReceipt(bill);

        // Close Payment Dialog
        const modalEl = document.getElementById('paymentModal');
        if(modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if(modal) modal.hide();
        }

        // Reset Cart State
        this.cart = [];
        this.billNo = LocalDB.getNextBillNo();
        
        const billNoEl = document.getElementById('pos-bill-no');
        if (billNoEl) billNoEl.innerText = this.billNo;
        
        document.getElementById('pos-customer-id').value = 'c1';
        document.getElementById('pos-customer-search').value = '';
        document.getElementById('pos-charges').value = 0;
        document.getElementById('pos-discount').value = 0;
        
        this.updateCartUI();
    },

    /**
     * Builds premium print pages using a popup window.
     * Handles 80mm/58mm Thermal and full A4 Invoice formats.
     */
    printReceipt: function(bill) {
        const size = AppState.settings.thermalSize || '80mm';
        const thermalFont = AppState.settings.thermalFont || 'Courier New';
        const invoiceFont = AppState.settings.invoiceFont || 'Arial';
        const currencySymbol = AppState.settings.currency || '₹';

        const shop = AppState.settings.shopName || localStorage.getItem('vmaster_shop_name') || 'V MASTER BILLING';
        const addr = AppState.settings.address || localStorage.getItem('vmaster_shop_addr') || 'City Wholesale Bazaar, Block D';
        const phone = AppState.settings.phone ? `Ph: ${AppState.settings.phone}${AppState.settings.gstin ? ' | GSTIN: ' + AppState.settings.gstin : ''}` : (localStorage.getItem('vmaster_shop_phone') || 'Ph: +91-9876543210 | GSTIN: 33ABCDE1234F1Z5');

        const upiId = AppState.settings.upiId || 'vmaster@upi';
        const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shop)}&am=${bill.total.toFixed(2)}&tn=Bill-${bill.billNo}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(upiUrl)}`;
        const qrImageSrc = AppState.settings.upiQrBase64 || qrUrl;

        const lang = (typeof i18n !== 'undefined') ? i18n.currentLang : 'en';

        // Helper function for inline mock barcode
        const generateBarcodeSVG = (code) => {
            const defaultCode = code || "123456789012";
            let lines = '';
            let x = 10;
            for (let i = 0; i < defaultCode.length; i++) {
                const charCode = defaultCode.charCodeAt(i);
                const widths = [(charCode % 2) + 1, ((charCode >> 1) % 2) + 1, ((charCode >> 2) % 2) + 1];
                widths.forEach((w, idx) => {
                    lines += `<rect x="${x}" y="5" width="${w}" height="30" fill="black" stroke="none" />`;
                    x += w + (idx % 2 === 0 ? 1 : 2);
                });
            }
            return `<svg width="${x + 10}" height="50" style="background:white;padding:3px;" xmlns="http://www.w3.org/2000/svg">
                ${lines}
                <text x="${(x + 10) / 2}" y="45" font-family="monospace" font-size="9" text-anchor="middle" fill="black">${defaultCode}</text>
            </svg>`;
        };

        let bodyHtml = '';

        if (size === 'A4') {
            const itemRows = bill.items.map((item, idx) => {
                const name = (lang === 'ta' && item.nameTa) ? item.nameTa : item.name;
                return `<tr>
                    <td>${idx + 1}</td>
                    <td><strong>${name}</strong></td>
                    <td style="text-align:center;font-family:monospace">${item.mark || '-'}</td>
                    <td style="text-align:center;font-family:monospace">${item.qty} ${item.unit}</td>
                    <td style="text-align:right;font-family:monospace">${currencySymbol}${item.price.toFixed(2)}</td>
                    <td style="text-align:right;font-family:monospace;font-weight:700;color:#1d4ed8">${currencySymbol}${item.total.toFixed(2)}</td>
                </tr>`;
            }).join('');

            // Logo sections
            let a4LogoSection = '';
            if (AppState.settings.headerLogoBase64) {
                a4LogoSection = `<div style="margin-bottom:15px;"><img src="${AppState.settings.headerLogoBase64}" style="max-height:85px; max-width:100%; object-fit:contain;" /></div>`;
            } else if (AppState.settings.logoBase64) {
                a4LogoSection = `
                <div style="display:flex; align-items:center; gap:15px;">
                  <img src="${AppState.settings.logoBase64}" style="max-height:65px; max-width:65px; object-fit:contain; border-radius:4px;" />
                  <div>
                    <h2 style="font-size:26px;font-weight:800;color:#1e40af;margin:0 0 5px">${shop}</h2>
                    <p style="margin:0;color:#555;font-size:12px">${addr}</p>
                    <p style="margin:0;color:#555;font-size:12px;font-family:monospace;font-weight:700">${phone}</p>
                  </div>
                </div>`;
            } else {
                a4LogoSection = `
                <div>
                  <h2 style="font-size:26px;font-weight:800;color:#1e40af;margin:0 0 5px">${shop}</h2>
                  <p style="margin:0;color:#555;font-size:12px">${addr}</p>
                  <p style="margin:0;color:#555;font-size:12px;font-family:monospace;font-weight:700">${phone}</p>
                </div>`;
            }

            // GST Row Computations
            let gstRowsHtml = '';
            if (AppState.settings.gstEnabled) {
                const customers = LocalDB.getCustomers() || [];
                const customer = customers.find(c => c.id === bill.customerId);
                const custGstin = customer ? customer.gstin : '';
                const shopGstin = AppState.settings.gstin || '';
                let isInterstate = false;
                if (custGstin && shopGstin) {
                    const custStateCode = custGstin.substring(0, 2);
                    const shopStateCode = shopGstin.substring(0, 2);
                    if (custStateCode !== shopStateCode) {
                        isInterstate = true;
                    }
                }

                if (isInterstate) {
                    const igstPercent = AppState.settings.igstPercent !== undefined ? AppState.settings.igstPercent : 5.0;
                    const igstAmount = bill.subtotal * (igstPercent / 100);
                    gstRowsHtml = `<tr><td style="color:#64748b;padding:6px 0;border-bottom:1px solid #e2e8f0">IGST (${igstPercent}%):</td><td style="font-family:monospace;font-weight:700;padding:6px 0;border-bottom:1px solid #e2e8f0">${currencySymbol}${igstAmount.toFixed(2)}</td></tr>`;
                } else {
                    const cgstPercent = AppState.settings.cgstPercent !== undefined ? AppState.settings.cgstPercent : 2.5;
                    const sgstPercent = AppState.settings.sgstPercent !== undefined ? AppState.settings.sgstPercent : 2.5;
                    const cgstAmount = bill.subtotal * (cgstPercent / 100);
                    const sgstAmount = bill.subtotal * (sgstPercent / 100);
                    gstRowsHtml = `
                        <tr><td style="color:#64748b;padding:6px 0;border-bottom:1px solid #e2e8f0">CGST (${cgstPercent}%):</td><td style="font-family:monospace;font-weight:700;padding:6px 0;border-bottom:1px solid #e2e8f0">${currencySymbol}${cgstAmount.toFixed(2)}</td></tr>
                        <tr><td style="color:#64748b;padding:6px 0;border-bottom:1px solid #e2e8f0">SGST (${sgstPercent}%):</td><td style="font-family:monospace;font-weight:700;padding:6px 0;border-bottom:1px solid #e2e8f0">${currencySymbol}${sgstAmount.toFixed(2)}</td></tr>
                    `;
                }
            }

            // QR Code HTML
            const qrCodeHtml = AppState.settings.qrOnBill ? `
              <div style="display:flex;align-items:center;gap:10px;background:#f8fafc;padding:10px;border:1px solid #e2e8f0;border-radius:6px;width:240px">
                <img src="${qrImageSrc}" width="80" height="80" style="border:1px solid #e2e8f0; object-fit:contain;" alt="UPI QR">
                <div>
                  <strong style="color:#16a34a;font-size:12px">&#9654; SCAN &amp; PAY UPI</strong>
                  <p style="font-size:9px;color:#555;margin:3px 0 0">Scan to settle ${currencySymbol}${bill.total.toFixed(2)} instantly.</p>
                </div>
              </div>
            ` : '';

            // Terms List
            const termsList = (AppState.settings.terms || '1. Goods once sold will not be returned or exchanged.\n2. Please settle pending outstanding within due limits.')
                .split('\n')
                .filter(t => t.trim() !== '')
                .map(t => `<p style="margin:0 0 4px">${t}</p>`)
                .join('');
            
            const returnPolicyHtml = AppState.settings.returnPolicy ? `<p style="margin:6px 0 4px"><strong>Return Policy:</strong> ${AppState.settings.returnPolicy}</p>` : '';
            
            const bankName = AppState.settings.bankName || 'V-Bank Ltd';
            const bankIfsc = AppState.settings.bankIfsc || 'VBNK000101';
            const bankAccount = AppState.settings.bankAccount || '98765432101';
            const bankDetailsHtml = `<p style="margin:0 0 10px">Bank: ${bankName} | IFSC: ${bankIfsc} | A/c: ${bankAccount}</p>`;

            bodyHtml = `
            <div style="width:210mm;min-height:297mm;padding:15mm;box-sizing:border-box;font-size:13px;line-height:1.45;font-family:${invoiceFont},sans-serif">
              <div style="display:flex;justify-content:space-between;border-bottom:2px solid #333;padding-bottom:15px;margin-bottom:20px">
                ${a4LogoSection}
                <div style="text-align:right">
                  <h1 style="font-size:28px;font-weight:900;color:#64748b;margin:0 0 5px">INVOICE</h1>
                  <p style="margin:0;font-family:monospace"><strong>Invoice No:</strong> ${AppState.settings.invoicePrefix || 'INV-'}${bill.billNo}</p>
                  <p style="margin:0;font-family:monospace"><strong>Date:</strong> ${bill.date} | ${bill.time}</p>
                  ${AppState.settings.barcodeOnInvoice ? `<div style="margin-top:8px; display:inline-block;">${generateBarcodeSVG((AppState.settings.invoicePrefix || 'INV-') + bill.billNo)}</div>` : ''}
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:25px">
                <div style="border:1px solid #cbd5e1;padding:12px;border-radius:6px">
                  <h6 style="font-weight:700;margin:0 0 6px;text-transform:uppercase;font-size:11px;color:#64748b">Billed To:</h6>
                  <h5 style="font-weight:800;color:#1e40af;margin:0 0 4px">${bill.customerName}</h5>
                  <p style="font-size:11px;color:#555;margin:0">Customer ID: ${bill.customerId}</p>
                </div>
                <div style="border:1px solid #cbd5e1;padding:12px;border-radius:6px">
                  <h6 style="font-weight:700;margin:0 0 6px;text-transform:uppercase;font-size:11px;color:#64748b">Payment Details:</h6>
                  <p style="margin:0;font-family:monospace"><strong>Method:</strong> ${bill.paymentMethod.toUpperCase()}</p>
                  ${bill.paymentMethod === 'split' ? `<p style="font-size:11px;color:#555;margin:0;font-family:monospace">Cash: ${currencySymbol}${bill.splitCash} | UPI: ${currencySymbol}${bill.splitUpi}</p>` : ''}
                </div>
              </div>
              <table style="width:100%;border-collapse:collapse;margin-bottom:25px">
                <thead>
                  <tr>
                    <th style="background:#f1f5f9;border:1px solid #cbd5e1;padding:10px;text-align:left;width:6%">#</th>
                    <th style="background:#f1f5f9;border:1px solid #cbd5e1;padding:10px;text-align:left">Item Particulars</th>
                    <th style="background:#f1f5f9;border:1px solid #cbd5e1;padding:10px;text-align:center;width:10%">Mark</th>
                    <th style="background:#f1f5f9;border:1px solid #cbd5e1;padding:10px;text-align:center;width:14%">Quantity</th>
                    <th style="background:#f1f5f9;border:1px solid #cbd5e1;padding:10px;text-align:right;width:16%">Unit Price</th>
                    <th style="background:#f1f5f9;border:1px solid #cbd5e1;padding:10px;text-align:right;width:16%">Item Total</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
              <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:40px;margin-bottom:40px">
                <div style="font-size:11px;color:#64748b">
                  <h6 style="font-weight:700;margin:0 0 6px">Terms &amp; Bank Details:</h6>
                  ${termsList}
                  ${returnPolicyHtml}
                  ${bankDetailsHtml}
                  ${qrCodeHtml}
                </div>
                <div style="text-align:right">
                  <table style="width:100%;border-collapse:collapse">
                    <tr><td style="color:#64748b;padding:6px 0;border-bottom:1px solid #e2e8f0">Subtotal:</td><td style="font-family:monospace;font-weight:700;padding:6px 0;border-bottom:1px solid #e2e8f0">${currencySymbol}${bill.subtotal.toFixed(2)}</td></tr>
                    ${gstRowsHtml}
                    <tr><td style="color:#64748b;padding:6px 0;border-bottom:1px solid #e2e8f0">Coolie / Charges (+):</td><td style="font-family:monospace;font-weight:700;color:#dc2626;padding:6px 0;border-bottom:1px solid #e2e8f0">${currencySymbol}${bill.charges.toFixed(2)}</td></tr>
                    <tr><td style="color:#64748b;padding:6px 0;border-bottom:1px solid #e2e8f0">Discount (-):</td><td style="font-family:monospace;font-weight:700;color:#16a34a;padding:6px 0;border-bottom:1px solid #e2e8f0">${currencySymbol}${bill.discount.toFixed(2)}</td></tr>
                    <tr><td style="font-weight:700;color:#1e40af;padding:8px 0;font-size:16px;border-bottom:4px double #1e40af">Grand Total:</td><td style="font-family:monospace;font-weight:800;color:#1e40af;padding:8px 0;font-size:16px;border-bottom:4px double #1e40af">${currencySymbol}${bill.total.toFixed(2)}</td></tr>
                  </table>
                </div>
              </div>
              <div style="text-align:center; margin-top:20px; font-size:11px; color:#64748b; border-top:1px dashed #cbd5e1; padding-top:10px;">
                ${AppState.settings.footerMessage || '*** Thank You! Visit Again ***'}
              </div>
              <div style="display:flex;justify-content:space-between;border-top:1px solid #e2e8f0;padding-top:20px;margin-top:30px">
                <div style="text-align:center;width:200px"><div style="border-bottom:1px solid #000;height:40px;margin-bottom:5px"></div><span style="font-size:12px;color:#555">Customer Signature</span></div>
                <div style="text-align:center;width:200px"><div style="border-bottom:1px solid #000;height:40px;margin-bottom:5px"></div><span style="font-size:12px;font-weight:700">Authorized Signatory</span></div>
              </div>
            </div>`;

        } else {
            const w = size === '58mm' ? '58mm' : '80mm';
            const fs = size === '58mm' ? '10px' : '11px';
            const itemRows = bill.items.map(item => {
                const name = (lang === 'ta' && item.nameTa) ? item.nameTa : item.name;
                const markText = item.mark ? ` [${item.mark}]` : '';
                return `<tr>
                    <td style="text-align:left;font-weight:700">${name}${markText}</td>
                    <td style="text-align:center">${item.qty}</td>
                    <td style="text-align:right">${item.price}</td>
                    <td style="text-align:right;font-weight:700">${currencySymbol}${item.total.toFixed(2)}</td>
                </tr>`;
            }).join('');

            // Logo sections
            let thermalLogoHtml = '';
            if (AppState.settings.logoBase64) {
                thermalLogoHtml = `<div style="text-align:center; margin-bottom:8px;"><img src="${AppState.settings.logoBase64}" style="max-height:55px; max-width:120px; object-fit:contain;" /></div>`;
            } else if (AppState.settings.headerLogoBase64) {
                thermalLogoHtml = `<div style="text-align:center; margin-bottom:8px;"><img src="${AppState.settings.headerLogoBase64}" style="max-height:55px; max-width:160px; object-fit:contain;" /></div>`;
            }

            // GST Calculations for Thermal
            let thermalGstRowsHtml = '';
            if (AppState.settings.gstEnabled) {
                const customers = LocalDB.getCustomers() || [];
                const customer = customers.find(c => c.id === bill.customerId);
                const custGstin = customer ? customer.gstin : '';
                const shopGstin = AppState.settings.gstin || '';
                let isInterstate = false;
                if (custGstin && shopGstin) {
                    const custStateCode = custGstin.substring(0, 2);
                    const shopStateCode = shopGstin.substring(0, 2);
                    if (custStateCode !== shopStateCode) {
                        isInterstate = true;
                    }
                }

                if (isInterstate) {
                    const igstPercent = AppState.settings.igstPercent !== undefined ? AppState.settings.igstPercent : 5.0;
                    const igstAmount = bill.subtotal * (igstPercent / 100);
                    thermalGstRowsHtml = `<tr><td>IGST (${igstPercent}%):</td><td style="font-weight:700">${currencySymbol}${igstAmount.toFixed(2)}</td></tr>`;
                } else {
                    const cgstPercent = AppState.settings.cgstPercent !== undefined ? AppState.settings.cgstPercent : 2.5;
                    const sgstPercent = AppState.settings.sgstPercent !== undefined ? AppState.settings.sgstPercent : 2.5;
                    const cgstAmount = bill.subtotal * (cgstPercent / 100);
                    const sgstAmount = bill.subtotal * (sgstPercent / 100);
                    thermalGstRowsHtml = `
                        <tr><td>CGST (${cgstPercent}%):</td><td style="font-weight:700">${currencySymbol}${cgstAmount.toFixed(2)}</td></tr>
                        <tr><td>SGST (${sgstPercent}%):</td><td style="font-weight:700">${currencySymbol}${sgstAmount.toFixed(2)}</td></tr>
                    `;
                }
            }

            // QR Code section
            const thermalQrCodeHtml = AppState.settings.qrOnBill ? `
              <div style="margin:10px auto;text-align:center">
                <img src="${qrImageSrc}" width="95" height="95" style="border:1px solid #e2e8f0;padding:4px;background:#fff;object-fit:contain;" alt="Scan Pay">
                <div style="font-weight:700;color:#16a34a;font-size:11px;margin-top:4px">&#9654; SCAN &amp; PAY BHIM UPI</div>
              </div>
            ` : '';

            // Terms
            const thermalTermsList = (AppState.settings.terms || '')
                .split('\n')
                .filter(t => t.trim() !== '')
                .map(t => `<p style="margin:2px 0">${t}</p>`)
                .join('');
            const thermalReturnPolicyHtml = AppState.settings.returnPolicy ? `<p style="margin:2px 0"><strong>Return Policy:</strong> ${AppState.settings.returnPolicy}</p>` : '';

            bodyHtml = `
            <div style="width:${w};font-size:${fs};font-family:${thermalFont},monospace;text-align:center;padding:4px">
              ${thermalLogoHtml}
              <h3 style="font-size:15px;font-weight:800;margin:3px 0">${shop}</h3>
              <p style="margin:2px 0">${addr}</p>
              <p style="margin:2px 0">${phone}</p>
              <hr style="border:none;border-top:1px dashed #000;margin:6px 0">
              <p style="text-align:left;margin:2px 0;font-family:monospace"><strong>Bill No:</strong> ${AppState.settings.invoicePrefix || 'INV-'}${bill.billNo}</p>
              <p style="text-align:left;margin:2px 0;font-family:monospace"><strong>Date:</strong> ${bill.date} ${bill.time}</p>
              <p style="text-align:left;margin:2px 0;font-family:monospace"><strong>Party:</strong> ${bill.customerName}</p>
              <hr style="border:none;border-top:1px dashed #000;margin:6px 0">
              <table style="width:100%;border-collapse:collapse">
                <thead><tr>
                  <th style="text-align:left;border-bottom:1px dashed #000;border-top:1px dashed #000;padding:4px 0">Item</th>
                  <th style="text-align:center;border-bottom:1px dashed #000;border-top:1px dashed #000;padding:4px 0;width:20%">Qty</th>
                  <th style="text-align:right;border-bottom:1px dashed #000;border-top:1px dashed #000;padding:4px 0;width:22%">Rate</th>
                  <th style="text-align:right;border-bottom:1px dashed #000;border-top:1px dashed #000;padding:4px 0;width:28%">Total</th>
                </tr></thead>
                <tbody>${itemRows}</tbody>
              </table>
              <hr style="border:none;border-top:1px dashed #000;margin:6px 0">
              <table style="width:100%;text-align:right">
                <tr><td>Subtotal:</td><td style="font-weight:700;width:45%">${currencySymbol}${bill.subtotal.toFixed(2)}</td></tr>
                ${thermalGstRowsHtml}
                <tr><td>Coolie / Charges (+):</td><td style="font-weight:700;color:#dc2626">${currencySymbol}${bill.charges.toFixed(2)}</td></tr>
                <tr><td>Discount (-):</td><td style="font-weight:700;color:#16a34a">${currencySymbol}${bill.discount.toFixed(2)}</td></tr>
                <tr style="font-size:13px"><td style="font-weight:700">Grand Total:</td><td style="font-weight:800;color:#1d4ed8">${currencySymbol}${bill.total.toFixed(2)}</td></tr>
              </table>
              ${thermalQrCodeHtml}
              ${thermalTermsList ? `<hr style="border:none;border-top:1px dashed #000;margin:6px 0">${thermalTermsList}` : ''}
              ${thermalReturnPolicyHtml ? `<div style="margin:4px 0">${thermalReturnPolicyHtml}</div>` : ''}
              <hr style="border:none;border-top:1px dashed #000;margin:6px 0">
              <p style="margin:6px 0 2px;text-align:center">${AppState.settings.footerMessage || '*** Thank You! Visit Again ***'}</p>
            </div>`;
        }

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Bill #${bill.billNo} - ${shop}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; color: #000; }
  @media print {
    body { margin: 0; }
    @page { margin: 0; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="no-print" style="position:fixed;top:10px;right:10px;z-index:9999;">
  <button onclick="window.close()" style="background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:4px;font-weight:bold;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.2);font-family:sans-serif;">Close Window</button>
</div>
${bodyHtml}
<script>
  window.onafterprint = function() { window.close(); };
  window.addEventListener('afterprint', function() { window.close(); });
  setTimeout(function() {
    window.print();
    setTimeout(function() { window.close(); }, 500);
  }, 300);
<\/script>
</body>
</html>`;

        const w = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
        if (w) {
            w.document.write(fullHtml);
            w.document.close();
        } else {
            alert('Please allow popups for this site to print bills.');
        }
    }
};

window.POS = POS;

