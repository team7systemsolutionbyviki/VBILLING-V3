const ReportLogic = {
    salesChart: null,
    paymentChart: null,

    init: function() {
        this.initDashboard();
        this.generateSalesReport();
        this.initInventory();
        this.initLedgerSummary();
    },

    initDashboard: function() {
        const bills = LocalDB.getBills() || [];
        const txns = LocalDB.load('transactions') || [];
        const products = LocalDB.getProducts() || [];

        const today = new Date();
        const d_gb = today.toLocaleDateString('en-GB'); // "dd/mm/yyyy"
        const d_iso = today.toISOString().split('T')[0]; // "yyyy-mm-dd"

        const todayBills = bills.filter(b => b.date === d_gb || b.date === d_iso);
        const todaySales = todayBills.reduce((sum, b) => sum + b.total, 0);
        
        const todayExp = txns.filter(t => (t.isExpense || t.type === 'expense' || t.isPurchase) && (t.date === d_gb || t.date === d_iso))
                            .reduce((sum, t) => sum + t.amount, 0);

        document.getElementById('rep-total-sales').innerText = (AppState.settings.currency || '₹') + todaySales.toFixed(2);
        document.getElementById('rep-sales-count').innerText = todayBills.length;
        document.getElementById('rep-total-expenses').innerText = (AppState.settings.currency || '₹') + todayExp.toFixed(2);
        document.getElementById('rep-net-profit').innerText = (AppState.settings.currency || '₹') + (todaySales - todayExp).toFixed(2);

        // Pending
        const customers = LocalDB.getCustomers() || [];
        const totalPending = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
        document.getElementById('rep-pending').innerText = (AppState.settings.currency || '₹') + totalPending.toFixed(2);

        this.renderCharts(bills, txns);
        this.renderFastMoving(bills);
        this.renderLowStock(products);
    },

    parseToYYYYMMDD: function(dateStr) {
        if(!dateStr) return '';
        if(dateStr.includes('-')) return dateStr; // already yyyy-mm-dd
        const p = dateStr.split('/');
        return `${p[2]}-${p[1]}-${p[0]}`;
    },

    renderCharts: function(bills, txns) {
        // 1. Sales Trend (Last 7 Days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-GB');
        }).reverse();

        const salesData = last7Days.map(d => {
            const iso = d.split('/').reverse().join('-');
            return bills.filter(b => b.date === d || b.date === iso).reduce((s, b) => s + b.total, 0);
        });
        const expData = last7Days.map(d => {
            const iso = d.split('/').reverse().join('-');
            return txns.filter(t => (t.isExpense || t.type === 'expense' || t.isPurchase) && (t.date === d || t.date === iso)).reduce((s, t) => s + t.amount, 0);
        });

        const ctx1 = document.getElementById('salesTrendChart');
        if(ctx1) {
            if(this.salesChart) this.salesChart.destroy();
            this.salesChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: last7Days,
                    datasets: [
                        { label: 'Sales', data: salesData, borderColor: '#0d6efd', tension: 0.3, fill: true, backgroundColor: 'rgba(13, 110, 253, 0.1)' },
                        { label: 'Expenses', data: expData, borderColor: '#dc3545', tension: 0.3 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // 2. Payment Modes
        const modes = { CASH: 0, UPI: 0, CREDIT: 0 };
        bills.forEach(b => {
            const m = (b.paymentMethod || 'CASH').toUpperCase();
            if(m === 'SPLIT') {
                modes.CASH += (b.splitCash || 0);
                modes.UPI += (b.splitUpi || 0);
            } else if(modes[m] !== undefined) {
                modes[m] += b.total;
            }
        });

        const ctx2 = document.getElementById('paymentModeChart');
        if(ctx2) {
            if(this.paymentChart) this.paymentChart.destroy();
            this.paymentChart = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Cash', 'UPI', 'Credit'],
                    datasets: [{
                        data: [modes.CASH, modes.UPI, modes.CREDIT],
                        backgroundColor: ['#198754', '#0dcaf0', '#ffc107']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    },

    renderFastMoving: function(bills) {
        const itemMap = {};
        bills.forEach(b => {
            (b.items || []).forEach(it => {
                if(!itemMap[it.name]) itemMap[it.name] = { qty: 0, rev: 0 };
                itemMap[it.name].qty += it.qty;
                itemMap[it.name].rev += it.total;
            });
        });

        const sorted = Object.entries(itemMap).sort((a,b) => b[1].qty - a[1].qty).slice(0, 5);
        const tbody = document.getElementById('rep-fast-moving');
        if(tbody) {
            tbody.innerHTML = sorted.map(([name, data]) => `
                <tr>
                    <td>${name}</td>
                    <td class="text-center fw-bold">${data.qty.toFixed(1)}</td>
                    <td class="text-end text-primary">${AppState.settings.currency || '₹'}${data.rev.toFixed(2)}</td>
                </tr>
            `).join('');
        }
    },

    renderLowStock: function(products) {
        const low = products.filter(p => p.stock <= 10).sort((a,b) => a.stock - b.stock).slice(0, 5);
        const tbody = document.getElementById('rep-low-stock');
        if(tbody) {
            tbody.innerHTML = low.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td class="text-center">${p.stock}</td>
                    <td class="text-center"><span class="badge bg-${p.stock <= 0 ? 'danger' : 'warning'}">${p.stock <= 0 ? 'Out' : 'Low'}</span></td>
                </tr>
            `).join('');
        }
    },

    generateSalesReport: function() {
        const bills = LocalDB.getBills() || [];
        const from = document.getElementById('rep-sales-from').value;
        const to = document.getElementById('rep-sales-to').value;

        let filtered = bills;
        if(from || to) {
            filtered = bills.filter(b => {
                const bd = this.parseToYYYYMMDD(b.date);
                if(from && bd < from) return false;
                if(to && bd > to) return false;
                return true;
            });
        }

        const tbody = document.getElementById('rep-sales-tbody');
        if(tbody) {
            tbody.innerHTML = filtered.map(b => `
                <tr>
                    <td>${b.billNo}</td>
                    <td>${b.date}</td>
                    <td class="fw-bold">${b.customerName}</td>
                    <td>${b.items.length} Items</td>
                    <td class="text-end">${AppState.settings.currency || '₹'}${(b.subtotal || 0).toFixed(2)}</td>
                    <td class="text-end">${AppState.settings.currency || '₹'}${(b.charges || 0).toFixed(2)}</td>
                    <td class="text-end">${AppState.settings.currency || '₹'}${(b.discount || 0).toFixed(2)}</td>
                    <td class="text-end fw-bold text-success">${AppState.settings.currency || '₹'}${b.total.toFixed(2)}</td>
                    <td><span class="badge bg-secondary">${b.paymentMethod.toUpperCase()}</span></td>
                </tr>
            `).join('');
        }

        // Calculate Totals for the filtered list
        let totalGross = 0;
        let totalCharges = 0;
        let totalDiscount = 0;
        let totalNet = 0;
        let totalCash = 0;
        let totalUpi = 0;
        let totalCredit = 0;

        filtered.forEach(b => {
            totalGross += (b.subtotal || 0);
            totalCharges += (b.charges || 0);
            totalDiscount += (b.discount || 0);
            totalNet += (b.total || 0);

            const m = (b.paymentMethod || 'CASH').toUpperCase();
            if (m === 'SPLIT') {
                totalCash += (b.splitCash || 0);
                totalUpi += (b.splitUpi || 0);
            } else if (m === 'UPI') {
                totalUpi += (b.total || 0);
            } else if (m === 'CREDIT') {
                totalCredit += (b.total || 0);
            } else {
                totalCash += (b.total || 0);
            }
        });

        const currency = AppState.settings.currency || '₹';
        const setElText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = currency + val.toFixed(2); };

        setElText('rep-sales-total-gross', totalGross);
        setElText('rep-sales-total-charges', totalCharges);
        setElText('rep-sales-total-discount', totalDiscount);
        setElText('rep-sales-total-net', totalNet);
        setElText('rep-sales-total-cash', totalCash);
        setElText('rep-sales-total-upi', totalUpi);
        setElText('rep-sales-total-credit', totalCredit);
    },

    initInventory: function() {
        const products = LocalDB.getProducts() || [];
        const tbody = document.getElementById('rep-stock-tbody');
        let totalVal = 0;

        if(tbody) {
            tbody.innerHTML = products.map(p => {
                const rate = p.costRate || (p.price * 0.8); // Estimate if not set
                const val = p.stock * rate;
                totalVal += val;
                return `
                    <tr>
                        <td>${p.name}</td>
                        <td class="text-center fw-semibold text-secondary">${p.mark || '-'}</td>
                        <td class="text-center fw-bold">${p.stock} ${p.unit || 'KG'}</td>
                        <td class="text-end">${AppState.settings.currency || '₹'}${rate.toFixed(2)}</td>
                        <td class="text-end fw-bold">${AppState.settings.currency || '₹'}${val.toFixed(2)}</td>
                    </tr>
                `;
            }).join('');
            document.getElementById('rep-stock-total').innerText = (AppState.settings.currency || '₹') + totalVal.toFixed(2);
        }
    },

    initLedgerSummary: function() {
        const customers = LocalDB.getCustomers() || [];
        const custTbody = document.getElementById('rep-cust-due-tbody');
        const suppTbody = document.getElementById('rep-supp-due-tbody');

        if(custTbody) {
            const dueCust = customers.filter(c => c.type !== 'Wholesale' && c.balance > 0).sort((a,b) => b.balance - a.balance);
            custTbody.innerHTML = dueCust.map(c => `
                <tr>
                    <td>${c.name}<br><small class="text-muted">${c.phone || ''}</small></td>
                    <td class="text-end fw-bold text-danger">${AppState.settings.currency || '₹'}${c.balance.toFixed(2)}</td>
                </tr>
            `).join('') || '<tr><td colspan="2" class="text-center py-3 text-muted">No pending receivables</td></tr>';
        }

        if(suppTbody) {
            const dueSupp = customers.filter(c => (c.type === 'Wholesale' || c.type === 'Supplier') && c.balance > 0).sort((a,b) => b.balance - a.balance);
            suppTbody.innerHTML = dueSupp.map(c => `
                <tr>
                    <td>${c.name}<br><small class="text-muted">${c.phone || ''}</small></td>
                    <td class="text-end fw-bold text-danger">${AppState.settings.currency || '₹'}${c.balance.toFixed(2)}</td>
                </tr>
            `).join('') || '<tr><td colspan="2" class="text-center py-3 text-muted">No pending payables</td></tr>';
        }
    },

    exportSalesExcel: function() {
        const table = document.getElementById('rep-sales-tbody').parentElement;
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sales Report" });
        XLSX.writeFile(wb, "Sales_Report_" + new Date().toLocaleDateString() + ".xlsx");
    },

    exportSalesPDF: function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Filtered bills calculation
        const bills = LocalDB.getBills() || [];
        const from = document.getElementById('rep-sales-from').value;
        const to = document.getElementById('rep-sales-to').value;
        
        let filtered = bills;
        if(from || to) {
            filtered = bills.filter(b => {
                const bd = this.parseToYYYYMMDD(b.date);
                if(from && bd < from) return false;
                if(to && bd > to) return false;
                return true;
            });
        }
        
        let totalGross = 0;
        let totalCharges = 0;
        let totalDiscount = 0;
        let totalNet = 0;
        let totalCash = 0;
        let totalUpi = 0;
        let totalCredit = 0;

        filtered.forEach(b => {
            totalGross += (b.subtotal || 0);
            totalCharges += (b.charges || 0);
            totalDiscount += (b.discount || 0);
            totalNet += (b.total || 0);

            const m = (b.paymentMethod || 'CASH').toUpperCase();
            if (m === 'SPLIT') {
                totalCash += (b.splitCash || 0);
                totalUpi += (b.splitUpi || 0);
            } else if (m === 'UPI') {
                totalUpi += (b.total || 0);
            } else if (m === 'CREDIT') {
                totalCredit += (b.total || 0);
            } else {
                totalCash += (b.total || 0);
            }
        });

        // Set document details & title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(33, 37, 41);
        doc.text("Sales Report", 14, 20);
        
        // Date range metadata
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(108, 117, 125);
        let dateRangeStr = "All Transactions";
        if (from && to) {
            dateRangeStr = `Period: ${from} to ${to}`;
        } else if (from) {
            dateRangeStr = `From: ${from}`;
        } else if (to) {
            dateRangeStr = `To: ${to}`;
        }
        doc.text(dateRangeStr, 14, 27);
        
        // Generated timestamp
        const nowStr = new Date().toLocaleString();
        doc.text(`Generated: ${nowStr}`, 196, 27, { align: 'right' });

        const head = [[
            "Bill #", "Date", "Customer", "Items", "Gross Total", "Charges", "Discount", "Net Total", "Mode"
        ]];
        
        const body = filtered.map(b => [
            b.billNo,
            b.date,
            b.customerName,
            `${b.items.length} Items`,
            `Rs. ${(b.subtotal || 0).toFixed(2)}`,
            `Rs. ${(b.charges || 0).toFixed(2)}`,
            `Rs. ${(b.discount || 0).toFixed(2)}`,
            `Rs. ${b.total.toFixed(2)}`,
            b.paymentMethod.toUpperCase()
        ]);

        const foot = [
            [
                "TOTALS", "", "", "",
                `Rs. ${totalGross.toFixed(2)}`,
                `Rs. ${totalCharges.toFixed(2)}`,
                `Rs. ${totalDiscount.toFixed(2)}`,
                `Rs. ${totalNet.toFixed(2)}`,
                ""
            ],
            [
                { 
                    content: `Total Cash Payment: Rs. ${totalCash.toFixed(2)}  |  Total UPI Payment: Rs. ${totalUpi.toFixed(2)}  |  Total Credit/Unpaid: Rs. ${totalCredit.toFixed(2)}`,
                    colSpan: 9,
                    styles: { halign: 'center', fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [33, 37, 41] }
                }
            ]
        ];

        doc.autoTable({
            head: head,
            body: body,
            foot: foot,
            startY: 32,
            theme: 'striped',
            styles: {
                fontSize: 8.5,
                cellPadding: 2.5,
                font: 'helvetica',
                valign: 'middle'
            },
            headStyles: {
                fillColor: [13, 110, 253], // primary color
                textColor: 255,
                fontStyle: 'bold'
            },
            footStyles: {
                fillColor: [33, 37, 41], // dark charcoal
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'left', cellWidth: 15 },   // Bill #
                1: { halign: 'left', cellWidth: 22 },   // Date
                2: { halign: 'left' },                  // Customer
                3: { halign: 'center', cellWidth: 20 }, // Items
                4: { halign: 'right', cellWidth: 23 },  // Gross Total
                5: { halign: 'right', cellWidth: 18 },  // Charges
                6: { halign: 'right', cellWidth: 18 },  // Discount
                7: { halign: 'right', cellWidth: 23 },  // Net Total
                8: { halign: 'center', cellWidth: 18 }  // Mode
            }
        });

        // Save PDF
        doc.save("Sales_Report_" + new Date().toLocaleDateString().replace(/\//g, '-') + ".pdf");
    }
};

window.ReportLogic = ReportLogic;
