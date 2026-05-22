const ExpenseLogic = {
    init: function() {
        const dEl = document.getElementById('exp-date');
        if(dEl) dEl.value = new Date().toISOString().split('T')[0];
        
        // Gen Voucher
        const txns = LocalDB.load('transactions') || [];
        const expTxns = txns.filter(t => t.id && t.id.startsWith('EXP'));
        const voucher = 'EXP-' + (1001 + expTxns.length);
        
        const vEl = document.getElementById('exp-voucher');
        if(vEl) vEl.value = voucher;

        this.updateUI();
    },

    saveExpense: function() {
        const date = document.getElementById('exp-date').value;
        const voucher = document.getElementById('exp-voucher').value;
        const category = document.getElementById('exp-category').value;
        const title = document.getElementById('exp-title').value;
        const vendor = document.getElementById('exp-vendor').value;
        const amount = parseFloat(document.getElementById('exp-amount').value);
        const method = document.getElementById('exp-method').value;

        if(!category || !title || isNaN(amount) || amount <= 0) {
            alert("Please fill all required fields with valid amounts!");
            return;
        }

        // Create Expense Transaction
        const txn = {
            id: voucher,
            date: date,
            type: 'OUT',
            method: method === 'CREDIT' ? 'CASH' : method, // Treat credit as Cash out in ledger when settled, or pending? 
            // Wait, if it's CREDIT, it means we haven't paid. So actual cash flow is 0 right now.
            // But we need to record the expense. We will record amount=0 in cash book, or don't put in cash book if not paid.
            // Let's standardise: transactions array handles cash book entries. 
            // If credit, amount should be 0 out of cash, but we need to track expense. 
            // We'll set method='CREDIT' and handle it in accounting view to not deduct from Cash/Bank.
            // Let's just store the full info.
            party: vendor || 'Expense',
            desc: `[${category}] ${title}`,
            amount: amount,
            category: category,
            isExpense: true,
            isCredit: method === 'CREDIT'
        };

        let txns = LocalDB.load('transactions') || [];
        txns.unshift(txn);
        LocalDB.save('transactions', txns);
        
        if(typeof db !== 'undefined' && db) {
            db.collection('transactions').doc(txn.id).set(txn);
        }

        // If Credit, update vendor ledger
        if(method === 'CREDIT' && vendor) {
            let customers = LocalDB.getCustomers() || [];
            let c = customers.find(cust => cust.name.toLowerCase() === vendor.toLowerCase());
            
            if(!c) {
                // Auto create vendor
                c = {
                    id: 'v' + Date.now(),
                    name: vendor,
                    phone: '',
                    type: 'Supplier', 
                    balance: amount // We owe them, so balance is positive for them (Credit)
                };
                customers.push(c);
            } else {
                c.balance = (c.balance || 0) + amount;
            }
            LocalDB.save('customers', customers);
            if(typeof db !== 'undefined' && db) {
                db.collection('customers').doc(c.id).set(c);
            }
        } else if (method === 'CREDIT' && !vendor) {
            alert("Warning: Saved as CREDIT but no vendor name provided. Cannot track ledger!");
        }

        alert("Expense Recorded Successfully!");
        
        document.getElementById('expense-form').reset();
        this.init(); // Reset dates and get next voucher
        if(typeof app !== 'undefined') app.renderAccounting(); // Update dashboard caches
    },

    deleteExpense: function(id) {
        if(!confirm('Are you sure you want to delete this expense? This will also affect the cash book.')) return;

        let txns = LocalDB.load('transactions') || [];
        const txn = txns.find(t => t.id === id);
        
        if(txn && txn.isCredit && txn.party && txn.party !== 'Expense') {
            // Need to reverse vendor ledger
            let customers = LocalDB.getCustomers() || [];
            let c = customers.find(cust => cust.name.toLowerCase() === txn.party.toLowerCase());
            if(c) {
                c.balance = (c.balance || 0) - txn.amount;
                LocalDB.save('customers', customers);
                if(typeof db !== 'undefined' && db) {
                    db.collection('customers').doc(c.id).set(c);
                }
            }
        }

        txns = txns.filter(t => t.id !== id);
        LocalDB.save('transactions', txns);
        
        if(typeof db !== 'undefined' && db) {
            db.collection('transactions').doc(id).delete();
        }

        this.updateUI();
        if(typeof app !== 'undefined') app.renderAccounting();
    },

    updateUI: function() {
        const txns = LocalDB.load('transactions') || [];
        const expTxns = txns.filter(t => t.isExpense || t.type === 'expense'); // handle legacy
        
        // Filter by date if selected
        const filterDate = document.getElementById('exp-filter-date') ? document.getElementById('exp-filter-date').value : '';
        
        let filteredExp = expTxns;
        if(filterDate) {
            filteredExp = expTxns.filter(t => {
                let d = t.date;
                if(d.includes('/')) d = d.split('/').reverse().join('-');
                return d === filterDate;
            });
        }

        // Calculate Summaries
        const today = new Date().toISOString().split('T')[0];
        const monthPrefix = today.substring(0, 7); // YYYY-MM
        
        let todayTotal = 0;
        let monthTotal = 0;

        expTxns.forEach(t => {
            let d = t.date;
            if(d.includes('/')) d = d.split('/').reverse().join('-'); // Handle DD/MM/YYYY
            
            if(d === today) todayTotal += t.amount;
            if(d.startsWith(monthPrefix)) monthTotal += t.amount;
        });

        const todayEl = document.getElementById('exp-summary-today');
        const monthEl = document.getElementById('exp-summary-month');
        if(todayEl) todayEl.innerText = (AppState.settings.currency || '₹') + todayTotal.toFixed(2);
        if(monthEl) monthEl.innerText = (AppState.settings.currency || '₹') + monthTotal.toFixed(2);

        // Update Table
        const tbody = document.getElementById('exp-history-table');
        if(!tbody) return;

        if(filteredExp.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No expenses found.</td></tr>';
        } else {
            tbody.innerHTML = filteredExp.map(t => `
                <tr>
                    <td>${t.date}</td>
                    <td><span class="badge bg-secondary">${t.category || 'General'}</span></td>
                    <td class="fw-bold">${t.desc.replace(`[${t.category}] `, '')} ${t.party !== 'Expense' ? `<br><small class="text-muted"><i class="fas fa-user"></i> ${t.party}</small>` : ''}</td>
                    <td><span class="badge bg-${t.isCredit ? 'danger' : 'success'}">${t.isCredit ? 'CREDIT' : (t.method || 'CASH')}</span></td>
                    <td class="text-end fw-bold text-danger">${AppState.settings.currency || '₹'}${t.amount.toFixed(2)}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger" onclick="ExpenseLogic.deleteExpense('${t.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    }
};

window.ExpenseLogic = ExpenseLogic;
