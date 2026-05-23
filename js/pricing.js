const PricingLogic = {
    tempRates: {}, // Stores unsaved changes: productId -> {field: value}

    init: function() {
        this.renderBulkRates();
    },

    renderBulkRates: function(searchTerm = '') {
        const tbody = document.getElementById('bulk-rates-table');
        if(!tbody) return;

        const products = LocalDB.getProducts() || [];
        const term = searchTerm.toLowerCase();
        
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.category.toLowerCase().includes(term)
        );

        tbody.innerHTML = filtered.map(p => {
            const markBadge = p.mark ? `<span class="badge bg-warning text-dark fw-bold ms-2">${p.mark}</span>` : '';
            return `
            <tr>
                <td>
                    <div class="fw-bold text-dark d-flex align-items-center">${p.name}${markBadge}</div>
                    <small class="text-muted">${p.unit}</small>
                </td>
                <td><span class="badge bg-secondary text-white">${p.category}</span></td>
                <td>
                    <input type="number" class="form-control form-control-sm text-center fw-bold text-primary" 
                           value="${p.price}" onchange="PricingLogic.trackChange('${p.id}', 'price', this.value)">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm text-center fw-bold text-success" 
                           value="${p.wholesaleRate || 0}" onchange="PricingLogic.trackChange('${p.id}', 'wholesaleRate', this.value)">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm text-center fw-bold text-info" 
                           value="${p.vipRate || 0}" onchange="PricingLogic.trackChange('${p.id}', 'vipRate', this.value)">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm text-center border-danger text-danger" 
                           value="${p.minRate || 0}" onchange="PricingLogic.trackChange('${p.id}', 'minRate', this.value)">
                </td>
            </tr>
            `;
        }).join('');
    },

    filterBulkRates: function(term) {
        this.renderBulkRates(term);
    },

    trackChange: function(id, field, value) {
        if(!this.tempRates[id]) this.tempRates[id] = {};
        this.tempRates[id][field] = parseFloat(value);
    },

    saveAllBulkRates: function() {
        const products = LocalDB.getProducts() || [];
        let updatedCount = 0;

        for(const id in this.tempRates) {
            const product = products.find(p => p.id === id);
            if(product) {
                Object.assign(product, this.tempRates[id]);
                
                // If using Firebase, sync it
                if (typeof db !== 'undefined' && db) {
                    db.collection('products').doc(id).update(this.tempRates[id]);
                }
                updatedCount++;
            }
        }

        if(updatedCount > 0) {
            LocalDB.save('products', products);
            this.tempRates = {};
            alert(`Rates updated for ${updatedCount} products successfully!`);
            this.renderBulkRates();
        } else {
            alert("No changes to save.");
        }
    },

    /**
     * CORE PRICING ENGINE
     * Priority:
     * 1. Customer Special Rate (if still supported)
     * 2. Customer Type Rate (VIP, Dealer, etc.)
     * 3. Product Base Rate (Retail/Walk-in)
     */
    getBestRate: function(customerId, productId) {
        const products = LocalDB.getProducts() || [];
        const customers = LocalDB.getCustomers() || [];
        const specialRates = LocalDB.load('special_rates') || []; // Legacy check

        const prod = products.find(p => p.id === productId);
        const cust = customers.find(c => c.id === customerId);

        if(!prod) return 0;

        // 1. Check Special Rates (Legacy)
        const special = specialRates.find(r => r.customerId === customerId && r.productId === productId);
        if(special) return special.amount;

        // 2. Check Customer Type Rates
        if(cust) {
            const type = cust.type;
            if(type === 'Wholesale' && prod.wholesaleRate) return prod.wholesaleRate;
            if(type === 'VIP' && prod.vipRate) return prod.vipRate;
            if(type === 'Dealer' && prod.dealerRate) return prod.dealerRate;
            if(type === 'Hotel' && prod.wholesaleRate) return prod.wholesaleRate; // Hotels usually get wholesale
        }

        // 3. Fallback to Retail Price (Default for Walk-in)
        return prod.price || 0;
    }
};

window.PricingLogic = PricingLogic;
