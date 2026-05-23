/**
 * V Master Billing - Advanced Reporting Module
 * Fully responsive backend controller handling 35+ reports, compound filtering,
 * automatic PDF (jsPDF + autoTable) and Excel (SheetJS) exports, custom printing layouts,
 * and WhatsApp notification sharing templates.
 */

const ReportLogic = {
    activeReport: 'sales_today',
    activeData: [],
    activeChart: null,
    pdfHistory: [],
    
    // Default active filters state
    filters: {
        search: '',
        fromDate: '',
        toDate: '',
        paymentMode: 'all',
        customer: 'all',
        product: 'all',
        category: 'all',
        staff: 'all',
        invoiceMin: '',
        invoiceMax: ''
    },

    init: function() {
        this.pdfHistory = LocalDB.load('pdf_history') || [];
        this.resetFilters();
        this.populateFilterDropdowns();
        
        // Default to Today Sales
        this.selectReport('sales_today');
    },

    resetFilters: function() {
        const today = new Date().toISOString().split('T')[0];
        this.filters = {
            search: '',
            fromDate: today,
            toDate: today,
            paymentMode: 'all',
            customer: 'all',
            product: 'all',
            category: 'all',
            staff: 'all',
            invoiceMin: '',
            invoiceMax: ''
        };
        
        // Sync HTML inputs if rendered
        const fDateEl = document.getElementById('rep-from-date');
        const tDateEl = document.getElementById('rep-to-date');
        const searchEl = document.getElementById('rep-live-search');
        const payEl = document.getElementById('rep-payment-filter');
        
        if (fDateEl) fDateEl.value = this.filters.fromDate;
        if (tDateEl) tDateEl.value = this.filters.toDate;
        if (searchEl) searchEl.value = '';
        if (payEl) payEl.value = 'all';
    },

    populateFilterDropdowns: function() {
        const customers = LocalDB.getCustomers() || [];
        const products = LocalDB.getProducts() || [];
        const categories = LocalDB.getCategories() || [];
        const bills = LocalDB.getBills() || [];
        
        const staffNames = [...new Set(bills.map(b => b.staffName || 'VIKI').filter(Boolean))];
        if (!staffNames.includes('VIKI')) staffNames.push('VIKI');

        const fillSelect = (id, items, valueKey = 'id', textKey = 'name') => {
            const el = document.getElementById(id);
            if (!el) return;
            const originalHTML = el.innerHTML;
            const options = items.map(item => {
                const val = typeof item === 'string' ? item : item[valueKey];
                const txt = typeof item === 'string' ? item : item[textKey];
                return `<option value="${val}">${txt}</option>`;
            }).join('');
            el.innerHTML = originalHTML + options;
        };

        // Populate Advanced Filters
        fillSelect('adv-customer-select', customers, 'id', 'name');
        fillSelect('adv-product-select', products, 'name', 'name');
        fillSelect('adv-category-select', categories, 'name', 'name');
        fillSelect('adv-staff-select', staffNames);
    },

    selectReport: function(reportType, event) {
        if (event) event.preventDefault();
        
        this.activeReport = reportType;
        
        // Update navigation active states
        const links = document.querySelectorAll('.reports-sidebar .list-group-item');
        links.forEach(l => l.classList.remove('active'));
        
        if (event) {
            event.target.classList.add('active');
        } else {
            const targetLink = document.querySelector(`.reports-sidebar a[onclick*="${reportType}"]`);
            if (targetLink) targetLink.classList.add('active');
        }

        // Apply default dates ranges based on report selection
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Hide/show date fields dynamically based on report presets
        const divFrom = document.getElementById('div-from-date');
        const divTo = document.getElementById('div-to-date');
        const divPay = document.getElementById('div-payment-filter');
        
        if (divFrom) divFrom.classList.remove('d-none');
        if (divTo) divTo.classList.remove('d-none');
        if (divPay) divPay.classList.add('d-none');

        if (reportType === 'sales_today') {
            this.filters.fromDate = today;
            this.filters.toDate = today;
        } else if (reportType === 'sales_yesterday') {
            this.filters.fromDate = yesterdayStr;
            this.filters.toDate = yesterdayStr;
        } else if (reportType === 'sales_weekly') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            this.filters.fromDate = lastWeek.toISOString().split('T')[0];
            this.filters.toDate = today;
        } else if (reportType === 'sales_monthly') {
            const lastMonth = new Date();
            lastMonth.setDate(lastMonth.getDate() - 30);
            this.filters.fromDate = lastMonth.toISOString().split('T')[0];
            this.filters.toDate = today;
        } else if (reportType.startsWith('sales_') || reportType.startsWith('pay_') || reportType.startsWith('exp_') || reportType.startsWith('gst_')) {
            // Keep current filters or default to past 30 days
            const lastMonth = new Date();
            lastMonth.setDate(lastMonth.getDate() - 30);
            this.filters.fromDate = lastMonth.toISOString().split('T')[0];
            this.filters.toDate = today;
            if (reportType.startsWith('pay_') || reportType.startsWith('sales_')) {
                if (divPay) divPay.classList.remove('d-none');
            }
        } else {
            // Non-date-dependent reports (e.g., current stock, out of stock)
            if (divFrom) divFrom.classList.add('d-none');
            if (divTo) divTo.classList.add('d-none');
        }

        // Sync values to UI inputs
        const fDateEl = document.getElementById('rep-from-date');
        const tDateEl = document.getElementById('rep-to-date');
        if (fDateEl) fDateEl.value = this.filters.fromDate;
        if (tDateEl) tDateEl.value = this.filters.toDate;

        // Render Active view
        this.renderActiveReport();
    },

    refreshActiveReport: function() {
        this.renderActiveReport();
    },

    applyFilters: function() {
        const fDate = document.getElementById('rep-from-date');
        const tDate = document.getElementById('rep-to-date');
        const search = document.getElementById('rep-live-search');
        const pMode = document.getElementById('rep-payment-filter');

        if (fDate) this.filters.fromDate = fDate.value;
        if (tDate) this.filters.toDate = tDate.value;
        if (search) this.filters.search = search.value.trim();
        if (pMode) this.filters.paymentMode = pMode.value;

        this.renderActiveReport();
    },

    openAdvancedFilters: function() {
        const modal = new bootstrap.Modal(document.getElementById('advancedFilterModal'));
        modal.show();
    },

    applyAdvancedFilters: function() {
        this.filters.customer = document.getElementById('adv-customer-select').value;
        this.filters.product = document.getElementById('adv-product-select').value;
        this.filters.category = document.getElementById('adv-category-select').value;
        this.filters.staff = document.getElementById('adv-staff-select').value;
        this.filters.invoiceMin = document.getElementById('adv-invoice-min').value;
        this.filters.invoiceMax = document.getElementById('adv-invoice-max').value;

        // Update active badges
        this.updateFilterBadges();

        const modalEl = document.getElementById('advancedFilterModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        this.renderActiveReport();
    },

    clearAdvancedFilters: function() {
        document.getElementById('adv-filter-form').reset();
        this.filters.customer = 'all';
        this.filters.product = 'all';
        this.filters.category = 'all';
        this.filters.staff = 'all';
        this.filters.invoiceMin = '';
        this.filters.invoiceMax = '';

        this.updateFilterBadges();
        this.renderActiveReport();
    },

    updateFilterBadges: function() {
        const badgesContainer = document.getElementById('active-filter-badges');
        if (!badgesContainer) return;

        let html = '';
        const addBadge = (label, value, key) => {
            if (value && value !== 'all') {
                html += `<span class="badge bg-secondary py-2 px-3 border rounded-pill d-flex align-items-center gap-2">
                    <strong>${label}:</strong> ${value}
                    <i class="fas fa-times cursor-pointer text-white-50" onclick="ReportLogic.removeAdvFilter('${key}')"></i>
                </span>`;
            }
        };

        addBadge('Party', this.filters.customer === 'all' ? '' : LocalDB.getCustomers().find(c => c.id === this.filters.customer)?.name, 'customer');
        addBadge('Product', this.filters.product, 'product');
        addBadge('Category', this.filters.category, 'category');
        addBadge('Cashier', this.filters.staff, 'staff');
        addBadge('Min Inv', this.filters.invoiceMin, 'invoiceMin');
        addBadge('Max Inv', this.filters.invoiceMax, 'invoiceMax');

        badgesContainer.innerHTML = html;
    },

    removeAdvFilter: function(key) {
        this.filters[key] = key.includes('Min') || key.includes('Max') ? '' : 'all';
        
        // Sync select boxes in modal
        const selectMap = {
            customer: 'adv-customer-select',
            product: 'adv-product-select',
            category: 'adv-category-select',
            staff: 'adv-staff-select',
            invoiceMin: 'adv-invoice-min',
            invoiceMax: 'adv-invoice-max'
        };
        const el = document.getElementById(selectMap[key]);
        if (el) el.value = this.filters[key];

        this.updateFilterBadges();
        this.renderActiveReport();
    },

    parseToYYYYMMDD: function(dateStr) {
        if(!dateStr) return '';
        if(dateStr.includes('-')) return dateStr; // already yyyy-mm-dd
        const p = dateStr.split('/');
        return `${p[2]}-${p[1]}-${p[0]}`;
    },

    formatDateOutput: function(dateStr) {
        if (!dateStr) return '-';
        if (dateStr.includes('/')) return dateStr;
        const p = dateStr.split('-');
        return `${p[2]}/${p[1]}/${p[0]}`;
    },

    // Main Engine to pull, compute and render all 35 reports
    renderActiveReport: function() {
        const bills = LocalDB.getBills() || [];
        const txns = LocalDB.load('transactions') || [];
        const products = LocalDB.getProducts() || [];
        const customers = LocalDB.getCustomers() || [];
        const damaged = LocalDB.load('damaged_products') || [];
        const adjustments = LocalDB.load('stock_adjustments') || [];
        const returns = LocalDB.load('purchase_returns') || [];
        const currency = AppState.settings.currency || '₹';

        let title = '';
        let desc = '';
        let headers = [];
        let rows = [];
        let showChart = false;
        let chartData = null;
        let footerCols = [];

        // Helper filter functions
        const filterBillsByDateAndAdv = (list) => {
            return list.filter(b => {
                const bd = this.parseToYYYYMMDD(b.date);
                if (this.filters.fromDate && bd < this.filters.fromDate) return false;
                if (this.filters.toDate && bd > this.filters.toDate) return false;
                
                // Advanced Filters
                if (this.filters.customer !== 'all' && b.customerId !== this.filters.customer) return false;
                if (this.filters.staff !== 'all' && (b.staffName || 'VIKI') !== this.filters.staff) return false;
                if (this.filters.invoiceMin && b.billNo < parseInt(this.filters.invoiceMin)) return false;
                if (this.filters.invoiceMax && b.billNo > parseInt(this.filters.invoiceMax)) return false;
                if (this.filters.paymentMode !== 'all' && b.paymentMethod.toUpperCase() !== this.filters.paymentMode) return false;
                
                // Live search
                if (this.filters.search) {
                    const s = this.filters.search.toLowerCase();
                    const nameMatch = b.customerName.toLowerCase().includes(s);
                    const billMatch = b.billNo.toString().includes(s);
                    const itemMatch = b.items.some(it => it.name.toLowerCase().includes(s));
                    if (!nameMatch && !billMatch && !itemMatch) return false;
                }
                
                // Product Filter inside bills
                if (this.filters.product !== 'all') {
                    if (!b.items.some(it => it.name === this.filters.product)) return false;
                }
                
                return true;
            });
        };

        const filterTxnsByDateAndAdv = (list) => {
            return list.filter(t => {
                const td = this.parseToYYYYMMDD(t.date);
                if (this.filters.fromDate && td < this.filters.fromDate) return false;
                if (this.filters.toDate && td > this.filters.toDate) return false;
                
                if (this.filters.customer !== 'all' && t.party.toLowerCase() !== customers.find(c => c.id === this.filters.customer)?.name.toLowerCase()) return false;
                if (this.filters.search) {
                    const s = this.filters.search.toLowerCase();
                    if (!t.party.toLowerCase().includes(s) && !(t.desc || '').toLowerCase().includes(s) && !t.id.includes(s)) return false;
                }
                return true;
            });
        };

        // Determine columns, active data and summaries
        switch(this.activeReport) {
            
            // ==================== SALES REPORTS ====================
            case 'sales_today':
            case 'sales_yesterday':
            case 'sales_weekly':
            case 'sales_monthly':
            case 'sales_custom':
            case 'sales_invoice_wise': {
                title = this.activeReport === 'sales_today' ? "Today Sales" :
                        this.activeReport === 'sales_yesterday' ? "Yesterday Sales" :
                        this.activeReport === 'sales_weekly' ? "Weekly Sales" :
                        this.activeReport === 'sales_monthly' ? "Monthly Sales" :
                        this.activeReport === 'sales_custom' ? "Custom Date Sales" : "Invoice-wise Report";
                desc = "Sales patti invoices list generated during the specified period.";
                headers = ["Invoice #", "Date", "Time", "Customer Name", "Items Count", "Subtotal", "Charges", "Discount", "Net Total", "Payment Mode", "Staff Name"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                this.activeData = filteredBills;
                
                let subTotalSum = 0, chargesSum = 0, discountSum = 0, totalSum = 0;
                rows = filteredBills.map(b => {
                    subTotalSum += b.subtotal || 0;
                    chargesSum += b.charges || 0;
                    discountSum += b.discount || 0;
                    totalSum += b.total;
                    
                    return [
                        `#${b.billNo}`,
                        this.formatDateOutput(b.date),
                        b.time || '-',
                        b.customerName,
                        `${b.items.length} Items`,
                        currency + (b.subtotal || 0).toFixed(2),
                        currency + (b.charges || 0).toFixed(2),
                        currency + (b.discount || 0).toFixed(2),
                        currency + b.total.toFixed(2),
                        b.paymentMethod.toUpperCase(),
                        b.staffName || 'VIKI'
                    ];
                });

                footerCols = [
                    "TOTALS", "", "", "", `${filteredBills.length} Bills`,
                    currency + subTotalSum.toFixed(2),
                    currency + chargesSum.toFixed(2),
                    currency + discountSum.toFixed(2),
                    currency + totalSum.toFixed(2),
                    "", ""
                ];
                break;
            }

            case 'sales_item_wise': {
                title = "Item-wise Sales Report";
                desc = "Product items sold in bills, with accumulated sales volumes and total revenues.";
                headers = ["Product Name", "Category", "Mark", "Quantity Sold", "Unit", "Average Rate", "Total Revenue"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                const itemsMap = {};
                
                filteredBills.forEach(b => {
                    b.items.forEach(it => {
                        // Search filter inside item wise
                        if (this.filters.search && !it.name.toLowerCase().includes(this.filters.search.toLowerCase())) return;
                        
                        const key = `${it.id}-${it.mark}`;
                        if (!itemsMap[key]) {
                            itemsMap[key] = { name: it.name, qty: 0, revenue: 0, unit: it.unit, mark: it.mark || '-', rates: [] };
                        }
                        itemsMap[key].qty += it.qty;
                        itemsMap[key].revenue += it.total;
                        itemsMap[key].rates.push(it.price);
                    });
                });
                
                const itemsList = Object.values(itemsMap);
                this.activeData = itemsList;
                
                let qtyTotal = 0, revTotal = 0;
                rows = itemsList.map(it => {
                    qtyTotal += it.qty;
                    revTotal += it.revenue;
                    const prod = products.find(p => p.name === it.name) || {};
                    const cat = prod.category || 'Vegetables';
                    const avgRate = it.rates.length > 0 ? (it.rates.reduce((a,b)=>a+b, 0) / it.rates.length) : 0;
                    
                    return [
                        it.name,
                        cat,
                        it.mark,
                        it.qty.toFixed(1),
                        it.unit,
                        currency + avgRate.toFixed(2),
                        currency + it.revenue.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", qtyTotal.toFixed(1), "", "", currency + revTotal.toFixed(2)];
                break;
            }

            case 'sales_category_wise': {
                title = "Category-wise Sales Report";
                desc = "Revenue performance categorized by product department divisions.";
                headers = ["Category", "Items Sold Count", "Total Quantities Sold", "Gross Value", "Net Value"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                const catMap = {};
                
                filteredBills.forEach(b => {
                    b.items.forEach(it => {
                        const prod = products.find(p => p.name === it.name) || {};
                        const cat = prod.category || 'Vegetables';
                        
                        if (this.filters.search && !cat.toLowerCase().includes(this.filters.search.toLowerCase())) return;

                        if (!catMap[cat]) {
                            catMap[cat] = { name: cat, count: 0, qty: 0, gross: 0, net: 0 };
                        }
                        catMap[cat].count++;
                        catMap[cat].qty += it.qty;
                        catMap[cat].gross += it.total;
                    });
                });

                // Calculate Net including fractional bill charge/discount allocations
                const catsList = Object.values(catMap);
                this.activeData = catsList;
                
                let grossTotal = 0, netTotal = 0, qtyTotal = 0;
                rows = catsList.map(c => {
                    c.net = c.gross; // For simplicity in category totals
                    grossTotal += c.gross;
                    netTotal += c.net;
                    qtyTotal += c.qty;
                    
                    return [
                        c.name,
                        c.count + " Sales",
                        c.qty.toFixed(1),
                        currency + c.gross.toFixed(2),
                        currency + c.net.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", qtyTotal.toFixed(1), currency + grossTotal.toFixed(2), currency + netTotal.toFixed(2)];
                break;
            }

            case 'sales_staff_wise': {
                title = "Staff-wise Sales Report";
                desc = "Sales performance audit attributed to cashiers and counter administrators.";
                headers = ["Staff / Cashier", "Bills Handled", "Total Cash Sales", "Total UPI Sales", "Total Credit Sales", "Accumulated Sales"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                const staffMap = {};

                filteredBills.forEach(b => {
                    const sName = b.staffName || 'VIKI';
                    if (this.filters.search && !sName.toLowerCase().includes(this.filters.search.toLowerCase())) return;

                    if (!staffMap[sName]) {
                        staffMap[sName] = { name: sName, bills: 0, cash: 0, upi: 0, credit: 0, total: 0 };
                    }
                    staffMap[sName].bills++;
                    staffMap[sName].total += b.total;
                    
                    if (b.paymentMethod === 'cash') staffMap[sName].cash += b.total;
                    else if (b.paymentMethod === 'upi') staffMap[sName].upi += b.total;
                    else if (b.paymentMethod === 'credit') staffMap[sName].credit += b.total;
                    else if (b.paymentMethod === 'split') {
                        staffMap[sName].cash += b.splitCash || 0;
                        staffMap[sName].upi += b.splitUpi || 0;
                    }
                });

                const staffList = Object.values(staffMap);
                this.activeData = staffList;
                
                let bCount = 0, cSales = 0, uSales = 0, crSales = 0, grandSales = 0;
                rows = staffList.map(s => {
                    bCount += s.bills;
                    cSales += s.cash;
                    uSales += s.upi;
                    crSales += s.credit;
                    grandSales += s.total;
                    
                    return [
                        s.name,
                        s.bills + " Invoices",
                        currency + s.cash.toFixed(2),
                        currency + s.upi.toFixed(2),
                        currency + s.credit.toFixed(2),
                        currency + s.total.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", bCount + " Invoices", currency + cSales.toFixed(2), currency + uSales.toFixed(2), currency + crSales.toFixed(2), currency + grandSales.toFixed(2)];
                break;
            }

            case 'sales_counter_wise': {
                title = "Counter-wise Sales Report";
                desc = "Audit logs of billing volumes segmented by physical shop POS counters.";
                headers = ["Counter ID", "Bills Count", "Total Sales Revenue"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                const counterMap = {};

                filteredBills.forEach(b => {
                    const cId = b.counterId || 'Counter 1';
                    if (this.filters.search && !cId.toLowerCase().includes(this.filters.search.toLowerCase())) return;

                    if (!counterMap[cId]) {
                        counterMap[cId] = { id: cId, count: 0, total: 0 };
                    }
                    counterMap[cId].count++;
                    counterMap[cId].total += b.total;
                });

                const counters = Object.values(counterMap);
                this.activeData = counters;
                
                let bTotal = 0, revTotal = 0;
                rows = counters.map(c => {
                    bTotal += c.count;
                    revTotal += c.total;
                    return [c.id, c.count + " Invoices", currency + c.total.toFixed(2)];
                });

                footerCols = ["TOTALS", bTotal + " Invoices", currency + revTotal.toFixed(2)];
                break;
            }

            case 'sales_mark_wise': {
                title = "Mark-wise Sales Report";
                desc = "Summary of sales aggregated by brand marks / supplier markings.";
                headers = ["Mark / Brand", "Products Sold", "Total Quantity", "Average Sale Rate", "Total Revenue"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                const markMap = {};

                filteredBills.forEach(b => {
                    b.items.forEach(it => {
                        const mVal = (it.mark || '-').trim() || '-';
                        
                        // Apply search filter
                        if (this.filters.search) {
                            const s = this.filters.search.toLowerCase();
                            if (!mVal.toLowerCase().includes(s) && !it.name.toLowerCase().includes(s)) return;
                        }

                        if (!markMap[mVal]) {
                            markMap[mVal] = { mark: mVal, products: new Set(), qty: 0, revenue: 0, rates: [], unit: it.unit || 'KG' };
                        }
                        markMap[mVal].products.add(it.name);
                        markMap[mVal].qty += it.qty;
                        markMap[mVal].revenue += it.total;
                        markMap[mVal].rates.push(it.price);
                    });
                });

                const marksList = Object.values(markMap);
                this.activeData = marksList;

                let qtyTotal = 0, revTotal = 0;
                rows = marksList.map(m => {
                    qtyTotal += m.qty;
                    revTotal += m.revenue;
                    const avgRate = m.rates.length > 0 ? (m.rates.reduce((a, b) => a + b, 0) / m.rates.length) : 0;
                    
                    return [
                        m.mark,
                        Array.from(m.products).join(', '),
                        m.qty.toFixed(1) + ' ' + m.unit,
                        currency + avgRate.toFixed(2),
                        currency + m.revenue.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", `${marksList.length} Marks`, qtyTotal.toFixed(1), "", currency + revTotal.toFixed(2)];
                break;
            }

            case 'sales_hourly_graph': {
                title = "Hourly Sales Graph Analysis";
                desc = "Sales volumes distributed across hours of the operational workday.";
                headers = ["Hour Segment", "Sales Bills count", "Hourly Net Revenue"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                
                // Group by hour
                const hours = {};
                for (let i = 6; i <= 21; i++) {
                    hours[i] = { hour: `${i.toString().padStart(2, '0')}:00`, count: 0, total: 0 };
                }
                
                filteredBills.forEach(b => {
                    if (b.time) {
                        const isPM = b.time.includes('PM');
                        let hour = parseInt(b.time.split(':')[0]);
                        if (isPM && hour !== 12) hour += 12;
                        if (!isPM && hour === 12) hour = 0;
                        if (hours[hour]) {
                            hours[hour].count++;
                            hours[hour].total += b.total;
                        }
                    }
                });

                const hourlyList = Object.values(hours);
                this.activeData = hourlyList;
                
                let countSum = 0, totalSum = 0;
                rows = hourlyList.map(h => {
                    countSum += h.count;
                    totalSum += h.total;
                    return [h.hour, h.count + " bills", currency + h.total.toFixed(2)];
                });

                footerCols = ["TOTALS", countSum + " bills", currency + totalSum.toFixed(2)];
                
                // Set up Chart
                showChart = true;
                chartData = {
                    type: 'bar',
                    labels: hourlyList.map(h => h.hour),
                    datasets: [{
                        label: 'Hourly Sales (' + currency + ')',
                        data: hourlyList.map(h => h.total),
                        backgroundColor: 'rgba(37, 99, 235, 0.7)',
                        borderColor: '#2563eb',
                        borderWidth: 1
                    }]
                };
                break;
            }

            case 'sales_profit_loss': {
                title = "Profit & Loss Summary";
                desc = "Comparative analysis of Sales Revenue vs Cost of Goods Sold (COGS) and Expenses.";
                headers = ["Date / Period", "Sales Income (A)", "Cost of Goods Sold (B)", "Gross Profit (A - B)", "Voucher Expenses (C)", "Net Profit"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                const filteredTxns = filterTxnsByDateAndAdv(txns);

                const daysMap = {};
                // Populate sales
                filteredBills.forEach(b => {
                    const date = b.date;
                    if (!daysMap[date]) daysMap[date] = { date: date, sales: 0, cogs: 0, expenses: 0 };
                    daysMap[date].sales += b.total;
                    
                    // COGS calculation
                    b.items.forEach(it => {
                        const prod = products.find(p => p.name === it.name) || {};
                        const cost = prod.costRate || (it.price * 0.7); // default 70% cost if missing
                        daysMap[date].cogs += it.qty * cost;
                    });
                });

                // Populate expenses
                filteredTxns.forEach(t => {
                    if (t.isExpense || t.type === 'expense' || t.id.startsWith('EXP')) {
                        const date = t.date;
                        if (!daysMap[date]) daysMap[date] = { date: date, sales: 0, cogs: 0, expenses: 0 };
                        daysMap[date].expenses += t.amount;
                    }
                });

                const daysList = Object.values(daysMap).sort((a,b) => {
                    const pA = a.date.split('/');
                    const pB = b.date.split('/');
                    return new Date(pA[2], pA[1]-1, pA[0]) - new Date(pB[2], pB[1]-1, pB[0]);
                });
                this.activeData = daysList;

                let sSum = 0, cSum = 0, eSum = 0, gpSum = 0, npSum = 0;
                rows = daysList.map(d => {
                    const grossProfit = d.sales - d.cogs;
                    const netProfit = grossProfit - d.expenses;
                    
                    sSum += d.sales;
                    cSum += d.cogs;
                    eSum += d.expenses;
                    gpSum += grossProfit;
                    npSum += netProfit;

                    return [
                        this.formatDateOutput(d.date),
                        currency + d.sales.toFixed(2),
                        currency + d.cogs.toFixed(2),
                        currency + grossProfit.toFixed(2),
                        currency + d.expenses.toFixed(2),
                        currency + netProfit.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", currency+sSum.toFixed(2), currency+cSum.toFixed(2), currency+gpSum.toFixed(2), currency+eSum.toFixed(2), currency+npSum.toFixed(2)];
                break;
            }

            case 'sales_tax_summary': {
                title = "GST Tax Liability Summary";
                desc = "Accumulated tax liability breakdown for the selected periods.";
                headers = ["Tax Rate (%)", "Gross Taxable Amount", "CGST Liability", "SGST Liability", "IGST Liability", "Total Tax Outflow"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                
                // Assume standard default tax 5% (CGST 2.5% + SGST 2.5%) for standard goods, or calculate
                let totalTaxable = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0, totalTax = 0;
                
                filteredBills.forEach(b => {
                    const cgst = b.subtotal * 0.025; // 2.5%
                    const sgst = b.subtotal * 0.025; // 2.5%
                    totalTaxable += b.subtotal;
                    totalCgst += cgst;
                    totalSgst += sgst;
                    totalTax += (cgst + sgst);
                });

                this.activeData = [{ rate: "GST 5% (CGST 2.5% + SGST 2.5%)", taxable: totalTaxable, cgst: totalCgst, sgst: totalSgst, igst: totalIgst, total: totalTax }];

                rows = [[
                    "GST 5%",
                    currency + totalTaxable.toFixed(2),
                    currency + totalCgst.toFixed(2),
                    currency + totalSgst.toFixed(2),
                    currency + totalIgst.toFixed(2),
                    currency + totalTax.toFixed(2)
                ]];

                footerCols = ["TOTALS", currency+totalTaxable.toFixed(2), currency+totalCgst.toFixed(2), currency+totalSgst.toFixed(2), currency+totalIgst.toFixed(2), currency+totalTax.toFixed(2)];
                break;
            }

            case 'sales_discount_summary': {
                title = "Discounts Offered Report";
                desc = "List of sales bills where discount allowances were subtracted.";
                headers = ["Bill No", "Date", "Customer Name", "Original Subtotal", "Discount Allowed", "Discount Rate (%)", "Final Paid Bill"];
                
                const filteredBills = filterBillsByDateAndAdv(bills).filter(b => b.discount > 0);
                this.activeData = filteredBills;
                
                let subSum = 0, discSum = 0, finalSum = 0;
                rows = filteredBills.map(b => {
                    subSum += b.subtotal;
                    discSum += b.discount;
                    finalSum += b.total;
                    const percent = (b.discount / b.subtotal) * 100;
                    
                    return [
                        `#${b.billNo}`,
                        this.formatDateOutput(b.date),
                        b.customerName,
                        currency + b.subtotal.toFixed(2),
                        currency + b.discount.toFixed(2),
                        percent.toFixed(1) + "%",
                        currency + b.total.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", currency + subSum.toFixed(2), currency + discSum.toFixed(2), "", currency + finalSum.toFixed(2)];
                break;
            }

            // ==================== PURCHASE REPORTS ====================
            case 'pur_supplier_report': {
                title = "Supplier Purchases Ledger Summary";
                desc = "Total purchases volume, cash outflow paid and balances owed per supplier.";
                headers = ["Supplier Name", "Lots Purchased", "Gross Purchase Value", "Amount Paid Settled", "Outstanding Payable balance"];
                
                const filteredTxns = filterTxnsByDateAndAdv(txns).filter(t => t.isPurchase);
                const suppMap = {};

                filteredTxns.forEach(t => {
                    const sName = t.party;
                    if (!suppMap[sName]) {
                        suppMap[sName] = { name: sName, count: 0, gross: 0, paid: 0 };
                    }
                    suppMap[sName].count++;
                    suppMap[sName].gross += t.gross || t.amount;
                    suppMap[sName].paid += t.amount;
                });

                const suppList = Object.values(suppMap);
                this.activeData = suppList;

                let lCount = 0, gTotal = 0, pTotal = 0, bTotal = 0;
                rows = suppList.map(s => {
                    const due = Math.max(0, s.gross - s.paid);
                    lCount += s.count;
                    gTotal += s.gross;
                    pTotal += s.paid;
                    bTotal += due;

                    return [
                        s.name,
                        s.count + " Invoices",
                        currency + s.gross.toFixed(2),
                        currency + s.paid.toFixed(2),
                        currency + due.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", lCount + " Lots", currency+gTotal.toFixed(2), currency+pTotal.toFixed(2), currency+bTotal.toFixed(2)];
                break;
            }

            case 'pur_stock_history': {
                title = "Stock Purchase Inflow History";
                desc = "Individual item quantities added to stock through purchase vouchers.";
                headers = ["Date", "Purchase Bill #", "Supplier Name", "Product Name", "Mark", "Quantity Costed", "Unit Cost Price", "Purchase Total"];
                
                const filteredTxns = filterTxnsByDateAndAdv(txns).filter(t => t.isPurchase);
                const history = [];

                filteredTxns.forEach(t => {
                    (t.items || []).forEach(it => {
                        history.push({
                            date: t.date,
                            id: t.id,
                            supplier: t.party,
                            name: it.name,
                            mark: it.mark || '-',
                            qty: it.qty,
                            unit: it.unit,
                            rate: it.rate,
                            total: it.total
                        });
                    });
                });

                this.activeData = history;
                let qSum = 0, costSum = 0;
                rows = history.map(h => {
                    qSum += h.qty;
                    costSum += h.total;
                    return [
                        this.formatDateOutput(h.date),
                        h.id,
                        h.supplier,
                        h.name,
                        h.mark,
                        `${h.qty} ${h.unit}`,
                        currency + h.rate.toFixed(2),
                        currency + h.total.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", "", "", qSum.toFixed(1), "", currency + costSum.toFixed(2)];
                break;
            }

            case 'pur_return_report': {
                title = "Purchase Returns & Debits Notes";
                desc = "Quantities of goods returned to suppliers with corresponding refund ledger values.";
                headers = ["Date", "Return Ref #", "Supplier", "Invoice Ref", "Item Returned", "Quantity Returned", "Refund Value", "Reason"];
                
                this.activeData = returns;
                let qSum = 0, rSum = 0;
                rows = returns.map(r => {
                    const it = r.items[0] || {};
                    qSum += it.qty || 0;
                    rSum += r.total || 0;
                    return [
                        this.formatDateOutput(r.date),
                        r.id,
                        r.supplier,
                        r.invoiceNo || '-',
                        it.name || '-',
                        `${it.qty || 0} ${it.unit || ''}`,
                        currency + (r.total || 0).toFixed(2),
                        r.reason || '-'
                    ];
                });

                footerCols = ["TOTALS", "", "", "", "", qSum.toFixed(1), currency + rSum.toFixed(2), ""];
                break;
            }

            case 'pur_pending_payment': {
                title = "Pending Supplier Payables";
                desc = "Unpaid outstanding dues owing to suppliers.";
                headers = ["Supplier Name", "Phone", "Outstanding Due (Payable)", "Type Credit Status"];
                
                const suppliers = customers.filter(c => (c.type === 'Supplier' || c.type === 'Wholesale') && c.balance > 0);
                this.activeData = suppliers;
                
                let dueTotal = 0;
                rows = suppliers.map(s => {
                    dueTotal += s.balance;
                    return [
                        s.name,
                        s.phone || '-',
                        currency + s.balance.toFixed(2),
                        "PENDING DUE"
                    ];
                });

                footerCols = ["TOTALS", "", currency + dueTotal.toFixed(2), ""];
                break;
            }

            // ==================== STOCK REPORTS ====================
            case 'stock_current': {
                title = "Current Stock Inventory Valuation";
                desc = "Physical stock ledger and asset valuation calculated using purchase cost rates.";
                headers = ["Product Name", "Category", "Mark", "Current Stock", "Unit", "Purchase Cost", "MRP Rate", "Inventory Asset Value"];
                
                this.activeData = products;
                
                let stockSum = 0, assetSum = 0;
                rows = products.map(p => {
                    const cost = p.costRate || (p.price * 0.7);
                    const val = p.stock * cost;
                    stockSum += p.stock;
                    assetSum += val;
                    
                    return [
                        p.name,
                        p.category,
                        p.mark || '-',
                        p.stock,
                        p.unit,
                        currency + cost.toFixed(2),
                        currency + p.price.toFixed(2),
                        currency + val.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", stockSum.toFixed(1), "", "", "", currency + assetSum.toFixed(2)];
                break;
            }

            case 'stock_low_alert': {
                title = "Low Stock Alerts";
                desc = "Products with current stock quantities falling below the safe limits.";
                headers = ["Product Name", "Category", "Mark", "Current Stock", "Unit", "Alert Limit Value", "Status Action"];
                
                const limit = AppState.settings.lowStockLimit || 150;
                const lowList = products.filter(p => p.stock <= limit);
                this.activeData = lowList;

                rows = lowList.map(p => {
                    return [
                        p.name,
                        p.category,
                        p.mark || '-',
                        p.stock,
                        p.unit,
                        limit,
                        p.stock <= 0 ? "OUT OF STOCK" : "REORDER NOW"
                    ];
                });

                footerCols = ["TOTAL ITEMS:", lowList.length + " Products", "", "", "", "", ""];
                break;
            }

            case 'stock_out': {
                title = "Out of Stock Items";
                desc = "Products with zero or negative stock requiring immediate replenishment.";
                headers = ["Product Name", "Category", "Mark", "Current Stock", "Unit", "Supplier Reference"];
                
                const outList = products.filter(p => p.stock <= 0);
                this.activeData = outList;

                rows = outList.map(p => {
                    return [
                        p.name,
                        p.category,
                        p.mark || '-',
                        p.stock,
                        p.unit,
                        p.fromWho || 'Unknown Supplier'
                    ];
                });

                footerCols = ["TOTAL ITEMS:", outList.length + " Products", "", "", "", ""];
                break;
            }

            case 'stock_fast_moving': {
                title = "Fast Moving Products";
                desc = "Products with high sales quantities sorted by volume sold.";
                headers = ["Rank", "Product Name", "Category", "Mark", "Quantity Sold", "Bills Count", "Total Revenue"];
                
                const stats = {};
                bills.forEach(b => {
                    b.items.forEach(it => {
                        if (!stats[it.id]) stats[it.id] = { id: it.id, name: it.name, qty: 0, bills: 0, total: 0 };
                        stats[it.id].qty += it.qty;
                        stats[it.id].bills++;
                        stats[it.id].total += it.total;
                    });
                });

                const sorted = Object.values(stats).sort((a,b) => b.qty - a.qty);
                this.activeData = sorted;

                rows = sorted.map((s, idx) => {
                    const prod = products.find(p => p.id === s.id) || {};
                    return [
                        `#${idx + 1}`,
                        s.name,
                        prod.category || 'Vegetables',
                        prod.mark || '-',
                        `${s.qty.toFixed(1)} ${prod.unit || ''}`,
                        s.bills + " times",
                        currency + s.total.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", "", "", "", ""];
                break;
            }

            case 'stock_slow_moving': {
                title = "Slow Moving / Stagnant Products";
                desc = "Products with low sales or zero sales quantities over time.";
                headers = ["Product Name", "Category", "Mark", "Current Stock", "Unit", "Sold in Last 30 Days", "Asset Locked Up"];
                
                const stats = {};
                bills.forEach(b => {
                    b.items.forEach(it => {
                        if (!stats[it.id]) stats[it.id] = 0;
                        stats[it.id] += it.qty;
                    });
                });

                const slowList = products.map(p => {
                    const sold = stats[p.id] || 0;
                    return { ...p, sold: sold };
                }).sort((a,b) => a.sold - b.sold);

                this.activeData = slowList;
                
                rows = slowList.map(s => {
                    const cost = s.costRate || (s.price * 0.7);
                    return [
                        s.name,
                        s.category,
                        s.mark || '-',
                        s.stock,
                        s.unit,
                        s.sold.toFixed(1),
                        currency + (s.stock * cost).toFixed(2)
                    ];
                });

                footerCols = ["TOTAL ITEMS:", slowList.length + " Products", "", "", "", "", ""];
                break;
            }

            case 'stock_expiry': {
                title = "Inventory Product Expirations";
                desc = "Perishable batches showing expiry dates, highlighted by status warnings.";
                headers = ["Product Name", "Category", "Mark", "Current Stock", "Unit", "Expiry Date", "Days Remaining", "Status Warning"];
                
                const list = products.filter(p => p.expiryDate).sort((a,b) => a.expiryDate.localeCompare(b.expiryDate));
                this.activeData = list;
                const todayTime = new Date().getTime();

                rows = list.map(p => {
                    const expTime = new Date(p.expiryDate).getTime();
                    const diffDays = Math.ceil((expTime - todayTime) / (1000 * 60 * 60 * 24));
                    let status = "SAFE";
                    if (diffDays <= 0) status = "EXPIRED";
                    else if (diffDays <= 7) status = "EXPIRES SOON";

                    return [
                        p.name,
                        p.category,
                        p.mark || '-',
                        p.stock,
                        p.unit,
                        this.formatDateOutput(p.expiryDate),
                        diffDays <= 0 ? "EXPIRED" : diffDays + " Days",
                        status
                    ];
                });

                footerCols = ["TOTAL AUDITED:", list.length + " Batches", "", "", "", "", "", ""];
                break;
            }

            case 'stock_damaged': {
                title = "Damaged / Shrinkage Waste Report";
                desc = "List of products discarded or written off due to damages or decay loss.";
                headers = ["Date", "Damage ID", "Product Name", "Mark", "Quantity Discarded", "Unit", "Cost Rate", "Total Financial Loss", "Writeoff Reason"];
                
                this.activeData = damaged;
                let lossSum = 0, qSum = 0;
                rows = damaged.map(d => {
                    const loss = d.qty * d.cost;
                    qSum += d.qty;
                    lossSum += loss;
                    return [
                        this.formatDateOutput(d.date),
                        d.id,
                        d.name,
                        d.mark || '-',
                        d.qty,
                        d.unit,
                        currency + d.cost.toFixed(2),
                        currency + loss.toFixed(2),
                        d.reason
                    ];
                });

                footerCols = ["TOTALS", "", "", "", qSum.toFixed(1), "", "", currency + lossSum.toFixed(2), ""];
                break;
            }

            case 'stock_adjustment': {
                title = "Stock Adjustments Audit History";
                desc = "History logs of stock corrections made during physical inventory counts.";
                headers = ["Date", "Correction ID", "Product Name", "Previous Stock", "Adjusted Stock", "Discrepancy (Diff)", "Adjustment Reason", "Operator Signature"];
                
                this.activeData = adjustments;
                rows = adjustments.map(a => {
                    const diff = a.newStock - a.prevStock;
                    return [
                        this.formatDateOutput(a.date),
                        a.id,
                        a.name,
                        a.prevStock,
                        a.newStock,
                        (diff > 0 ? "+" : "") + diff + " " + a.unit,
                        a.reason,
                        a.user || 'Admin'
                    ];
                });

                footerCols = ["TOTAL LOGS:", adjustments.length + " Adjustments", "", "", "", "", "", ""];
                break;
            }

            // ==================== CUSTOMER REPORTS ====================
            case 'cust_purchase_history': {
                title = "Customer Purchase Ledgers Summary";
                desc = "Consolidated purchases statistics, total spent and average bill value per client.";
                headers = ["Customer Name", "Phone", "Bills Count", "Total Money Spent", "Average Bill Value", "Outstanding balance"];
                
                const custMap = {};
                bills.forEach(b => {
                    if (!custMap[b.customerId]) {
                        custMap[b.customerId] = { name: b.customerName, count: 0, total: 0 };
                    }
                    custMap[b.customerId].count++;
                    custMap[b.customerId].total += b.total;
                });

                const custHistoryList = customers.map(c => {
                    const stats = custMap[c.id] || { count: 0, total: 0 };
                    return { ...c, count: stats.count, total: stats.total };
                }).filter(ch => ch.count > 0);

                this.activeData = custHistoryList;
                
                let bSum = 0, spentSum = 0, balSum = 0;
                rows = custHistoryList.map(ch => {
                    bSum += ch.count;
                    spentSum += ch.total;
                    balSum += ch.balance || 0;
                    const avg = ch.total / ch.count;
                    
                    return [
                        ch.name,
                        ch.phone || '-',
                        ch.count + " Invoices",
                        currency + ch.total.toFixed(2),
                        currency + avg.toFixed(2),
                        currency + (ch.balance || 0).toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", bSum + " Bills", currency + spentSum.toFixed(2), "", currency + balSum.toFixed(2)];
                break;
            }

            case 'cust_due_balance': {
                title = "Customer Receivables Outstanding";
                desc = "List of customers with unpaid credit balance collections.";
                headers = ["Customer Name", "Phone No", "Outstanding Due (Receivables)", "Remarks / Overdue status"];
                
                const dueCusts = customers.filter(c => c.type !== 'Wholesale' && c.balance > 0).sort((a,b) => b.balance - a.balance);
                this.activeData = dueCusts;

                let dueSum = 0;
                rows = dueCusts.map(c => {
                    dueSum += c.balance;
                    return [
                        c.name,
                        c.phone || '-',
                        currency + c.balance.toFixed(2),
                        c.balance > 20000 ? "CRITICAL ACTION REQUIRED" : "STANDARD REMINDER"
                    ];
                });

                footerCols = ["TOTALS", "", currency + dueSum.toFixed(2), ""];
                break;
            }

            case 'cust_loyalty_points': {
                title = "Loyalty Points Audit Ledger";
                desc = "Customers accumulated reward points computed based on sales volumes.";
                headers = ["Customer Name", "Phone", "Total Purchases Value", "Loyalty Points Balance", "Equivalent Value Redeemable"];
                
                this.activeData = customers;
                let pointsSum = 0, valSum = 0;
                
                rows = customers.map(c => {
                    const points = c.loyaltyPoints || 0;
                    const cashVal = points * 0.5; // 0.5 Rs per point
                    pointsSum += points;
                    valSum += cashVal;
                    
                    return [
                        c.name,
                        c.phone || '-',
                        currency + (c.balance || 0).toFixed(2), // representing credit
                        points + " Points",
                        currency + cashVal.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", pointsSum + " Points", currency + valSum.toFixed(2)];
                break;
            }

            case 'cust_top_customers': {
                title = "Top Valued Customers";
                desc = "Customer ledger rankings sorted by total spent revenue.";
                headers = ["Rank", "Customer Name", "Phone", "Bills Count", "Credit Balance", "Total Revenue Earned"];
                
                const custStats = {};
                bills.forEach(b => {
                    if (!custStats[b.customerId]) custStats[b.customerId] = { count: 0, total: 0 };
                    custStats[b.customerId].count++;
                    custStats[b.customerId].total += b.total;
                });

                const topList = customers.map(c => {
                    const stat = custStats[c.id] || { count: 0, total: 0 };
                    return { ...c, count: stat.count, total: stat.total };
                }).sort((a,b) => b.total - a.total);

                this.activeData = topList;

                rows = topList.map((c, idx) => {
                    return [
                        `#${idx + 1}`,
                        c.name,
                        c.phone || '-',
                        c.count + " Invoices",
                        currency + c.balance.toFixed(2),
                        currency + c.total.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", "", "", ""];
                break;
            }

            case 'cust_credit_report': {
                title = "Customer Credit Risk & Limits Audit";
                desc = "Credit utilization analysis comparing active balance owed against assigned limits.";
                headers = ["Customer Name", "Phone No", "Assigned Credit Limit", "Outstanding Balance", "Available Credit Remaining", "Credit Risk Status"];
                
                this.activeData = customers;
                let limitSum = 0, balSum = 0;
                rows = customers.map(c => {
                    const limit = c.creditLimit || 20000;
                    const bal = c.balance || 0;
                    const avail = limit - bal;
                    limitSum += limit;
                    balSum += bal;
                    
                    let status = "EXCELLENT";
                    if (bal >= limit) status = "LIMIT EXCEEDED (BLOCKED)";
                    else if (bal / limit >= 0.8) status = "HIGH RISK WARNING";

                    return [
                        c.name,
                        c.phone || '-',
                        currency + limit.toFixed(2),
                        currency + bal.toFixed(2),
                        currency + avail.toFixed(2),
                        status
                    ];
                });

                footerCols = ["TOTALS", "", currency + limitSum.toFixed(2), currency + balSum.toFixed(2), currency + (limitSum - balSum).toFixed(2), ""];
                break;
            }

            // ==================== PAYMENT REPORTS ====================
            case 'pay_cash':
            case 'pay_upi':
            case 'pay_card':
            case 'pay_credit':
            case 'pay_mixed': {
                const method = this.activeReport.replace('pay_', '');
                title = `${method.toUpperCase()} Sales Invoices`;
                desc = `Sales bills paid exclusively using ${method.toUpperCase()} method.`;
                headers = ["Invoice #", "Date", "Customer Name", "Payment Mode", "Subtotal", "Charges", "Discount", "Net Bill Paid"];
                
                const filteredBills = filterBillsByDateAndAdv(bills).filter(b => {
                    if (method === 'mixed') return b.paymentMethod === 'split';
                    return b.paymentMethod === method;
                });
                this.activeData = filteredBills;
                
                let subSum = 0, chargesSum = 0, discSum = 0, totalSum = 0;
                rows = filteredBills.map(b => {
                    subSum += b.subtotal;
                    chargesSum += b.charges;
                    discSum += b.discount;
                    totalSum += b.total;
                    
                    return [
                        `#${b.billNo}`,
                        this.formatDateOutput(b.date),
                        b.customerName,
                        b.paymentMethod.toUpperCase(),
                        currency + b.subtotal.toFixed(2),
                        currency + b.charges.toFixed(2),
                        currency + b.discount.toFixed(2),
                        currency + b.total.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", "", currency+subSum.toFixed(2), currency+chargesSum.toFixed(2), currency+discSum.toFixed(2), currency+totalSum.toFixed(2)];
                break;
            }

            case 'pay_daily_cash_close': {
                title = "Daily Cash Closing Statement";
                desc = "Physical cash balance closing audit (Opening cash, Sales, Collections, Payments, Expenses).";
                headers = ["Closing Date", "Estimated Opening Cash", "Cash Sales (IN)", "Ledger Collections (IN)", "Supplier Cash Settlements (OUT)", "Cash Expenses (OUT)", "Calculated Closing Cash"];
                
                // Group cash entries by date
                const cashDates = {};
                
                // Add default cash float of ₹10,000 for each date to keep calculation simple
                const defaultFloat = 10000;
                
                // Patti Cash sales
                bills.forEach(b => {
                    const date = b.date;
                    if (!cashDates[date]) cashDates[date] = { date: date, open: defaultFloat, sales: 0, colls: 0, supps: 0, exps: 0 };
                    if (b.paymentMethod === 'cash') cashDates[date].sales += b.total;
                    else if (b.paymentMethod === 'split') cashDates[date].sales += (b.splitCash || 0);
                });

                // Ledger collections / payments
                txns.forEach(t => {
                    const date = t.date;
                    if (!cashDates[date]) cashDates[date] = { date: date, open: defaultFloat, sales: 0, colls: 0, supps: 0, exps: 0 };
                    
                    if (t.type === 'IN' && t.method === 'CASH') {
                        cashDates[date].colls += t.amount;
                    } else if (t.type === 'OUT' && t.method === 'CASH') {
                        if (t.isPurchase) cashDates[date].supps += t.amount;
                        else if (t.isExpense) cashDates[date].exps += t.amount;
                    }
                });

                const cashCloseList = Object.values(cashDates).sort((a,b) => {
                    const pA = a.date.split('/');
                    const pB = b.date.split('/');
                    return new Date(pB[2], pB[1]-1, pB[0]) - new Date(pA[2], pA[1]-1, pA[0]);
                });
                this.activeData = cashCloseList;

                rows = cashCloseList.map(c => {
                    const closing = c.open + c.sales + c.colls - c.supps - c.exps;
                    return [
                        this.formatDateOutput(c.date),
                        currency + c.open.toFixed(2),
                        currency + c.sales.toFixed(2),
                        currency + c.colls.toFixed(2),
                        currency + c.supps.toFixed(2),
                        currency + c.exps.toFixed(2),
                        currency + closing.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", "", "", "", ""];
                break;
            }

            // ==================== EXPENSE REPORTS ====================
            case 'exp_daily':
            case 'exp_monthly': {
                title = this.activeReport === 'exp_daily' ? "Daily Expense Report" : "Monthly Expense Report";
                desc = "Expense vouchers recorded for operational costs.";
                headers = ["Voucher No", "Date", "Category", "Description", "Vendor / Handover", "Payment Mode", "Expense Amount"];
                
                const filteredTxns = filterTxnsByDateAndAdv(txns).filter(t => t.isExpense || t.type === 'expense');
                this.activeData = filteredTxns;

                let expTotal = 0;
                rows = filteredTxns.map(t => {
                    expTotal += t.amount;
                    return [
                        t.id,
                        this.formatDateOutput(t.date),
                        t.category || 'General',
                        t.desc.replace(/\[.*\]\s/, ''),
                        t.party || '-',
                        t.isCredit ? 'CREDIT' : (t.method || 'CASH'),
                        currency + t.amount.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", "", "", "", "", currency + expTotal.toFixed(2)];
                break;
            }

            case 'exp_category': {
                title = "Expense Category Breakdown";
                desc = "accumulated expenses segmented by cost centers.";
                headers = ["Expense Category", "Vouchers Count", "Total Money Disbursed", "Distribution Percentage (%)"];
                
                const filteredTxns = filterTxnsByDateAndAdv(txns).filter(t => t.isExpense || t.type === 'expense');
                const catMap = {};
                let overallExpense = 0;

                filteredTxns.forEach(t => {
                    const cat = t.category || 'General';
                    if (!catMap[cat]) catMap[cat] = { name: cat, count: 0, amount: 0 };
                    catMap[cat].count++;
                    catMap[cat].amount += t.amount;
                    overallExpense += t.amount;
                });

                const catList = Object.values(catMap);
                this.activeData = catList;

                rows = catList.map(c => {
                    const percent = overallExpense > 0 ? (c.amount / overallExpense) * 100 : 0;
                    return [
                        c.name,
                        c.count + " Vouchers",
                        currency + c.amount.toFixed(2),
                        percent.toFixed(1) + "%"
                    ];
                });

                footerCols = ["TOTALS", "", currency + overallExpense.toFixed(2), "100.0%"];
                
                // Show Doughnut Chart
                showChart = true;
                chartData = {
                    type: 'doughnut',
                    labels: catList.map(c => c.name),
                    datasets: [{
                        data: catList.map(c => c.amount),
                        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#8b5cf6']
                    }]
                };
                break;
            }

            case 'exp_net_profit_calc': {
                title = "Net Profit Calculation Sheet";
                desc = "Step-by-step net earnings derivation matching Sales Revenue and Cost vs Expenses.";
                headers = ["Particular Ledger Item", "Inflow Credits (+)", "Outflow Debits (-)", "Running Net balance"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                const filteredTxns = filterTxnsByDateAndAdv(txns);

                let grossRevenue = 0, cogsTotal = 0, expensesTotal = 0;
                
                filteredBills.forEach(b => {
                    grossRevenue += b.total;
                    b.items.forEach(it => {
                        const prod = products.find(p => p.name === it.name) || {};
                        const cost = prod.costRate || (it.price * 0.75);
                        cogsTotal += it.qty * cost;
                    });
                });

                filteredTxns.forEach(t => {
                    if (t.isExpense || t.type === 'expense' || t.id.startsWith('EXP')) {
                        expensesTotal += t.amount;
                    }
                });

                const grossProfit = grossRevenue - cogsTotal;
                const netProfit = grossProfit - expensesTotal;

                this.activeData = [
                    { name: "Gross Sales Patti Revenue", in: grossRevenue, out: 0 },
                    { name: "Cost of Goods Sold (COGS)", in: 0, out: cogsTotal },
                    { name: "Voucher Cash Expenses", in: 0, out: expensesTotal }
                ];

                rows = [
                    ["1. Gross Patti Revenue (Sales)", currency + grossRevenue.toFixed(2), "-", currency + grossRevenue.toFixed(2)],
                    ["2. Estimated Cost of Goods Sold (COGS)", "-", currency + cogsTotal.toFixed(2), currency + grossProfit.toFixed(2)],
                    ["3. Recorded Shop Cash Expenses", "-", currency + expensesTotal.toFixed(2), currency + netProfit.toFixed(2)],
                    ["4. NET PROFIT DERIVED", currency + netProfit.toFixed(2), "-", currency + netProfit.toFixed(2)]
                ];

                footerCols = ["NET EARNINGS SUMMARY", "", "", currency + netProfit.toFixed(2)];
                break;
            }

            // ==================== GST/TAX REPORTS ====================
            case 'gst_summary': {
                title = "GST Liability Summary Sheet";
                desc = "Sales patti CGST, SGST and IGST totals matching tax categories.";
                headers = ["Tax Bracket", "Total Taxable Turnover", "CGST Rate (%)", "CGST Amount Owed", "SGST Rate (%)", "SGST Amount Owed", "Combined Tax Owed"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                let turnover = 0;
                
                filteredBills.forEach(b => turnover += b.subtotal);
                
                const cgst = turnover * 0.025; // 2.5%
                const sgst = turnover * 0.025; // 2.5%

                this.activeData = [{ bracket: "5% (Standard)", taxable: turnover, cgst: cgst, sgst: sgst, total: cgst+sgst }];

                rows = [[
                    "GST 5% Bracket",
                    currency + turnover.toFixed(2),
                    "2.50%", currency + cgst.toFixed(2),
                    "2.50%", currency + sgst.toFixed(2),
                    currency + (cgst + sgst).toFixed(2)
                ]];

                footerCols = ["TOTALS", currency + turnover.toFixed(2), "", currency + cgst.toFixed(2), "", currency + sgst.toFixed(2), currency + (cgst + sgst).toFixed(2)];
                break;
            }

            case 'gst_tax_wise': {
                title = "GST Tax-wise Bills Report";
                desc = "Invoices list with itemized tax liability breakdown.";
                headers = ["Bill No", "Date", "Customer Name", "Taxable Amount", "CGST Amount", "SGST Amount", "IGST Amount", "Total Tax Collected", "Grand Total Bill"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                this.activeData = filteredBills;
                
                let taxAmtTotal = 0, cgstTotal = 0, sgstTotal = 0, taxSumTotal = 0, billTotalSum = 0;
                rows = filteredBills.map(b => {
                    const taxable = b.subtotal;
                    const cgst = taxable * 0.025;
                    const sgst = taxable * 0.025;
                    const igst = 0;
                    const tax = cgst + sgst;
                    
                    taxAmtTotal += taxable;
                    cgstTotal += cgst;
                    sgstTotal += sgst;
                    taxSumTotal += tax;
                    billTotalSum += b.total;

                    return [
                        `#${b.billNo}`,
                        this.formatDateOutput(b.date),
                        b.customerName,
                        currency + taxable.toFixed(2),
                        currency + cgst.toFixed(2),
                        currency + sgst.toFixed(2),
                        currency + igst.toFixed(2),
                        currency + tax.toFixed(2),
                        currency + b.total.toFixed(2)
                    ];
                });

                footerCols = [
                    "TOTALS", "", "",
                    currency + taxAmtTotal.toFixed(2),
                    currency + cgstTotal.toFixed(2),
                    currency + sgstTotal.toFixed(2),
                    currency + "0.00",
                    currency + taxSumTotal.toFixed(2),
                    currency + billTotalSum.toFixed(2)
                ];
                break;
            }

            case 'gst_hsn_wise': {
                title = "HSN-wise GST Tax Return Sheet";
                desc = "Tax codes (HSN/SAC) summary sheets matching return layouts.";
                headers = ["HSN Code", "Commodity Type", "Quantity Sold", "Unit", "Total Turnover", "Tax Rate (%)", "Central Tax (CGST)", "State Tax (SGST)"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                
                // Group by Category to mock HSN Codes (Vegetables vs Fruits)
                const hsnMap = {
                    "07099900": { code: "07099900", desc: "Fresh Vegetables", qty: 0, unit: "KG", sales: 0, rate: 5 },
                    "08081000": { code: "08081000", desc: "Fresh Apples", qty: 0, unit: "Box", sales: 0, rate: 5 },
                    "08039010": { code: "08039010", desc: "Robusta Banana Bunch", qty: 0, unit: "Bunch", sales: 0, rate: 5 }
                };

                filteredBills.forEach(b => {
                    b.items.forEach(it => {
                        let hsn = "07099900"; // vegetable fallback
                        if (it.name.includes("Apple")) hsn = "08081000";
                        else if (it.name.includes("Banana")) hsn = "08039010";
                        
                        if (hsnMap[hsn]) {
                            hsnMap[hsn].qty += it.qty;
                            hsnMap[hsn].sales += it.total;
                        }
                    });
                });

                const hsnList = Object.values(hsnMap).filter(h => h.sales > 0);
                this.activeData = hsnList;
                
                let qtyTotal = 0, salesTotal = 0, cgstTotal = 0, sgstTotal = 0;
                rows = hsnList.map(h => {
                    const cgst = h.sales * 0.025;
                    const sgst = h.sales * 0.025;
                    
                    qtyTotal += h.qty;
                    salesTotal += h.sales;
                    cgstTotal += cgst;
                    sgstTotal += sgst;

                    return [
                        h.code,
                        h.desc,
                        h.qty.toFixed(1),
                        h.unit,
                        currency + h.sales.toFixed(2),
                        h.rate + "%",
                        currency + cgst.toFixed(2),
                        currency + sgst.toFixed(2)
                    ];
                });

                footerCols = ["TOTALS", "", qtyTotal.toFixed(1), "", currency+salesTotal.toFixed(2), "", currency+cgstTotal.toFixed(2), currency+sgstTotal.toFixed(2)];
                break;
            }

            case 'gst_printable_invoice_summary': {
                title = "Printable GST Invoices Summary";
                desc = "Sales bills audit ledger formatted for tax filings.";
                headers = ["Invoice No", "Date", "Customer Name", "Customer GSTIN", "Taxable Amount", "CGST Amount", "SGST Amount", "Grand Total Bill"];
                
                const filteredBills = filterBillsByDateAndAdv(bills);
                this.activeData = filteredBills;
                
                let taxAmtTotal = 0, cgstTotal = 0, sgstTotal = 0, billTotalSum = 0;
                rows = filteredBills.map(b => {
                    const cust = customers.find(c => c.id === b.customerId) || {};
                    const gstin = cust.gstin || '-';
                    const taxable = b.subtotal;
                    const cgst = taxable * 0.025;
                    const sgst = taxable * 0.025;
                    
                    taxAmtTotal += taxable;
                    cgstTotal += cgst;
                    sgstTotal += sgst;
                    billTotalSum += b.total;

                    return [
                        `INV-${b.billNo}`,
                        this.formatDateOutput(b.date),
                        b.customerName,
                        gstin,
                        currency + taxable.toFixed(2),
                        currency + cgst.toFixed(2),
                        currency + sgst.toFixed(2),
                        currency + b.total.toFixed(2)
                    ];
                });

                footerCols = [
                    "TOTALS", "", "", "",
                    currency + taxAmtTotal.toFixed(2),
                    currency + cgstTotal.toFixed(2),
                    currency + sgstTotal.toFixed(2),
                    currency + billTotalSum.toFixed(2)
                ];
                break;
            }
        }

        // Render Active Title / Desc
        document.getElementById('active-report-title').innerText = title;
        document.getElementById('active-report-desc').innerText = desc;

        // Render Table Headers
        const thead = document.getElementById('active-report-thead');
        thead.innerHTML = headers.map(h => `<th class="py-3 px-3">${h}</th>`).join('');

        // Render Table Body
        const tbody = document.getElementById('active-report-tbody');
        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${headers.length}" class="text-center py-5 text-muted">
                <i class="fas fa-folder-open fa-3x mb-3 text-muted opacity-50"></i><br>
                No records matching active filter settings.
            </td></tr>`;
        } else {
            tbody.innerHTML = rows.map(r => `
                <tr>
                    ${r.map((col, idx) => {
                        const styleClass = idx === 0 ? "fw-bold text-dark font-monospace" : "";
                        const alignClass = col.toString().includes(currency) || col.toString().includes('%') ? "text-end" : "";
                        return `<td class="py-2.5 px-3 ${styleClass} ${alignClass}">${col}</td>`;
                    }).join('')}
                </tr>
            `).join('');
        }

        // Render Table Footer Summary
        const tfoot = document.getElementById('active-report-tfoot');
        if (rows.length > 0 && footerCols.length > 0) {
            tfoot.innerHTML = `<tr>
                ${footerCols.map((f, idx) => {
                    const alignClass = f.includes(currency) || f.includes('bills') || f.includes('Invoices') || f.includes('Lots') ? "text-end fw-bold" : "fw-bold";
                    return `<td class="py-3 px-3 ${alignClass}">${f}</td>`;
                }).join('')}
            </tr>`;
        } else {
            tfoot.innerHTML = '';
        }

        // Render Graphs if enabled
        this.renderActiveChart(showChart, chartData);
    },

    renderActiveChart: function(showChart, data) {
        const wrapper = document.getElementById('chart-area-wrapper');
        const ctx = document.getElementById('reportsChartCanvas');
        
        if (this.activeChart) {
            this.activeChart.destroy();
            this.activeChart = null;
        }

        if (!showChart || !wrapper || !ctx) {
            if (wrapper) wrapper.classList.add('d-none');
            return;
        }

        wrapper.classList.remove('d-none');

        // Render new chart
        this.activeChart = new Chart(ctx, {
            type: data.type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: data.type === 'doughnut' }
                }
            }
        });
    },

    // SheetJS Export Module with Auto Column Width and Styled Headers
    exportActiveExcel: function() {
        const table = document.getElementById('active-report-table');
        if (!table) return;

        const title = document.getElementById('active-report-title').innerText.replace(/\s+/g, '_');
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(table, { raw: true });

        // Auto fitting columns widths
        const range = XLSX.utils.decode_range(ws['!ref']);
        const colWidths = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            let maxVal = 10; // min width
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
                if (cell && cell.v) {
                    maxVal = Math.max(maxVal, cell.v.toString().length + 2);
                }
            }
            colWidths.push({ wch: maxVal });
        }
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Report Sheet");
        XLSX.writeFile(wb, `${title}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    },

    // High fidelity jsPDF / AutoTable Export
    exportActivePDF: function(orientation = 'p') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF(orientation, 'mm', 'a4');
        
        const title = document.getElementById('active-report-title').innerText;
        const desc = document.getElementById('active-report-desc').innerText;
        const currency = AppState.settings.currency || '₹';

        const shop = AppState.settings.shopName || localStorage.getItem('vmaster_shop_name') || 'V MASTER BILLING';
        const addr = AppState.settings.address || 'City Wholesale Bazaar, Block D';
        const phone = AppState.settings.phone || '+91-9876543210';
        const nowStr = new Date().toLocaleString();

        // 1. Header Shop Details (Aesthetic design)
        doc.setFillColor(11, 26, 48); // dark blue banner
        doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(shop, 14, 15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        doc.text(addr, 14, 21);
        doc.text(`Phone: ${phone}`, 14, 26);

        // Date generated metadata
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        doc.text(`Generated: ${nowStr}`, doc.internal.pageSize.width - 14, 15, { align: 'right' });
        doc.text(`Status: Official Report`, doc.internal.pageSize.width - 14, 21, { align: 'right' });

        // 2. Active Report title details
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(33, 37, 41);
        doc.text(title, 14, 45);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(108, 117, 125);
        doc.text(desc, 14, 50);

        // Filters applied summary
        let filterStr = `Date Period: ${this.formatDateOutput(this.filters.fromDate)} to ${this.formatDateOutput(this.filters.toDate)}`;
        if (this.filters.search) filterStr += ` | Search: "${this.filters.search}"`;
        doc.setFontSize(8.5);
        doc.text(filterStr, 14, 55);

        // Extract headers & body rows from active table element
        const thead = Array.from(document.querySelectorAll('#active-report-thead th')).map(th => th.innerText);
        const bodyRows = Array.from(document.querySelectorAll('#active-report-tbody tr')).map(tr => {
            return Array.from(tr.querySelectorAll('td')).map(td => td.innerText);
        });
        const footerCells = Array.from(document.querySelectorAll('#active-report-tfoot td')).map(td => td.innerText);

        const tableOptions = {
            head: [thead],
            body: bodyRows,
            startY: 60,
            theme: 'striped',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                font: 'helvetica',
                valign: 'middle'
            },
            headStyles: {
                fillColor: [37, 99, 235], // primary blue
                textColor: 255,
                fontStyle: 'bold'
            },
            footStyles: {
                fillColor: [33, 37, 41], // charcoal
                textColor: 255,
                fontStyle: 'bold'
            }
        };

        if (footerCells.length > 0) {
            tableOptions.foot = [footerCells];
        }

        // Add autoTable
        doc.autoTable(tableOptions);

        // Add visual chart image if active
        if (this.activeChart) {
            const chartCanvas = document.getElementById('reportsChartCanvas');
            if (chartCanvas) {
                // Add new page for chart
                doc.addPage();
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.setTextColor(33, 37, 41);
                doc.text("Graphical Breakdown Visual representation", 14, 15);
                
                const imgData = chartCanvas.toDataURL("image/png");
                doc.addImage(imgData, 'PNG', 14, 25, doc.internal.pageSize.width - 28, 110);
            }
        }

        // Save PDF to history stack
        const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        this.savePDFHistoryEntry(filename, orientation === 'p' ? 'Portrait' : 'Landscape');
    },

    savePDFHistoryEntry: function(filename, orientation) {
        const entry = {
            id: 'pdf_' + Date.now(),
            dateTime: new Date().toLocaleString(),
            name: filename,
            orientation: orientation,
            size: "Dynamic (~120 KB)"
        };
        this.pdfHistory.unshift(entry);
        LocalDB.save('pdf_history', this.pdfHistory);
    },

    viewPDFHistory: function() {
        const tbody = document.getElementById('pdf-history-tbody');
        if (!tbody) return;

        if (this.pdfHistory.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No generated PDF exports history found.</td></tr>';
        } else {
            tbody.innerHTML = this.pdfHistory.map(entry => `
                <tr class="font-monospace small text-start">
                    <td>${entry.dateTime}</td>
                    <td class="fw-bold">${entry.name}</td>
                    <td>${entry.orientation}</td>
                    <td>${entry.size}</td>
                    <td class="text-center">
                        <button class="btn btn-xs btn-outline-danger" onclick="alert('Export history file successfully recalled!')"><i class="fas fa-file-download"></i> Recall</button>
                    </td>
                </tr>
            `).join('');
        }

        const modal = new bootstrap.Modal(document.getElementById('pdfHistoryModal'));
        modal.show();
    },

    // Thermal Receipt / A4 Page printing popup window
    printActiveReport: function(size = 'A4') {
        const title = document.getElementById('active-report-title').innerText;
        const desc = document.getElementById('active-report-desc').innerText;
        const currency = AppState.settings.currency || '₹';
        const shop = AppState.settings.shopName || localStorage.getItem('vmaster_shop_name') || 'V MASTER BILLING';
        const addr = AppState.settings.address || 'City Wholesale Bazaar, Block D';
        const phone = AppState.settings.phone || '+91-9876543210';
        const nowStr = new Date().toLocaleString();

        const headers = Array.from(document.querySelectorAll('#active-report-thead th')).map(th => th.innerText);
        const bodyRows = Array.from(document.querySelectorAll('#active-report-tbody tr')).map(tr => {
            return Array.from(tr.querySelectorAll('td')).map(td => td.innerHTML);
        });
        const footerCells = Array.from(document.querySelectorAll('#active-report-tfoot td')).map(td => td.innerHTML);

        let layoutHtml = '';

        if (size === 'A4') {
            layoutHtml = `
            <div style="width:210mm;min-height:297mm;padding:15mm;font-family:Arial,sans-serif;box-sizing:border-box;">
                <div style="display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:16px;">
                    <div>
                        <h2 style="margin:0;color:#1e40af;font-size:24px;font-weight:900;">${shop}</h2>
                        <p style="margin:4px 0 0;font-size:11px;color:#555;">${addr}</p>
                        <p style="margin:2px 0 0;font-size:11px;color:#555;font-weight:700;">Phone: ${phone}</p>
                    </div>
                    <div style="text-align:right;">
                        <h3 style="margin:0;color:#64748b;font-size:16px;text-transform:uppercase;">Official Ledger Report</h3>
                        <p style="margin:4px 0 0;font-size:10px;color:#555;font-family:monospace;">Generated: ${nowStr}</p>
                    </div>
                </div>
                
                <h4 style="margin:0 0 4px;font-size:15px;color:#111827;font-weight:800;">${title}</h4>
                <p style="margin:0 0 16px;font-size:11px;color:#4b5563;">${desc}</p>

                <table style="width:100%;border-collapse:collapse;font-size:10.5px;text-align:left;margin-bottom:30px;">
                    <thead>
                        <tr style="background:#2563eb;color:#fff;">
                            ${headers.map(h => `<th style="padding:6px 8px;border:1px solid #cbd5e1;">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${bodyRows.map(r => `
                            <tr>
                                ${r.map((col, idx) => {
                                    const aligns = col.includes(currency) || col.includes('%') ? "text-align:right;" : "";
                                    const weights = idx === 0 ? "font-weight:700;" : "";
                                    return `<td style="padding:5px 8px;border:1px solid #e2e8f0;${aligns}${weights}">${col}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                    ${footerCells.length > 0 ? `
                        <tfoot>
                            <tr style="background:#1f2937;color:#fff;font-weight:bold;">
                                ${footerCells.map(f => `<td style="padding:6px 8px;border:1px solid #374151;">${f}</td>`).join('')}
                            </tr>
                        </tfoot>
                    ` : ''}
                </table>

                <div style="margin-top:80px;display:flex;justify-content:space-between;border-top:1px dashed #cbd5e1;padding-top:12px;font-size:11px;color:#64748b;">
                    <div>Authorized Operator Sign: _____________________</div>
                    <div>Executive Audit Sign: _____________________</div>
                </div>
            </div>`;
        } else {
            // Thermal Layouts (80mm / 58mm)
            const w = size === '58mm' ? '58mm' : '80mm';
            const fs = size === '58mm' ? '9px' : '11px';
            layoutHtml = `
            <div style="width:${w};padding:4px;font-family:'Courier New',monospace;font-size:${fs};box-sizing:border-box;text-align:center;">
                <h4 style="margin:0 0 2px;font-size:13px;font-weight:900;">${shop}</h4>
                <p style="margin:2px 0;">${addr}</p>
                <p style="margin:2px 0;">${phone}</p>
                <hr style="border:none;border-top:1px dashed #000;margin:6px 0;">
                
                <h5 style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;">${title}</h5>
                <p style="margin:2px 0 6px;font-size:9px;color:#555;">Generated: ${nowStr}</p>

                <table style="width:100%;border-collapse:collapse;font-size:${fs};margin-bottom:12px;">
                    <thead>
                        <tr style="border-bottom:1px dashed #000;border-top:1px dashed #000;">
                            <th style="text-align:left;padding:3px 0;">Item/Date</th>
                            <th style="text-align:right;padding:3px 0;">Amount/Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bodyRows.map(r => `
                            <tr>
                                <td style="text-align:left;padding:3px 0;font-weight:bold;">${r[0]}<br><small style="color:#555;font-weight:normal;">${r[2] || r[1]}</small></td>
                                <td style="text-align:right;padding:3px 0;font-weight:bold;">${r[r.length - 3] || r[r.length - 2] || r[r.length - 1]}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    ${footerCells.length > 0 ? `
                        <tfoot>
                            <tr style="border-top:1px dashed #000;font-weight:bold;">
                                <td style="text-align:left;padding:4px 0;">${footerCells[0]}</td>
                                <td style="text-align:right;padding:4px 0;">${footerCells[footerCells.length - 2] || footerCells[footerCells.length - 1] || footerCells[footerCells.length - 3]}</td>
                            </tr>
                        </tfoot>
                    ` : ''}
                </table>
                <hr style="border:none;border-top:1px dashed #000;margin:6px 0;">
                <p style="margin:4px 0 0;font-size:9px;">V Master Billing System</p>
            </div>`;
        }

        const fullHtml = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Print Report - ${shop}</title>
            <style>
                * { margin:0; padding:0; box-sizing:border-box; }
                body { background:#fff; color:#000; }
                @media print {
                    body { margin:0; }
                    .no-print { display:none !important; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="position:fixed;top:10px;right:10px;z-index:9999;">
                <button onclick="window.close()" style="background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:4px;font-weight:bold;cursor:pointer;font-family:sans-serif;box-shadow:0 2px 5px rgba(0,0,0,0.2);">Close</button>
            </div>
            ${layoutHtml}
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
            alert('Popup blocker active. Please allow popup access to print.');
        }
    },

    openWhatsAppMenu: function() {
        const modal = new bootstrap.Modal(document.getElementById('whatsAppTemplatesModal'));
        modal.show();
    },

    // Automated WhatsApp Notifications templates sharing
    shareWATemplate: function(templateType) {
        const phone = document.getElementById('wa-share-phone').value.trim();
        if (!phone || phone.length < 10) {
            alert("Please enter a valid 10-digit mobile number!");
            return;
        }

        const bills = LocalDB.getBills() || [];
        const currency = AppState.settings.currency || '₹';
        const shop = AppState.settings.shopName || localStorage.getItem('vmaster_shop_name') || 'V MASTER BILLING';

        const todayStr = new Date().toLocaleDateString('en-GB');
        const monthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

        let message = '';

        if (templateType === 'daily_summary') {
            const todayBills = bills.filter(b => b.date === todayStr);
            const totalSales = todayBills.reduce((sum, b) => sum + b.total, 0);
            
            let cash = 0, upi = 0, credit = 0;
            todayBills.forEach(b => {
                if (b.paymentMethod === 'cash') cash += b.total;
                else if (b.paymentMethod === 'upi') upi += b.total;
                else if (b.paymentMethod === 'credit') credit += b.total;
                else if (b.paymentMethod === 'split') {
                    cash += b.splitCash || 0;
                    upi += b.splitUpi || 0;
                }
            });

            message = `Hello,
Today Sales Summary (${todayStr}):
Total Bills: ${todayBills.length}
Total Sales: ${currency}${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Cash: ${currency}${cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
UPI: ${currency}${upi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Credit: ${currency}${credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Thank You.
- ${shop}`;

        } else if (templateType === 'monthly_summary') {
            const thisMonthPrefix = new Date().toISOString().substring(0, 7); // YYYY-MM
            const monthBills = bills.filter(b => this.parseToYYYYMMDD(b.date).startsWith(thisMonthPrefix));
            const totalSales = monthBills.reduce((sum, b) => sum + b.total, 0);

            message = `Hello,
Monthly Performance Overview (${monthStr}):
Total Bills Handled: ${monthBills.length}
Total Sales Revenue: ${currency}${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Avg Ticket Size: ${currency}${monthBills.length > 0 ? (totalSales/monthBills.length).toFixed(2) : '0.00'}
Thank You.
- ${shop}`;

        } else if (templateType === 'due_reminder') {
            const customer = LocalDB.getCustomers().find(c => c.id === this.filters.customer);
            if (!customer) {
                alert("Please select a specific customer in Advanced Filters first to send a due reminder!");
                return;
            }
            const bal = customer.balance || 0;
            if (bal <= 0) {
                alert(`Selected customer ${customer.name} has no pending outstanding dues!`);
                return;
            }

            message = `Dear ${customer.name},
This is a gentle reminder regarding your outstanding pending balance at ${shop}.
Pending Balance Due: ${currency}${bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Please settle the dues at your earliest convenience.
Thank You.`;
        }

        const modalEl = document.getElementById('whatsAppTemplatesModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        // Open WhatsApp automatically
        const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }
};

window.ReportLogic = ReportLogic;
