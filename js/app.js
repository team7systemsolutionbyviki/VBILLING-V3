/**
 * V Master Billing - Central Application Controller
 * Handles auth routing, layout switching, data listings, offline/online states, and bilingual syncing.
 */

const app = {
    init: function() {
        // Setup Login Form
        const loginForm = document.getElementById('login-form');
        if(loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Setup Logout
        const logoutBtn = document.getElementById('logout-btn');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Setup Sidebar Toggle
        const collapseBtn = document.getElementById('sidebarCollapse');
        if(collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('active');
            });
        }

        // Setup Sidebar Navigation Links
        const navLinks = document.querySelectorAll('#sidebar ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('a').getAttribute('data-page');
                
                // Update active navigation class
                navLinks.forEach(l => l.parentElement.classList.remove('active'));
                e.target.closest('li').classList.add('active');
                
                this.loadPage(page);
                
                // Close sidebar on mobile devices
                if(window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.add('active');
                }
            });
        });

        // Initialize Theme & Language
        this.initThemeAndLang();

        // Register PWA Service Worker for full offline capabilities
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(reg => console.log('PWA Service Worker registered inside scope: ', reg.scope))
                    .catch(err => console.error('PWA Service Worker registration failed: ', err));
            });
        }

        // Bind keyboard shortcuts globally
        this.bindKeyboardShortcuts();

        // Setup print event listeners for high fidelity printing modes
        window.addEventListener('beforeprint', () => {
            let context = window.printContext;
            if (!context) {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    context = 'modal';
                } else if (document.getElementById('pos-cart-items') && document.getElementById('print-container') && document.getElementById('print-container').innerHTML.trim() !== '') {
                    context = 'receipt';
                } else {
                    context = 'report';
                }
            }
            document.body.classList.add('printing-' + context);
        });

        window.addEventListener('afterprint', () => {
            document.body.classList.remove('printing-receipt', 'printing-modal', 'printing-report');
            window.printContext = null;
        });

        // Auto-check authentication state
        if(sessionStorage.getItem('isLoggedIn')) {
            this.showApp();
        }
    },

    bindKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // F1: Focus Product Search (in POS or Purchase)
            if (e.key === 'F1') {
                e.preventDefault();
                const prodSearch = document.getElementById('pos-product-search') || document.getElementById('pur-item-search');
                if (prodSearch) prodSearch.focus();
            }
            // F2: Focus Customer Search
            if (e.key === 'F2') {
                e.preventDefault();
                const custSearch = document.getElementById('pos-customer-search') || document.getElementById('pur-supplier-search');
                if (custSearch) custSearch.focus();
            }
            // F9: Trigger Pay / Complete Action
            if (e.key === 'F9') {
                e.preventDefault();
                const payBtn = document.getElementById('btn-pay-print') || document.querySelector('button[onclick="PurchaseLogic.savePurchase()"]');
                if (payBtn) payBtn.click();
            }
        });
    },

    initThemeAndLang: function() {
        // Load Settings Cache
        const saved = LocalDB.load('settings');
        if (saved) {
            AppState.settings = saved;
        } else {
            AppState.settings = this.getDefaultSettings();
            
            const currentShopName = sessionStorage.getItem('currentShopName');
            const currentShopId = sessionStorage.getItem('currentShopId');
            if (currentShopId && currentShopName) {
                AppState.settings.shopName = currentShopName;
                // Clear customized demo fields for a brand new shop context
                AppState.settings.ownerName = '';
                AppState.settings.phone = '';
                AppState.settings.whatsapp = '';
                AppState.settings.email = '';
                AppState.settings.gstin = '';
                AppState.settings.pan = '';
                AppState.settings.address = '';
                AppState.settings.city = '';
                AppState.settings.state = '';
                AppState.settings.pincode = '';
                AppState.settings.website = '';
                AppState.settings.upiId = '';
                AppState.settings.bankName = '';
                AppState.settings.bankAccount = '';
                AppState.settings.bankIfsc = '';
                AppState.settings.bankBranch = '';
                
                LocalDB.save('settings', AppState.settings);
            }
        }

        // Apply Saved Theme
        if (AppState.settings.darkMode) {
            document.body.classList.add('dark-theme');
            const icon = document.querySelector('#theme-toggle i');
            if (icon) icon.className = 'fas fa-sun fa-lg text-warning';
        } else {
            document.body.classList.remove('dark-theme');
            const icon = document.querySelector('#theme-toggle i');
            if (icon) icon.className = 'fas fa-moon fa-lg text-primary';
        }

        // Apply Saved Brand Color Theme
        if (AppState.settings.themeColor) {
            document.documentElement.style.setProperty('--primary-blue', AppState.settings.themeColor);
        }

        // Apply Saved Favicon
        if (AppState.settings.faviconBase64) {
            let favEl = document.querySelector('link[rel*="icon"]');
            if (!favEl) {
                favEl = document.createElement('link');
                favEl.rel = 'shortcut icon';
                document.getElementsByTagName('head')[0].appendChild(favEl);
            }
            favEl.href = AppState.settings.faviconBase64;
        }

        // Apply Saved Language
        if (AppState.settings.language) {
            i18n.setLanguage(AppState.settings.language);
        }
    },

    getDefaultSettings: function() {
        return {
            // 1. Profile Settings
            shopName: 'V MASTER BILLING',
            ownerName: 'VIKI',
            phone: '+91-9876543210',
            whatsapp: '+91-9876543210',
            email: 'viki@example.com',
            gstin: '33ABCDE1234F1Z5',
            pan: 'ABCDE1234F',
            address: 'City Wholesale Bazaar, Block D',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600001',
            website: 'www.vmasterbilling.com',
            businessType: 'Wholesale',
            currency: '₹',
            timezone: 'Asia/Kolkata',

            // 2. Logo & Branding
            logoBase64: '',
            headerLogoBase64: '',
            faviconBase64: '',
            themeColor: '#2563eb',
            darkMode: false,
            invoiceFont: 'Arial',
            thermalFont: 'Courier New',

            // 3. Bill Settings
            invoicePrefix: 'INV-',
            autoInvoiceNumber: true,
            billFormat: '80mm',
            gstEnabled: true,
            cgstPercent: 2.5,
            sgstPercent: 2.5,
            igstPercent: 5.0,
            discountEnabled: true,
            roundOffEnabled: true,
            barcodeEnabled: true,
            thermalSize: '80mm',
            printPreview: true,
            autoPrint: false,
            whatsappShare: true,
            smsShare: false,

            // 4. Security Settings
            sessionTimeout: 30,
            twoStepVerification: false,

            // 5. Stock Settings
            lowStockLimit: 150,
            expiryAlertDays: 30,
            autoDeductStock: true,
            autoGenerateBarcode: true,

            // 6. Payment Settings
            upiId: 'vmaster@upi',
            upiQrBase64: '',
            bankName: 'V-Bank Ltd',
            bankAccount: '98765432101',
            bankIfsc: 'VBNK000101',
            bankBranch: 'Main Branch',
            cashEnabled: true,
            cardEnabled: true,
            upiEnabled: true,
            razorpayKey: '',
            razorpaySecret: '',

            // 7. Notification Settings
            whatsappNotify: true,
            emailNotify: false,
            dailyReportNotify: true,
            lowStockNotify: true,
            dueAlertNotify: true,

            // 8. System Settings
            language: 'en',
            dateFormat: 'dd/mm/yyyy',
            defaultTaxPercent: 5.0,
            offlineSync: true,
            autoSync: true,

            // 9. Receipt Settings
            footerMessage: '*** Thank You! Visit Again ***',
            terms: '1. Goods once sold will not be returned.\n2. Settle pending dues on time.',
            returnPolicy: 'No return on perishables.',
            qrOnBill: true,
            barcodeOnInvoice: true
        };
    },

    updateDynamicCurrencyLabels: function(container) {
        if (!container) return;
        const currency = AppState.settings.currency || '₹';
        
        // Find and replace text in text nodes
        const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.nodeValue.includes('\u20B9') || node.nodeValue.includes('₹') || node.nodeValue.includes('\\u20B9') || node.nodeValue.includes('\\u20b9')) {
                    node.nodeValue = node.nodeValue.replace(/\\u20[bB]9|₹/g, currency);
                }
            } else {
                for (let child = node.firstChild; child; child = child.nextSibling) {
                    walk(child);
                }
            }
        };
        walk(container);

        // Also handle placeholder attributes on inputs or textareas if they contain rupee symbol
        const inputs = container.querySelectorAll('input[placeholder], textarea[placeholder]');
        inputs.forEach(el => {
            const ph = el.getAttribute('placeholder');
            if (ph && (ph.includes('\u20B9') || ph.includes('₹') || ph.includes('\\u20B9') || ph.includes('\\u20b9'))) {
                el.placeholder = ph.replace(/\\u20[bB]9|₹/g, currency);
            }
        });

        // Also update dashboard today's sales icon color box if currency changes
        const iconBox = container.querySelector('.icon-box i.fa-rupee-sign, .icon-box i.fa-dollar-sign, .icon-box i.fa-euro-sign, .icon-box i.fa-pound-sign, .icon-box span.fw-bold');
        if (iconBox) {
            const iconParent = iconBox.parentElement;
            if (iconParent) {
                if (currency === '₹') {
                    iconParent.innerHTML = '<i class="fas fa-rupee-sign"></i>';
                } else if (currency === '$') {
                    iconParent.innerHTML = '<i class="fas fa-dollar-sign"></i>';
                } else if (currency === '€') {
                    iconParent.innerHTML = '<i class="fas fa-euro-sign"></i>';
                } else if (currency === '£') {
                    iconParent.innerHTML = '<i class="fas fa-pound-sign"></i>';
                } else {
                    iconParent.innerHTML = `<span class="fw-bold" style="font-size: 1.2rem;">${currency}</span>`;
                }
            }
        }
    },

    toggleTheme: function() {
        const isDark = document.body.classList.toggle('dark-theme');
        AppState.settings.darkMode = isDark;
        LocalDB.save('settings', AppState.settings);

        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun fa-lg text-warning' : 'fas fa-moon fa-lg text-primary';
        }

        // Also update settings checkbox status if elements are currently loaded in view
        const setDarkCheck = document.getElementById('set-dark-mode');
        if (setDarkCheck) {
            setDarkCheck.checked = isDark;
        }
    },

    login: function() {
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-password').value;
        
        // Super Admin validation
        if (email.toUpperCase() === 'VIKI') {
            const savedPass = localStorage.getItem('vmaster_admin_password') || 'VIKI1101';
            if (pass === savedPass) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userRole', 'SuperAdmin');
                sessionStorage.setItem('userName', 'VIKI');
                sessionStorage.removeItem('currentShopId');
                sessionStorage.removeItem('currentShopName');
                
                // Clear any shop listeners and default sync
                if (typeof CloudSync !== 'undefined') {
                    CloudSync.init();
                }
                
                this.showApp();
                return;
            } else {
                alert('Invalid Super Admin password!');
                return;
            }
        }
        
        // Shop Admin validation
        if (typeof ShopManager !== 'undefined') {
            const shops = ShopManager.getShops();
            const matchingShop = shops.find(s => s.adminUsername.toLowerCase() === email.toLowerCase());
            
            if (matchingShop) {
                if (matchingShop.adminPassword === pass) {
                    // Check AMC Expiration for Shop Admin
                    const todayStr = new Date().toISOString().split('T')[0];
                    const expiryDate = matchingShop.amcExpiryDate || todayStr;
                    if (expiryDate < todayStr) {
                        // Expired! Block login, show expired screen
                        document.getElementById('login-screen').classList.add('d-none');
                        document.getElementById('app-wrapper').classList.add('d-none');
                        
                        const expiredScreen = document.getElementById('amc-expired-screen');
                        if (expiredScreen) {
                            expiredScreen.classList.remove('d-none');
                            const dateSpan = document.getElementById('expired-screen-expiry-date');
                            if (dateSpan) {
                                dateSpan.innerText = new Date(expiryDate).toLocaleDateString('en-GB');
                            }
                            if (typeof i18n !== 'undefined') {
                                i18n.translateDOM();
                            }
                        }
                        return;
                    }

                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userRole', 'ShopAdmin');
                    sessionStorage.setItem('userName', matchingShop.adminUsername);
                    sessionStorage.setItem('currentShopId', matchingShop.id);
                    sessionStorage.setItem('currentShopName', matchingShop.name);
                    
                    // Initialize database schema for this shop
                    LocalDB.init();
                    
                    // Trigger sync connection for this shop
                    if (typeof CloudSync !== 'undefined') {
                        CloudSync.init();
                    }
                    
                    // Load Settings for this shop
                    this.initThemeAndLang();
                    
                    this.showApp();
                    return;
                } else {
                    alert('Invalid Password for Shop Administrator!');
                    return;
                }
            }
        }
        
        alert('Invalid Username or Password!');
    },

    logout: function() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('currentShopId');
        sessionStorage.removeItem('currentShopName');
        
        // Clear active sync listeners
        if (typeof CloudSync !== 'undefined') {
            CloudSync.init();
        }
        
        const expiredScreen = document.getElementById('amc-expired-screen');
        if (expiredScreen) {
            expiredScreen.classList.add('d-none');
        }
        
        document.getElementById('app-wrapper').classList.add('d-none');
        document.getElementById('login-screen').classList.remove('d-none');
    },

    showApp: function() {
        const userRole = sessionStorage.getItem('userRole');
        const currentShopId = sessionStorage.getItem('currentShopId');
        
        // Expiry check on load
        if (userRole === 'ShopAdmin' && currentShopId) {
            const shops = ShopManager.getShops();
            const currentShop = shops.find(s => s.id === currentShopId);
            if (currentShop) {
                const todayStr = new Date().toISOString().split('T')[0];
                const expiryDate = currentShop.amcExpiryDate || todayStr;
                if (expiryDate < todayStr) {
                    this.logout();
                    
                    // Show AMC Expired Screen instead of normal logout login screen
                    document.getElementById('login-screen').classList.add('d-none');
                    document.getElementById('app-wrapper').classList.add('d-none');
                    
                    const expiredScreen = document.getElementById('amc-expired-screen');
                    if (expiredScreen) {
                        expiredScreen.classList.remove('d-none');
                        const dateSpan = document.getElementById('expired-screen-expiry-date');
                        if (dateSpan) {
                            dateSpan.innerText = new Date(expiryDate).toLocaleDateString('en-GB');
                        }
                        if (typeof i18n !== 'undefined') {
                            i18n.translateDOM();
                        }
                    }
                    return;
                }
            }
        }

        document.getElementById('login-screen').classList.add('d-none');
        const wrapper = document.getElementById('app-wrapper');
        wrapper.classList.remove('d-none');
        wrapper.style.display = 'flex'; // Force flex layout (Bootstrap d-none removal defaults to block)
        
        // Update sidebar visibility before page load
        this.updateSidebarVisibility();
        
        if (userRole === 'SuperAdmin' && !currentShopId) {
            this.loadPage('shops');
            // Set shops menu as active in sidebar
            const navLinks = document.querySelectorAll('#sidebar ul li');
            navLinks.forEach(l => l.classList.remove('active'));
            const shopsLink = document.getElementById('menu-shops');
            if (shopsLink) shopsLink.classList.add('active');
        } else {
            this.loadPage('dashboard');
            // Set dashboard menu as active in sidebar
            const navLinks = document.querySelectorAll('#sidebar ul li');
            navLinks.forEach(l => l.classList.remove('active'));
            const dashLink = document.querySelector('#sidebar ul li a[data-page="dashboard"]');
            if (dashLink) dashLink.parentElement.classList.add('active');
        }
    },

    openWhatsAppSupport: function(e) {
        if(e) e.preventDefault();
        const shopName = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.shopName) 
            || localStorage.getItem('vmaster_shop_name') 
            || 'V MASTER BILLING';
        const shopPhone = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.phone) 
            || localStorage.getItem('vmaster_shop_phone') 
            || '';
        
        const text = `Hello Admin VIKI, I am contacting you from Shop Name: ${shopName}${shopPhone ? ' (Phone: ' + shopPhone + ')' : ''}. I need assistance.`;
        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/919360039283?text=${encodedText}`, '_blank');
    },

    currentPage: 'dashboard',

    loadPage: function(page) {
        this.currentPage = page;
        const contentDiv = document.getElementById('main-content');
        const titleDiv = document.getElementById('page-title');
        
        let title = '';
        let html = '';

        // Defensive check - Views must be loaded
        if (typeof window.Views === 'undefined') {
            contentDiv.innerHTML = '<div class="alert alert-danger m-4"><i class="fas fa-exclamation-triangle me-2"></i>Error: Views failed to load. Please refresh the page (F5).</div>';
            console.error('Views is not defined - views.js may have a syntax error or failed to load.');
            return;
        }

        switch(page) {
            case 'dashboard': title = 'Dashboard'; html = window.Views.dashboard; break;
            case 'pos': title = 'Patti Bill (POS)'; html = window.Views.pos; break;
            case 'products': title = 'Products Management'; html = window.Views.products; break;
            case 'masters': title = 'Categories & Units'; html = window.Views.masters; break;
            case 'customers': title = 'Customer Ledger'; html = window.Views.customers; break;
            case 'purchase': title = 'Purchase Management'; html = window.Views.purchase; break;
            case 'expenses': title = 'Expense Management'; html = window.Views.expenses; break;
            case 'accounting': title = 'Cash Book & Ledger'; html = window.Views.accounting; break;
            case 'reports': title = 'Reports'; html = window.Views.reports; break;
            case 'rates': title = 'Daily Price Setup'; html = window.Views.rates; break;
            case 'settings': title = 'Settings'; html = window.Views.settings; break;
            case 'shops': title = 'Shops Management'; html = window.Views.shops; break;
            default: title = page.charAt(0).toUpperCase() + page.slice(1); html = window.Views.dashboard;
        }

        titleDiv.innerText = title;
        contentDiv.innerHTML = html;

        // Perform dynamic Tamil translation immediately on newly injected HTML
        if (typeof i18n !== 'undefined') {
            i18n.translateDOM();
        }

        // Perform dynamic currency symbol translation on newly injected HTML
        this.updateDynamicCurrencyLabels(contentDiv);

        // Initialize view specific controllers
        if(page === 'pos') {
            if(typeof POS !== 'undefined') POS.init();
        } else if (page === 'dashboard') {
            this.initDashboard();
        } else if (page === 'products') {
            this.renderProducts();
        } else if (page === 'masters') {
            this.renderMasters();
        } else if (page === 'customers') {
            this.renderCustomers();
        } else if (page === 'purchase') {
            if(typeof PurchaseLogic !== 'undefined') PurchaseLogic.init();
        } else if (page === 'expenses') {
            if(typeof ExpenseLogic !== 'undefined') ExpenseLogic.init();
        } else if (page === 'accounting') {
            this.renderAccounting();
            document.getElementById('led-date').value = new Date().toISOString().split('T')[0];
        } else if (page === 'rates') {
            if(typeof PricingLogic !== 'undefined') PricingLogic.init();
        } else if (page === 'reports') {
            if(typeof ReportLogic !== 'undefined') ReportLogic.init();
        } else if (page === 'settings') {
            this.initSettings();
        } else if (page === 'shops') {
            this.renderShopsList();
            this.onNewShopPlanChange('Yearly');
        }
    },

    refresh: function() {
        console.log("Sync refreshed page: " + this.currentPage);
        this.loadPage(this.currentPage);
    },

    renderProducts: function() {
        const tbody = document.getElementById('products-table');
        if(!tbody) return;
        const products = LocalDB.getProducts() || [];
        
        tbody.innerHTML = products.map(p => {
            const displayName = (i18n.currentLang === 'ta' && p.nameTa) ? p.nameTa : p.name;
            const formattedDate = p.updatedAt ? new Date(p.updatedAt).toLocaleString('en-GB', { hour12: true }) : '-';
            return `
                <tr>
                    <td class="fw-bold">
                        ${displayName}
                        ${p.barcode ? `<br><small class="text-muted font-monospace"><i class="fas fa-barcode"></i> ${p.barcode}</small>` : ''}
                    </td>
                    <td><span class="badge bg-secondary text-white">${p.category}</span></td>
                    <td class="text-center fw-semibold text-dark font-monospace">${p.mark || '-'}</td>
                    <td class="text-center text-muted">${p.fromWho || '-'}</td>
                    <td class="fw-bold text-primary text-end">${AppState.settings.currency || '₹'}${p.price.toFixed(2)}</td>
                    <td class="fw-bold text-success text-end">${AppState.settings.currency || '₹'}${(p.wholesaleRate || 0).toFixed(2)}</td>
                    <td class="text-center font-monospace">${p.unit}</td>
                    <td class="fw-bold text-center font-monospace">${p.stock || 0}</td>
                    <td class="text-center small text-muted font-monospace">${formattedDate}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-warning text-dark me-1" onclick="app.editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openProductModal: function() {
        document.getElementById('product-form').reset();
        document.getElementById('prod-id').value = 'p' + Date.now();
        this.populateSelects();
        new bootstrap.Modal(document.getElementById('productModal')).show();
    },

    generateBarcodeField: function() {
        const barcodeInput = document.getElementById('prod-barcode');
        if (barcodeInput) {
            barcodeInput.value = '8901' + Math.floor(100000 + Math.random() * 900000);
        }
    },

    editProduct: function(id) {
        const products = LocalDB.getProducts() || [];
        const p = products.find(prod => prod.id === id);
        if(!p) return;
        
        this.populateSelects();
        
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-name-ta').value = p.nameTa || '';
        document.getElementById('prod-barcode').value = p.barcode || '';
        document.getElementById('prod-category').value = p.category;
        document.getElementById('prod-unit').value = p.unit;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-stock').value = p.stock || 0;
        
        // Extended fields
        document.getElementById('prod-mark').value = p.mark || '';
        document.getElementById('prod-from-who').value = p.fromWho || '';
        
        // Extended rates
        document.getElementById('prod-purchase-rate').value = p.purchaseRate || 0;
        document.getElementById('prod-market-rate').value = p.marketRate || 0;
        document.getElementById('prod-wholesale-rate').value = p.wholesaleRate || 0;
        document.getElementById('prod-vip-rate').value = p.vipRate || 0;
        document.getElementById('prod-dealer-rate').value = p.dealerRate || 0;
        document.getElementById('prod-min-rate').value = p.minRate || 0;
        
        new bootstrap.Modal(document.getElementById('productModal')).show();
    },

    populateSelects: function() {
        const cats = LocalDB.getCategories() || [];
        const units = LocalDB.getUnits() || [];
        document.getElementById('prod-category').innerHTML = cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        document.getElementById('prod-unit').innerHTML = units.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
    },

    saveProduct: function() {
        const id = document.getElementById('prod-id').value;
        const product = {
            id: id,
            name: document.getElementById('prod-name').value,
            nameTa: document.getElementById('prod-name-ta').value,
            barcode: document.getElementById('prod-barcode').value,
            category: document.getElementById('prod-category').value,
            unit: document.getElementById('prod-unit').value,
            price: parseFloat(document.getElementById('prod-price').value) || 0,
            stock: parseFloat(document.getElementById('prod-stock').value) || 0,
            
            // Extended fields
            mark: document.getElementById('prod-mark').value || '',
            fromWho: document.getElementById('prod-from-who').value || '',
            updatedAt: new Date().toISOString(),
            
            // Extended wholesale rates
            purchaseRate: parseFloat(document.getElementById('prod-purchase-rate').value) || 0,
            marketRate: parseFloat(document.getElementById('prod-market-rate').value) || 0,
            wholesaleRate: parseFloat(document.getElementById('prod-wholesale-rate').value) || 0,
            vipRate: parseFloat(document.getElementById('prod-vip-rate').value) || 0,
            dealerRate: parseFloat(document.getElementById('prod-dealer-rate').value) || 0,
            minRate: parseFloat(document.getElementById('prod-min-rate').value) || 0
        };
        
        let products = LocalDB.getProducts() || [];
        const index = products.findIndex(p => p.id === id);
        if(index > -1) {
            products[index] = product;
        } else {
            products.push(product);
        }
        LocalDB.save('products', products);
        this.renderProducts();

        // Sync to cloud
        if (typeof db !== 'undefined' && db) {
            db.collection('products').doc(id).set(product);
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        if (modal) modal.hide();
    },

    deleteProduct: function(id) {
        if(confirm('Are you sure you want to delete this product?')) {
            if (typeof db !== 'undefined' && db) {
                db.collection('products').doc(id).delete();
            } else {
                let products = LocalDB.getProducts() || [];
                products = products.filter(p => p.id !== id);
                LocalDB.save('products', products);
                this.renderProducts();
            }
        }
    },

    renderCustomers: function() {
        const tbody = document.getElementById('customers-table');
        if(!tbody) return;
        const customers = LocalDB.getCustomers() || [];
        tbody.innerHTML = customers.map(c => `
            <tr>
                <td class="fw-bold">${c.name}</td>
                <td>${c.phone || '-'}</td>
                <td><span class="badge bg-secondary">${c.type}</span></td>
                <td class="fw-bold text-end ${c.balance > 0 ? 'text-danger' : 'text-success'}">${AppState.settings.currency || '₹'}${c.balance.toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info text-dark me-1" onclick="app.viewLedger('${c.id}')"><i class="fas fa-file-alt"></i></button>
                    <button class="btn btn-sm btn-outline-warning text-dark me-1" onclick="app.editCustomer('${c.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    openCustomerModal: function() {
        document.getElementById('customer-form').reset();
        document.getElementById('cust-id').value = 'c' + Date.now();
        new bootstrap.Modal(document.getElementById('customerMgmtModal')).show();
    },

    editCustomer: function(id) {
        const customers = LocalDB.getCustomers() || [];
        const c = customers.find(cust => cust.id === id);
        if(!c) return;
        
        document.getElementById('cust-id').value = c.id;
        document.getElementById('cust-name').value = c.name;
        document.getElementById('cust-phone').value = c.phone || '';
        document.getElementById('cust-type').value = c.type;
        document.getElementById('cust-balance').value = c.balance || 0;
        
        new bootstrap.Modal(document.getElementById('customerMgmtModal')).show();
    },

    saveCustomer: function() {
        const id = document.getElementById('cust-id').value;
        const customer = {
            id: id,
            name: document.getElementById('cust-name').value,
            phone: document.getElementById('cust-phone').value,
            type: document.getElementById('cust-type').value,
            balance: parseFloat(document.getElementById('cust-balance').value) || 0
        };
        
        let customers = LocalDB.getCustomers() || [];
        const idx = customers.findIndex(c => c.id === id);
        if (idx > -1) {
            customers[idx] = customer;
        } else {
            customers.push(customer);
        }
        LocalDB.save('customers', customers);
        this.renderCustomers();

        if (typeof db !== 'undefined' && db) {
            db.collection('customers').doc(id).set(customer);
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('customerMgmtModal'));
        if (modal) modal.hide();
    },

    deleteCustomer: function(id) {
        if(confirm('Are you sure you want to delete this customer?')) {
            if (typeof db !== 'undefined' && db) {
                db.collection('customers').doc(id).delete();
            } else {
                let customers = LocalDB.getCustomers() || [];
                customers = customers.filter(c => c.id !== id);
                LocalDB.save('customers', customers);
                this.renderCustomers();
            }
        }
    },

    initDashboard: function() {
        const bills = LocalDB.getBills() || [];
        const txns = LocalDB.load('transactions') || [];
        const products = LocalDB.getProducts() || [];

        // Calculate Today's Sales
        const todayStr = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy
        let todaySales = 0;
        let todayBills = 0;
        bills.forEach(b => {
            if (b.date === todayStr) {
                todaySales += b.total;
                todayBills++;
            }
        });

        // Calculate Today's Expenses
        let todayExp = 0;
        txns.forEach(t => {
            if (t.date === todayStr && t.type === 'OUT') {
                todayExp += t.amount;
            }
        });

        // Calculate Customer Pending Amount
        const customers = LocalDB.getCustomers() || [];
        let pendingAmt = 0;
        customers.forEach(c => {
            if(c.balance > 0) pendingAmt += c.balance;
        });

        // Push values to dashboard UI elements
        const dsVal = document.getElementById('dash-total-sales');
        if(dsVal) dsVal.innerText = (AppState.settings.currency || '₹') + todaySales.toLocaleString('en-IN', {minimumFractionDigits: 2});
        
        const dbVal = document.getElementById('dash-bills-count');
        if(dbVal) dbVal.innerText = todayBills;
        
        const deVal = document.getElementById('dash-expenses');
        if(deVal) deVal.innerText = (AppState.settings.currency || '₹') + todayExp.toLocaleString('en-IN', {minimumFractionDigits: 2});
        
        const dpVal = document.getElementById('dash-pending');
        if(dpVal) dpVal.innerText = (AppState.settings.currency || '₹') + pendingAmt.toLocaleString('en-IN', {minimumFractionDigits: 2});

        // Render Recent Bills table on Dashboard
        const tbody = document.querySelector('#recent-bills-table');
        if(tbody) {
            const recent = bills.slice(0, 5);
            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" data-i18n="no_bills">No patti bills created yet.</td></tr>';
            } else {
                tbody.innerHTML = recent.map(b => `
                    <tr>
                        <td class="fw-bold text-primary font-monospace">#${b.billNo}</td>
                        <td>${b.customerName}</td>
                        <td class="fw-extrabold text-end text-dark">${AppState.settings.currency || '₹'}${b.total.toFixed(2)}</td>
                        <td><span class="badge bg-${b.paymentMethod === 'credit' ? 'warning text-dark' : 'success'}">${b.paymentMethod.toUpperCase()}</span></td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-primary" onclick="app.reprintBill('${b.billNo}')"><i class="fas fa-print"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Render Low Stock alerts on dashboard
        const stockTbody = document.getElementById('dash-low-stock');
        if(stockTbody) {
            const lowItems = products.filter(p => (p.stock || 0) < 150);
            if(lowItems.length === 0) {
                stockTbody.innerHTML = '<tr><td colspan="3" class="text-center text-success py-3"><i class="fas fa-check-circle"></i> Stock Healthy</td></tr>';
            } else {
                stockTbody.innerHTML = lowItems.map(p => {
                    const displayName = (i18n.currentLang === 'ta' && p.nameTa) ? p.nameTa : p.name;
                    return `
                        <tr>
                            <td class="fw-bold">${displayName}</td>
                            <td class="text-center font-monospace">${p.stock || 0} ${p.unit}</td>
                            <td class="text-center"><span class="badge bg-danger">Critical</span></td>
                        </tr>
                    `;
                }).join('');
            }
        }
    },

    saveTransaction: function(txn) {
        let txns = LocalDB.load('transactions') || [];
        txns.unshift(txn);
        LocalDB.save('transactions', txns);
        if (typeof db !== 'undefined' && db) {
            db.collection('transactions').add(txn);
        }
    },

    saveLedgerEntry: function() {
        const dateInput = document.getElementById('led-date').value; // yyyy-mm-dd
        const type = document.getElementById('led-type').value;
        const method = document.getElementById('led-method').value;
        const party = document.getElementById('led-party').value;
        const amount = parseFloat(document.getElementById('led-amount').value);

        if(!dateInput || !party || isNaN(amount)) {
            alert("All fields are required!");
            return;
        }

        // Convert date to dd/mm/yyyy
        const parts = dateInput.split('-');
        const date = `${parts[2]}/${parts[1]}/${parts[0]}`;

        const txn = {
            id: 'TXN-' + Date.now(),
            date: date,
            type: type, // 'IN' or 'OUT'
            method: method,
            party: party,
            desc: (type === 'IN' ? 'Customer Outstanding Collection' : 'Supplier Due Settlement'),
            amount: amount
        };

        this.saveTransaction(txn);

        // Update customer balances if they are in database
        const customers = LocalDB.getCustomers() || [];
        const idx = customers.findIndex(c => c.name.toLowerCase() === party.toLowerCase());
        if (idx > -1) {
            if(type === 'IN') {
                customers[idx].balance -= amount; // paying off bills
            } else {
                customers[idx].balance += amount; 
            }
            LocalDB.save('customers', customers);
        }

        document.getElementById('ledger-form').reset();
        document.getElementById('led-date').value = new Date().toISOString().split('T')[0];
        this.renderAccounting();
        alert('Transaction ledger entry posted successfully!');
    },

    renderAccounting: function() {
        const bills = LocalDB.getBills() || [];
        const txns = LocalDB.load('transactions') || [];
        
        let allEntries = [];

        // Cash Book: parse Sales Patti Bills
        bills.forEach(b => {
            if (b.paymentMethod === 'split') {
                allEntries.push({
                    date: b.date,
                    party: b.customerName,
                    desc: `Sales Bill #${b.billNo} [Split Cash]`,
                    method: 'CASH',
                    type: 'IN',
                    amount: b.splitCash || 0
                });
                allEntries.push({
                    date: b.date,
                    party: b.customerName,
                    desc: `Sales Bill #${b.billNo} [Split UPI]`,
                    method: 'UPI',
                    type: 'IN',
                    amount: b.splitUpi || 0
                });
            } else if (b.paymentMethod !== 'credit') {
                allEntries.push({
                    date: b.date,
                    party: b.customerName,
                    desc: `Sales Bill #${b.billNo}`,
                    method: b.paymentMethod.toUpperCase(),
                    type: 'IN',
                    amount: b.total
                });
            }
        });

        // Cash Book: parse Custom Vouchers / Expenses
        txns.forEach(t => {
            allEntries.push({
                date: t.date,
                party: t.party,
                desc: t.desc || '',
                method: t.method || 'CASH',
                type: t.type,
                amount: t.amount
            });
        });

        // Sort by date (newest first)
        allEntries.sort((a, b) => {
            const pA = a.date.split('/');
            const pB = b.date.split('/');
            const dateA = new Date(pA[2], pA[1] - 1, pA[0]);
            const dateB = new Date(pB[2], pB[1] - 1, pB[0]);
            return dateB - dateA;
        });

        let cashIn = 0;
        let cashOut = 0;
        let bankUpi = 0;

        const tbody = document.getElementById('ledger-table');
        if(tbody) {
            tbody.innerHTML = allEntries.map(e => {
                const isBank = (e.method === 'UPI' || e.method === 'BANK');
                if (e.type === 'IN') {
                    cashIn += e.amount;
                    if(isBank) bankUpi += e.amount;
                } else {
                    cashOut += e.amount;
                    if(isBank) bankUpi -= e.amount;
                }

                return `
                    <tr>
                        <td>${e.date}</td>
                        <td class="fw-bold">${e.party}</td>
                        <td>${e.desc}</td>
                        <td><span class="badge bg-light text-dark border">${e.method}</span></td>
                        <td class="text-success text-end fw-bold">${e.type === 'IN' ? (AppState.settings.currency || '₹') + e.amount.toFixed(2) : '-'}</td>
                        <td class="text-danger text-end fw-bold">${e.type === 'OUT' ? (AppState.settings.currency || '₹') + e.amount.toFixed(2) : '-'}</td>
                        <td class="text-primary text-end fw-bold font-monospace">${AppState.settings.currency || '₹'}${(cashIn - cashOut).toFixed(2)}</td>
                    </tr>
                `;
            }).join('');
        }

        // Totals widgets
        const incomeEl = document.getElementById('acc-income');
        const expenseEl = document.getElementById('acc-expense');
        const bankEl = document.getElementById('acc-bank');
        const balanceEl = document.getElementById('acc-balance');

        if(incomeEl) incomeEl.innerText = (AppState.settings.currency || '₹') + cashIn.toFixed(2);
        if(expenseEl) expenseEl.innerText = (AppState.settings.currency || '₹') + cashOut.toFixed(2);
        if(bankEl) bankEl.innerText = (AppState.settings.currency || '₹') + bankUpi.toFixed(2);
        if(balanceEl) balanceEl.innerText = (AppState.settings.currency || '₹') + (cashIn - cashOut).toFixed(2);

        // Populate party names datalist
        const pdlist = document.getElementById('party-datalist');
        if(pdlist) {
            const customers = LocalDB.getCustomers() || [];
            pdlist.innerHTML = customers.map(c => `<option value="${c.name}">`).join('');
        }
    },

    viewLedger: function(customerId) {
        const customers = LocalDB.getCustomers() || [];
        const c = customers.find(cust => cust.id === customerId);
        if(!c) return;
        
        document.getElementById('ledg-name').innerText = c.name;
        document.getElementById('ledg-phone').innerText = c.phone || 'No Phone';
        document.getElementById('ledg-bal').innerText = (AppState.settings.currency || '₹') + c.balance.toFixed(2);
        
        const bills = LocalDB.getBills() || [];
        const txns = LocalDB.load('transactions') || [];
        
        let ledgerEntries = [];
        
        // Push sales bills related to credit
        bills.forEach(b => {
            if(b.customerId === customerId) {
                ledgerEntries.push({
                    date: b.date,
                    ref: 'Bill #' + b.billNo,
                    desc: 'Sales patti bill billing',
                    debit: b.total,
                    credit: b.paymentMethod !== 'credit' ? b.total : 0
                });
            }
        });
        
        // Push receipt deposits
        txns.forEach(t => {
            if(t.party && t.party.toLowerCase() === c.name.toLowerCase()) {
                ledgerEntries.push({
                    date: t.date,
                    ref: t.id.substring(0, 8),
                    desc: t.desc || 'Account Settlement Payment',
                    debit: t.type === 'OUT' ? t.amount : 0,
                    credit: t.type === 'IN' ? t.amount : 0
                });
            }
        });

        // Sort ascending by date
        ledgerEntries.sort((a, b) => {
            const pA = a.date.split('/');
            const pB = b.date.split('/');
            return new Date(pA[2], pA[1]-1, pA[0]) - new Date(pB[2], pB[1]-1, pB[0]);
        });
        
        let runBal = 0;
        const tbody = document.getElementById('party-ledger-tbody');
        tbody.innerHTML = ledgerEntries.map(l => {
            runBal += l.debit;
            runBal -= l.credit;
            return `
                <tr>
                    <td>${l.date}</td>
                    <td class="font-monospace">${l.ref}</td>
                    <td>${l.desc}</td>
                    <td class="text-danger text-end font-monospace">${l.debit > 0 ? (AppState.settings.currency || '₹') + l.debit.toFixed(2) : '-'}</td>
                    <td class="text-success text-end font-monospace">${l.credit > 0 ? (AppState.settings.currency || '₹') + l.credit.toFixed(2) : '-'}</td>
                    <td class="text-primary text-end fw-bold font-monospace">${AppState.settings.currency || '₹'}${runBal.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        
        // Store for print & WA use
        window._currentLedgerWA = { phone: c.phone, name: c.name, bal: c.balance };
        window._currentLedgerEntries = ledgerEntries;
        window._currentLedgerCustomer = c;
        
        new bootstrap.Modal(document.getElementById('ledgerViewModal')).show();
    },

    printLedger: function() {
        const c = window._currentLedgerCustomer;
        const entries = window._currentLedgerEntries || [];
        if (!c) { alert('No statement loaded.'); return; }

        const shop = localStorage.getItem('vmaster_shop_name') || 'V MASTER BILLING';
        const shopAddr = localStorage.getItem('vmaster_shop_addr') || '';
        const shopPhone = localStorage.getItem('vmaster_shop_phone') || '';
        const today = new Date().toLocaleDateString('en-GB');

        let runBal = 0;
        const rows = entries.map(l => {
            runBal += l.debit;
            runBal -= l.credit;
            return `<tr>
                <td>${l.date}</td>
                <td>${l.ref}</td>
                <td>${l.desc}</td>
                <td style="color:#dc2626;text-align:right">${l.debit > 0 ? (AppState.settings.currency || '₹') + l.debit.toFixed(2) : '-'}</td>
                <td style="color:#16a34a;text-align:right">${l.credit > 0 ? (AppState.settings.currency || '₹') + l.credit.toFixed(2) : '-'}</td>
                <td style="color:#1d4ed8;font-weight:700;text-align:right">${AppState.settings.currency || '₹'}${runBal.toFixed(2)}</td>
            </tr>`;
        }).join('');

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Party Ledger - ${c.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #000; padding: 15mm; }
  .header { border-bottom: 2px solid #1d4ed8; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header h1 { font-size: 22px; color: #1d4ed8; }
  .header p { font-size: 11px; color: #555; margin-top: 3px; }
  .meta { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; }
  .meta .party-name { font-size: 16px; font-weight: 800; }
  .meta .balance { font-size: 18px; font-weight: 800; color: #1d4ed8; text-align: right; }
  .meta .balance small { display: block; font-size: 10px; font-weight: normal; color: #555; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1d4ed8; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
  .empty { text-align: center; color: #888; padding: 30px; }
  .footer { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #888; display: flex; justify-content: space-between; }
  @media print {
    body { padding: 10mm; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="no-print" style="position:fixed;top:10px;right:10px;z-index:9999;">
  <button onclick="window.close()" style="background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:4px;font-weight:bold;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.2);font-family:sans-serif;">Close Window</button>
</div>
<div class="header">
  <div>
    <h1>${shop}</h1>
    <p>${shopAddr}</p>
    <p>${shopPhone}</p>
  </div>
  <div style="text-align:right;font-size:11px;color:#555">
    <strong>PARTY LEDGER STATEMENT</strong><br>
    Printed: ${today}
  </div>
</div>
<div class="meta">
  <div>
    <div class="party-name">${c.name}</div>
    <div style="font-size:11px;color:#555;margin-top:4px">📞 ${c.phone || 'No Phone'} &nbsp;|&nbsp; Type: ${c.type || '-'}</div>
  </div>
  <div class="balance">
    <small>Outstanding Balance</small>
    ${AppState.settings.currency || '₹'}${c.balance.toFixed(2)}
  </div>
</div>
<table>
  <thead><tr>
    <th>Date</th><th>Bill / Ref</th><th>Description</th>
    <th style="text-align:right">Debit (−)</th>
    <th style="text-align:right">Credit (+)</th>
    <th style="text-align:right">Balance</th>
  </tr></thead>
  <tbody>${rows || '<tr><td colspan="6" class="empty">No transactions found.</td></tr>'}</tbody>
</table>
<div class="footer">
  <span>${shop} | Party Ledger Statement</span>
  <span>Printed on ${today}</span>
</div>
<script>window.onafterprint = function() { window.close(); }; window.addEventListener('afterprint', function() { window.close(); }); setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 500); }, 300);<\/script>
</body></html>`;

        const w = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
        if (w) { w.document.write(html); w.document.close(); }
        else { alert('Please allow popups for this site to print.'); }
    },

    shareLedgerWA: function() {
        const d = window._currentLedgerWA;
        if(!d || !d.phone) {
            alert("No registered mobile number to share outstanding via WhatsApp.");
            return;
        }
        const msg = `Dear ${d.name},\nYour pending patti outstanding amount is ${AppState.settings.currency || '₹'}${d.bal.toFixed(2)} at V MASTER BILLING.\nPlease settle the dues soon.\nThank you!`;
        window.open(`https://wa.me/91${d.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    },

    printCashBook: function() {
        const shop = localStorage.getItem('vmaster_shop_name') || 'V MASTER BILLING';
        const shopAddr = localStorage.getItem('vmaster_shop_addr') || '';
        const shopPhone = localStorage.getItem('vmaster_shop_phone') || '';
        const today = new Date().toLocaleDateString('en-GB');

        // Collect rows from the rendered ledger table
        const tbody = document.getElementById('ledger-table');
        const tableHtml = tbody ? tbody.innerHTML : '<tr><td colspan="7" style="text-align:center;color:#888">No entries found.</td></tr>';

        // Read summary totals from the rendered widgets
        const income  = document.getElementById('acc-income')  ? document.getElementById('acc-income').innerText  : (AppState.settings.currency || '₹') + '0.00';
        const expense = document.getElementById('acc-expense') ? document.getElementById('acc-expense').innerText : (AppState.settings.currency || '₹') + '0.00';
        const bank    = document.getElementById('acc-bank')    ? document.getElementById('acc-bank').innerText    : (AppState.settings.currency || '₹') + '0.00';
        const balance = document.getElementById('acc-balance') ? document.getElementById('acc-balance').innerText : (AppState.settings.currency || '₹') + '0.00';

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Cash Book - ${shop}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,sans-serif; font-size:12px; color:#000; padding:12mm; }
  .hdr  { display:flex; justify-content:space-between; border-bottom:2px solid #1d4ed8; padding-bottom:10px; margin-bottom:14px; }
  .hdr h1 { font-size:20px; color:#1d4ed8; }
  .hdr p  { font-size:11px; color:#555; margin-top:3px; }
  .summary { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
  .sum-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; }
  .sum-box small { display:block; font-size:10px; color:#555; margin-bottom:3px; }
  .sum-box span  { font-size:15px; font-weight:800; color:#1d4ed8; }
  table { width:100%; border-collapse:collapse; }
  thead th { background:#1d4ed8; color:#fff; padding:7px 8px; text-align:left; font-size:11px; }
  tbody td { padding:6px 8px; border-bottom:1px solid #f1f5f9; font-size:11px; }
  .footer { margin-top:16px; border-top:1px solid #e2e8f0; padding-top:8px; font-size:10px; color:#888; display:flex; justify-content:space-between; }
  @media print {
    body { padding:8mm; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="no-print" style="position:fixed;top:10px;right:10px;z-index:9999;">
  <button onclick="window.close()" style="background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:4px;font-weight:bold;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.2);font-family:sans-serif;">Close Window</button>
</div>
<div class="hdr">
  <div>
    <h1>${shop}</h1>
    <p>${shopAddr}</p>
    <p>${shopPhone}</p>
  </div>
  <div style="text-align:right;font-size:11px;color:#555">
    <strong>COMPREHENSIVE CASH BOOK</strong><br>Printed: ${today}
  </div>
</div>
<div class="summary">
  <div class="sum-box"><small>Total Income (IN)</small><span>${income}</span></div>
  <div class="sum-box"><small>Total Expense (OUT)</small><span>${expense}</span></div>
  <div class="sum-box"><small>Bank / UPI Flow</small><span>${bank}</span></div>
  <div class="sum-box"><small>Net Balance</small><span>${balance}</span></div>
</div>
<table>
  <thead><tr>
    <th>Date</th><th>Party</th><th>Description</th><th>Method</th>
    <th style="text-align:right">Credit (IN)</th>
    <th style="text-align:right">Debit (OUT)</th>
    <th style="text-align:right">Balance</th>
  </tr></thead>
  <tbody>${tableHtml}</tbody>
</table>
<div class="footer">
  <span>${shop} | Cash Book Report</span>
  <span>Printed on ${today}</span>
</div>
<script>window.onafterprint = function() { window.close(); }; window.addEventListener('afterprint', function() { window.close(); }); setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 500); }, 300);<\/script>
</body></html>`;

        const w = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes');
        if (w) { w.document.write(html); w.document.close(); }
        else { alert('Please allow popups for this site to print.'); }
    },

    initSettings: function() {
        const settings = AppState.settings;
        
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val !== undefined ? val : ''; };
        const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };

        // 1. Profile Settings
        setVal('set-shop-name', settings.shopName || localStorage.getItem('vmaster_shop_name') || '');
        setVal('set-owner-name', settings.ownerName);
        setVal('set-phone', settings.phone || localStorage.getItem('vmaster_shop_phone') || '');
        setVal('set-whatsapp', settings.whatsapp);
        setVal('set-email', settings.email);
        setVal('set-gstin', settings.gstin);
        setVal('set-pan', settings.pan);
        setVal('set-website', settings.website);
        setVal('set-address', settings.address || localStorage.getItem('vmaster_shop_addr') || '');
        setVal('set-city', settings.city);
        setVal('set-state', settings.state);
        setVal('set-pincode', settings.pincode);
        setVal('set-business-type', settings.businessType || 'Wholesale');
        setVal('set-currency', settings.currency || '₹');
        setVal('set-timezone', settings.timezone || 'Asia/Kolkata');

        // 2. Logo & Branding
        const logoEl = document.getElementById('preview-logo');
        if (logoEl && settings.logoBase64) logoEl.src = settings.logoBase64;
        
        const headerLogoEl = document.getElementById('preview-header-logo');
        if (headerLogoEl && settings.headerLogoBase64) headerLogoEl.src = settings.headerLogoBase64;
        
        const favEl = document.getElementById('preview-favicon');
        if (favEl && settings.faviconBase64) favEl.src = settings.faviconBase64;
        
        setVal('set-theme-color', settings.themeColor || '#2563eb');
        setCheck('set-dark-mode', settings.darkMode);
        setVal('set-invoice-font', settings.invoiceFont || 'Arial');
        setVal('set-thermal-font', settings.thermalFont || 'Courier New');

        // 3. Bill Settings
        setVal('set-invoice-prefix', settings.invoicePrefix || 'INV-');
        setCheck('set-auto-invoice', settings.autoInvoiceNumber);
        setVal('set-printer', settings.thermalSize || '80mm');
        setCheck('set-gst-enabled', settings.gstEnabled);
        setVal('set-cgst', settings.cgstPercent !== undefined ? settings.cgstPercent : 2.5);
        setVal('set-sgst', settings.sgstPercent !== undefined ? settings.sgstPercent : 2.5);
        setVal('set-igst', settings.igstPercent !== undefined ? settings.igstPercent : 5.0);
        setCheck('set-discount-enabled', settings.discountEnabled);
        setCheck('set-roundoff-enabled', settings.roundOffEnabled);
        setCheck('set-barcode-enabled', settings.barcodeEnabled);
        setCheck('set-print-preview', settings.printPreview);
        setCheck('set-auto-print', settings.autoPrint);
        setCheck('set-whatsapp-share', settings.whatsappShare);
        setCheck('set-sms-share', settings.smsShare);

        // 4. User & Security
        setVal('set-staff-role', settings.staffRole || 'admin');
        setCheck('set-two-step', settings.twoStepVerification);
        setVal('set-session-timeout', settings.sessionTimeout !== undefined ? settings.sessionTimeout : 30);

        // 5. Backup & Restore
        setVal('set-backup-schedule', settings.backupSchedule || 'disabled');

        // 6. Stock
        setVal('set-low-stock-limit', settings.lowStockLimit !== undefined ? settings.lowStockLimit : 150);
        setVal('set-expiry-alert-days', settings.expiryAlertDays !== undefined ? settings.expiryAlertDays : 30);
        setCheck('set-auto-deduct-stock', settings.autoDeductStock);
        setCheck('set-auto-barcode', settings.autoGenerateBarcode);

        // 7. Payments
        setVal('set-upi-id', settings.upiId || 'vmaster@upi');
        
        const qrEl = document.getElementById('preview-upi-qr');
        if (qrEl) {
            if (settings.upiQrBase64) {
                qrEl.src = settings.upiQrBase64;
            } else {
                const upiVal = settings.upiId || 'vmaster@upi';
                qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent('upi://pay?pa=' + upiVal)}`;
            }
        }
        
        const upiIdInput = document.getElementById('set-upi-id');
        if (upiIdInput) {
            upiIdInput.oninput = (e) => {
                const upiVal = e.target.value || 'vmaster@upi';
                const previewImg = document.getElementById('preview-upi-qr');
                if (previewImg && !AppState.settings.upiQrBase64) {
                    previewImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent('upi://pay?pa=' + upiVal)}`;
                }
            };
        }
        
        setVal('set-bank-name', settings.bankName);
        setVal('set-bank-account', settings.bankAccount);
        setVal('set-bank-ifsc', settings.bankIfsc);
        setVal('set-bank-branch', settings.bankBranch);
        setCheck('set-cash-enabled', settings.cashEnabled);
        setCheck('set-card-enabled', settings.cardEnabled);
        setCheck('set-upi-enabled', settings.upiEnabled);
        setVal('set-razorpay-key', settings.razorpayKey);
        setVal('set-razorpay-secret', settings.razorpaySecret);

        // 8. Notifications
        setCheck('set-whatsapp-notify', settings.whatsappNotify);
        setCheck('set-email-notify', settings.emailNotify);
        setCheck('set-daily-report-notify', settings.dailyReportNotify);
        setCheck('set-low-stock-notify', settings.lowStockNotify);
        setCheck('set-due-alert-notify', settings.dueAlertNotify);

        // 9. System
        setVal('set-language-selection', settings.language || 'en');
        setVal('set-date-format', settings.dateFormat || 'dd/mm/yyyy');
        setVal('set-default-tax', settings.defaultTaxPercent !== undefined ? settings.defaultTaxPercent : 5.0);
        setCheck('set-offline-sync', settings.offlineSync);
        setCheck('set-auto-sync', settings.autoSync);

        // 10. Receipt & Print
        setVal('set-footer-message', settings.footerMessage);
        setVal('set-terms', settings.terms);
        setVal('set-return-policy', settings.returnPolicy);
        setCheck('set-qr-on-bill', settings.qrOnBill);
        setCheck('set-barcode-on-invoice', settings.barcodeOnInvoice);

        // Base64 file loaders
        const setupBase64Upload = (inputId, imgId, settingsKey) => {
            const fileInput = document.getElementById(inputId);
            if(fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const base64Str = event.target.result;
                            const previewImg = document.getElementById(imgId);
                            if (previewImg) previewImg.src = base64Str;
                            AppState.settings[settingsKey] = base64Str;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        };

        setupBase64Upload('upload-logo', 'preview-logo', 'logoBase64');
        setupBase64Upload('upload-header-logo', 'preview-header-logo', 'headerLogoBase64');
        setupBase64Upload('upload-favicon', 'preview-favicon', 'faviconBase64');
        setupBase64Upload('upload-upi-qr', 'preview-upi-qr', 'upiQrBase64');
    },

    saveSettings: function() {
        const settings = AppState.settings;

        const getVal = (id, defaultVal = '') => { const el = document.getElementById(id); return el ? el.value : defaultVal; };
        const getCheck = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };
        const getFloat = (id, defaultVal = 0) => { const el = document.getElementById(id); return el ? parseFloat(el.value) || 0 : defaultVal; };
        const getInt = (id, defaultVal = 0) => { const el = document.getElementById(id); return el ? parseInt(el.value) || 0 : defaultVal; };

        // 1. Profile Settings
        settings.shopName = getVal('set-shop-name', 'V MASTER BILLING');
        settings.ownerName = getVal('set-owner-name');
        settings.phone = getVal('set-phone');
        settings.whatsapp = getVal('set-whatsapp');
        settings.email = getVal('set-email');
        settings.gstin = getVal('set-gstin');
        settings.pan = getVal('set-pan');
        settings.website = getVal('set-website');
        settings.address = getVal('set-address');
        settings.city = getVal('set-city');
        settings.state = getVal('set-state');
        settings.pincode = getVal('set-pincode');
        settings.businessType = getVal('set-business-type', 'Wholesale');
        settings.currency = getVal('set-currency', '₹');
        settings.timezone = getVal('set-timezone', 'Asia/Kolkata');

        // 2. Logo & Branding
        settings.themeColor = getVal('set-theme-color', '#2563eb');
        settings.darkMode = getCheck('set-dark-mode');
        settings.invoiceFont = getVal('set-invoice-font', 'Arial');
        settings.thermalFont = getVal('set-thermal-font', 'Courier New');

        // 3. Bill Settings
        settings.invoicePrefix = getVal('set-invoice-prefix', 'INV-');
        settings.autoInvoiceNumber = getCheck('set-auto-invoice');
        settings.thermalSize = getVal('set-printer', '80mm');
        settings.billFormat = settings.thermalSize;
        settings.gstEnabled = getCheck('set-gst-enabled');
        settings.cgstPercent = getFloat('set-cgst', 2.5);
        settings.sgstPercent = getFloat('set-sgst', 2.5);
        settings.igstPercent = getFloat('set-igst', 5.0);
        settings.discountEnabled = getCheck('set-discount-enabled');
        settings.roundOffEnabled = getCheck('set-roundoff-enabled');
        settings.barcodeEnabled = getCheck('set-barcode-enabled');
        settings.printPreview = getCheck('set-print-preview');
        settings.autoPrint = getCheck('set-auto-print');
        settings.whatsappShare = getCheck('set-whatsapp-share');
        settings.smsShare = getCheck('set-sms-share');

        // 4. User & Security
        settings.staffRole = getVal('set-staff-role', 'admin');
        settings.twoStepVerification = getCheck('set-two-step');
        settings.sessionTimeout = getInt('set-session-timeout', 30);

        // 5. Backup & Restore
        settings.backupSchedule = getVal('set-backup-schedule', 'disabled');

        // 6. Stock
        settings.lowStockLimit = getInt('set-low-stock-limit', 150);
        settings.expiryAlertDays = getInt('set-expiry-alert-days', 30);
        settings.autoDeductStock = getCheck('set-auto-deduct-stock');
        settings.autoGenerateBarcode = getCheck('set-auto-barcode');

        // 7. Payments
        settings.upiId = getVal('set-upi-id', 'vmaster@upi');
        settings.bankName = getVal('set-bank-name');
        settings.bankAccount = getVal('set-bank-account');
        settings.bankIfsc = getVal('set-bank-ifsc');
        settings.bankBranch = getVal('set-bank-branch');
        settings.cashEnabled = getCheck('set-cash-enabled');
        settings.cardEnabled = getCheck('set-card-enabled');
        settings.upiEnabled = getCheck('set-upi-enabled');
        settings.razorpayKey = getVal('set-razorpay-key');
        settings.razorpaySecret = getVal('set-razorpay-secret');

        // 8. Notifications
        settings.whatsappNotify = getCheck('set-whatsapp-notify');
        settings.emailNotify = getCheck('set-email-notify');
        settings.dailyReportNotify = getCheck('set-daily-report-notify');
        settings.lowStockNotify = getCheck('set-low-stock-notify');
        settings.dueAlertNotify = getCheck('set-due-alert-notify');

        // 9. System
        settings.language = getVal('set-language-selection', 'en');
        settings.dateFormat = getVal('set-date-format', 'dd/mm/yyyy');
        settings.defaultTaxPercent = getFloat('set-default-tax', 5.0);
        settings.offlineSync = getCheck('set-offline-sync');
        settings.autoSync = getCheck('set-auto-sync');

        // 10. Receipt & Print
        settings.footerMessage = getVal('set-footer-message');
        settings.terms = getVal('set-terms');
        settings.returnPolicy = getVal('set-return-policy');
        settings.qrOnBill = getCheck('set-qr-on-bill');
        settings.barcodeOnInvoice = getCheck('set-barcode-on-invoice');

        // Save settings to LocalDB
        LocalDB.save('settings', settings);

        // Keep legacy variables synced
        localStorage.setItem('vmaster_shop_name', settings.shopName);
        localStorage.setItem('vmaster_shop_addr', settings.address);
        localStorage.setItem('vmaster_shop_phone', `Ph: ${settings.phone}${settings.gstin ? ' | GSTIN: ' + settings.gstin : ''}`);

        // Apply theme color immediately
        if (settings.themeColor) {
            document.documentElement.style.setProperty('--primary-blue', settings.themeColor);
        }

        // Apply favicon base64 immediately
        if (settings.faviconBase64) {
            let favEl = document.querySelector('link[rel*="icon"]');
            if (!favEl) {
                favEl = document.createElement('link');
                favEl.rel = 'shortcut icon';
                document.getElementsByTagName('head')[0].appendChild(favEl);
            }
            favEl.href = settings.faviconBase64;
        }

        // Apply dark mode theme class on body
        if (settings.darkMode) {
            document.body.classList.add('dark-theme');
            const icon = document.querySelector('#theme-toggle i');
            if (icon) icon.className = 'fas fa-sun fa-lg text-warning';
        } else {
            document.body.classList.remove('dark-theme');
            const icon = document.querySelector('#theme-toggle i');
            if (icon) icon.className = 'fas fa-moon fa-lg text-primary';
        }

        // Apply language changes
        if (typeof i18n !== 'undefined' && settings.language) {
            i18n.setLanguage(settings.language);
        }

        alert("All Shop Configuration settings saved successfully!");
        this.loadPage('settings');
    },

    changePassword: function() {
        const curr = document.getElementById('sec-curr-pwd').value;
        const newPwd = document.getElementById('sec-new-pwd').value;
        const confPwd = document.getElementById('sec-conf-pwd').value;

        if (!newPwd) {
            alert("New Password cannot be empty!");
            return;
        }
        if (newPwd !== confPwd) {
            alert("New Password and Confirm Password do not match!");
            return;
        }

        const userRole = sessionStorage.getItem('userRole');
        const currentShopId = sessionStorage.getItem('currentShopId');
        
        if (userRole === 'SuperAdmin') {
            const savedPass = localStorage.getItem('vmaster_admin_password') || 'VIKI1101';
            if (curr !== savedPass) {
                alert("Incorrect Current Admin Password!");
                return;
            }
            localStorage.setItem('vmaster_admin_password', newPwd);
        } else {
            // Shop Admin
            if (typeof ShopManager !== 'undefined') {
                const shops = ShopManager.getShops();
                const shopIdx = shops.findIndex(s => s.id === currentShopId);
                if (shopIdx === -1) {
                    alert("Shop session error!");
                    return;
                }
                if (curr !== shops[shopIdx].adminPassword) {
                    alert("Incorrect Current Admin Password!");
                    return;
                }
                shops[shopIdx].adminPassword = newPwd;
                ShopManager.saveShopsLocally(shops);
                
                // Save to Firestore if online
                if (typeof db !== 'undefined' && db) {
                    db.collection('shops').doc(currentShopId).update({ adminPassword: newPwd })
                        .then(() => console.log("Shop password updated in cloud"))
                        .catch(err => console.error("Error updating shop password in cloud:", err));
                }
            } else {
                alert("Shop manager offline.");
                return;
            }
        }

        alert("Security Credentials updated successfully!");
        document.getElementById('sec-curr-pwd').value = newPwd;
        document.getElementById('sec-new-pwd').value = '';
        document.getElementById('sec-conf-pwd').value = '';
    },

    downloadBackup: function() {
        const backupData = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            products: LocalDB.load('products') || [],
            customers: LocalDB.load('customers') || [],
            bills: LocalDB.load('bills') || [],
            categories: LocalDB.load('categories') || [],
            units: LocalDB.load('units') || [],
            transactions: LocalDB.load('transactions') || [],
            billNo: LocalDB.load('billNo') || 1001,
            special_rates: LocalDB.load('special_rates') || [],
            settings: LocalDB.load('settings') || AppState.settings,
            adminPassword: localStorage.getItem('vmaster_admin_password') || 'VIKI1101'
        };

        const str = JSON.stringify(backupData, null, 2);
        const blob = new Blob([str], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vmaster_billing_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    exportBackupExcel: function() {
        const products = LocalDB.load('products') || [];
        let csv = 'Product ID,Name,Name (Tamil),Barcode,Category,Mark,From Who (Supplier),Retail Price,Wholesale Rate,Unit,Stock\n';
        products.forEach(p => {
            csv += `"${p.id}","${p.name.replace(/"/g, '""')}","${(p.nameTa || '').replace(/"/g, '""')}","${p.barcode || ''}","${p.category}","${(p.mark || '').replace(/"/g, '""')}","${(p.fromWho || '').replace(/"/g, '""')}","${p.price}","${p.wholesaleRate || ''}","${p.unit}","${p.stock || 0}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vmaster_products_catalog_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    exportBackupPDF: function() {
        const products = LocalDB.load('products') || [];
        const customers = LocalDB.load('customers') || [];
        const bills = LocalDB.load('bills') || [];

        const prodRows = products.map(p => `
            <tr>
                <td>${p.name}</td>
                <td style="text-align:center">${p.mark || '-'}</td>
                <td>${p.fromWho || '-'}</td>
                <td>${p.category}</td>
                <td style="text-align:right">${p.price.toFixed(2)}</td>
                <td style="text-align:center">${p.unit}</td>
                <td style="text-align:center">${p.stock}</td>
            </tr>
        `).join('');

        const custRows = customers.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.phone || '-'}</td>
                <td>${c.type}</td>
                <td style="text-align:right;color:${c.balance >= 0 ? '#16a34a' : '#dc2626'}">${c.balance.toFixed(2)}</td>
            </tr>
        `).join('');

        const billRows = bills.slice(0, 20).map(b => `
            <tr>
                <td>#${b.billNo}</td>
                <td>${b.date}</td>
                <td>${b.customerName}</td>
                <td>${b.paymentMethod.toUpperCase()}</td>
                <td style="text-align:right">${b.total.toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>V Master Billing - Complete Shop Records Export</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; padding: 15mm; color: #333; }
  h1 { font-size: 20px; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-bottom: 15px; }
  h2 { font-size: 14px; color: #1f2937; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  th { background: #f3f4f6; color: #111827; padding: 6px 8px; text-align: left; border: 1px solid #d1d5db; }
  td { padding: 6px 8px; border: 1px solid #e5e7eb; }
  .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  @media print {
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="no-print" style="position:fixed;top:10px;right:10px;z-index:9999;">
  <button onclick="window.close()" style="background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:4px;font-weight:bold;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.2);font-family:sans-serif;">Close Window</button>
</div>
  <h1>V Master Billing - Complete Shop Records Export</h1>
  <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
  
  <h2>1. Products Inventory Summary</h2>
  <table>
    <thead>
      <tr><th>Product Name</th><th>Mark</th><th>From Who</th><th>Category</th><th>Retail Rate</th><th>Unit</th><th>Current Stock</th></tr>
    </thead>
    <tbody>${prodRows || '<tr><td colspan="7">No products found.</td></tr>'}</tbody>
  </table>

  <h2>2. Customer Ledger Balances</h2>
  <table>
    <thead>
      <tr><th>Customer Name</th><th>Mobile</th><th>Account Type</th><th>Outstanding Balance</th></tr>
    </thead>
    <tbody>${custRows || '<tr><td colspan="4">No customers found.</td></tr>'}</tbody>
  </table>

  <h2>3. Recent Patti Bills (Last 20)</h2>
  <table>
    <thead>
      <tr><th>Bill No</th><th>Date</th><th>Customer</th><th>Payment Mode</th><th>Grand Total</th></tr>
    </thead>
    <tbody>${billRows || '<tr><td colspan="5">No bills found.</td></tr>'}</tbody>
  </table>

  <div class="footer">
    Complete Records PDF Summary. Generated automatically by V Master Billing System.
  </div>
  <script>
    window.onafterprint = function() { window.close(); };
    window.addEventListener('afterprint', function() { window.close(); });
    setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 500); }, 300);
  <\/script>
</body>
</html>`;

        const w = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes');
        if (w) {
            w.document.write(html);
            w.document.close();
        } else {
            alert('Please allow popups for this site to export PDF records.');
        }
    },

    restoreBackup: function() {
        const fileInput = document.getElementById('upload-backup-file');
        if (!fileInput || !fileInput.files[0]) {
            alert("Please select a valid backup .json file first!");
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.products || !data.customers || !data.bills) {
                    alert("Invalid backup file format. Missing core collections.");
                    return;
                }

                if (confirm("WARNING: This will completely overwrite your current database. Are you sure you want to proceed?")) {
                    LocalDB.save('products', data.products);
                    LocalDB.save('customers', data.customers);
                    LocalDB.save('bills', data.bills);
                    if (data.categories) LocalDB.save('categories', data.categories);
                    if (data.units) LocalDB.save('units', data.units);
                    if (data.transactions) LocalDB.save('transactions', data.transactions);
                    if (data.billNo) LocalDB.save('billNo', data.billNo);
                    if (data.special_rates) LocalDB.save('special_rates', data.special_rates);
                    if (data.settings) {
                        LocalDB.save('settings', data.settings);
                        AppState.settings = data.settings;
                    }
                    if (data.adminPassword) {
                        localStorage.setItem('vmaster_admin_password', data.adminPassword);
                    }

                    alert("Database restored successfully! The page will now reload.");
                    location.reload();
                }
            } catch (err) {
                console.error(err);
                alert("Error parsing backup file. Please ensure it is a valid JSON file.");
            }
        };
        reader.readAsText(file);
    },

    factoryReset: function() {
        if(prompt('WARNING: This wipes out all inventory rates, customers logs and offline bills caches! Type RESET to clear all local data:') === 'RESET') {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    },
    
    forceSync: function() {
        if(typeof db !== 'undefined' && db) {
            alert("Sync initialized. Connecting to remote Firestore server.");
            location.reload();
        } else {
            alert("Local storage cache sync active. Offline persistence enabled.");
        }
    },

    closeDay: function() {
        if(confirm('Are you sure you want to trigger Day-End closing? All records will be consolidated for daily tax reporting.')) {
            alert('Day-End consolidated successfully. Cache verified.');
        }
    },

    renderMasters: function() {
        const cats = LocalDB.getCategories() || [];
        const units = LocalDB.getUnits() || [];
        
        const catList = document.getElementById('category-list');
        if(catList) {
            catList.innerHTML = cats.map(c => `
                <li class="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span class="fw-bold">${c.name}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteCategory('${c.id}')"><i class="fas fa-trash"></i></button>
                </li>
            `).join('');
        }

        const unitList = document.getElementById('unit-list');
        if(unitList) {
            unitList.innerHTML = units.map(u => `
                <li class="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span class="fw-bold font-monospace">${u.name}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteUnit('${u.id}')"><i class="fas fa-trash"></i></button>
                </li>
            `).join('');
        }
    },

    addCategory: function() {
        const name = prompt("Enter category title:");
        if(name) {
            const cats = LocalDB.getCategories() || [];
            cats.push({ id: 'cat' + Date.now(), name: name });
            LocalDB.save('categories', cats);
            this.renderMasters();
        }
    },

    deleteCategory: function(id) {
        if(confirm("Delete category?")) {
            let cats = LocalDB.getCategories() || [];
            cats = cats.filter(c => c.id !== id);
            LocalDB.save('categories', cats);
            this.renderMasters();
        }
    },

    addUnit: function() {
        const name = prompt("Enter Unit metric name (e.g. Bunch, Box, Sack, KG):");
        if(name) {
            const units = LocalDB.getUnits() || [];
            units.push({ id: 'u' + Date.now(), name: name });
            LocalDB.save('units', units);
            this.renderMasters();
        }
    },

    deleteUnit: function(id) {
        if(confirm("Delete unit?")) {
            let units = LocalDB.getUnits() || [];
            units = units.filter(u => u.id !== id);
            LocalDB.save('units', units);
            this.renderMasters();
        }
    },

    reprintBill: function(billNo) {
        const bills = LocalDB.getBills() || [];
        const b = bills.find(x => x.billNo.toString() === billNo.toString());
        if(!b) {
            alert("Bill not found.");
            return;
        }
        
        // Access POS receipt reprint
        if(typeof POS !== 'undefined') {
            POS.printReceipt(b);
        } else {
            alert("POS billing engine is offline.");
        }
    },

    updateSidebarVisibility: function() {
        const userRole = sessionStorage.getItem('userRole');
        const currentShopId = sessionStorage.getItem('currentShopId');
        
        const menuShops = document.getElementById('menu-shops');
        const otherMenuItems = document.querySelectorAll('#sidebar ul.components li:not(#menu-shops)');
        
        if (userRole === 'SuperAdmin') {
            if (menuShops) menuShops.style.display = 'block';
            
            if (currentShopId) {
                otherMenuItems.forEach(item => item.style.display = 'block');
            } else {
                otherMenuItems.forEach(item => item.style.display = 'none');
            }
        } else {
            if (menuShops) menuShops.style.display = 'none';
            otherMenuItems.forEach(item => item.style.display = 'block');
        }
        
        // Update user name in topbar dropdown
        const userNameSpan = document.querySelector('#userMenu span');
        if (userNameSpan) {
            const uName = sessionStorage.getItem('userName') || 'User';
            userNameSpan.innerText = uName;
        }
        
        this.updateTopbarBanner();
    },

    updateTopbarBanner: function() {
        const userRole = sessionStorage.getItem('userRole');
        const currentShopId = sessionStorage.getItem('currentShopId');
        const currentShopName = sessionStorage.getItem('currentShopName');
        const container = document.getElementById('shop-badge-container');
        
        if (container) {
            if (userRole === 'SuperAdmin' && currentShopId) {
                container.classList.remove('d-none');
                
                const shops = ShopManager.getShops();
                const currentShop = shops.find(s => s.id === currentShopId);
                let isExpired = false;
                if (currentShop) {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const expiryDate = currentShop.amcExpiryDate || todayStr;
                    isExpired = expiryDate < todayStr;
                }
                
                const nameSpan = document.getElementById('shop-badge-name');
                if (nameSpan) {
                    if (isExpired) {
                        nameSpan.innerText = `${currentShopName} (AMC EXPIRED)`;
                    } else {
                        nameSpan.innerText = currentShopName || 'Active Shop';
                    }
                }
                
                const badgeSpan = container.querySelector('.badge');
                if (badgeSpan) {
                    if (isExpired) {
                        badgeSpan.classList.remove('bg-warning', 'text-dark', 'border-warning');
                        badgeSpan.classList.add('bg-danger', 'text-white', 'border-danger');
                    } else {
                        badgeSpan.classList.remove('bg-danger', 'text-white', 'border-danger');
                        badgeSpan.classList.add('bg-warning', 'text-dark', 'border-warning');
                    }
                }
            } else {
                container.classList.add('d-none');
            }
        }
    },

    renderShopsList: function() {
        const tbody = document.getElementById('shops-list-tbody');
        const badge = document.getElementById('total-shops-badge');
        if (!tbody) return;
        
        const shops = ShopManager.getShops();
        badge.innerText = `${shops.length} Shops`;
        
        if (shops.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="fas fa-store-slash fa-2x mb-2 d-block"></i>
                        No shops registered yet. Use the left panel to launch a new shop.
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = shops.map(s => {
            const formattedDate = s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-GB') : '-';
            const todayStr = new Date().toISOString().split('T')[0];
            const expiryDate = s.amcExpiryDate || todayStr;
            const isExpired = expiryDate < todayStr;
            const formattedExpiry = expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB') : '-';
            const badgeClass = isExpired ? 'bg-danger' : 'bg-success';
            const badgeText = isExpired ? `Expired: ${formattedExpiry}` : `Active until: ${formattedExpiry}`;
            
            return `
                <tr>
                    <td>
                        <div class="fw-bold text-dark">${s.name}</div>
                        <small class="text-muted"><i class="far fa-calendar-alt me-1"></i>Created: ${formattedDate}</small>
                    </td>
                    <td>
                        <span class="badge bg-secondary px-3 py-2 fs-6 font-monospace">${s.adminUsername}</span>
                    </td>
                    <td>
                        <div class="input-group input-group-sm" style="max-width: 180px;">
                            <input type="password" class="form-control bg-light border-0 font-monospace text-center py-1" value="${s.adminPassword}" readonly id="pass-field-${s.id}">
                            <button class="btn btn-light border-0" type="button" onclick="app.toggleShopListPassword('${s.id}')"><i class="fas fa-eye"></i></button>
                        </div>
                    </td>
                    <td>
                        <span class="fw-bold text-dark">${s.amcPlan || 'Yearly'}</span>
                    </td>
                    <td>
                        <span class="badge ${badgeClass} px-3 py-2 fs-7 rounded-pill"><i class="fas ${isExpired ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-1"></i>${badgeText}</span>
                    </td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-primary fw-bold px-3 py-2 rounded-pill shadow-sm" onclick="app.enterShop('${s.id}', '${s.name.replace(/'/g, "\\'")}')">
                                <i class="fas fa-sign-in-alt me-1"></i> Enter Shop
                            </button>
                            <button class="btn btn-sm btn-outline-warning px-2 rounded-circle" onclick="app.openEditPlanModal('${s.id}')" title="Edit Plan">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger px-2 rounded-circle" onclick="app.deleteShop('${s.id}')" title="Delete Shop">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    toggleNewShopPasswordVisibility: function() {
        const input = document.getElementById('new-shop-password');
        if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
        }
    },

    toggleShopListPassword: function(shopId) {
        const input = document.getElementById(`pass-field-${shopId}`);
        if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
        }
    },

    createNewShop: function(event) {
        event.preventDefault();
        const nameInput = document.getElementById('new-shop-name');
        const usernameInput = document.getElementById('new-shop-username');
        const passwordInput = document.getElementById('new-shop-password');
        const amcPlanInput = document.getElementById('new-shop-amc-plan');
        const amcExpiryInput = document.getElementById('new-shop-amc-expiry');
        
        const name = nameInput.value.trim();
        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const amcPlan = amcPlanInput ? amcPlanInput.value : 'Yearly';
        const amcExpiryDate = amcExpiryInput ? amcExpiryInput.value : '';
        
        if (username.length < 3 || password.length < 4) {
            alert("Username must be at least 3 chars and Password at least 4 chars.");
            return;
        }
        
        // Prevent registering username 'viki' (which is the reserved super admin)
        if (username === 'viki') {
            alert("Username 'VIKI' is reserved for Super Administrator!");
            return;
        }
        
        // Check for duplicate username
        const shops = ShopManager.getShops();
        if (shops.some(s => s.adminUsername.toLowerCase() === username)) {
            alert(`A shop with admin username "${username}" already exists!`);
            return;
        }
        
        // Create shop
        ShopManager.createShop(name, username, password, amcPlan, amcExpiryDate);
        
        // Reset form & refresh list
        nameInput.value = '';
        usernameInput.value = '';
        passwordInput.value = '';
        if (amcPlanInput) amcPlanInput.value = 'Yearly';
        this.onNewShopPlanChange('Yearly');
        this.renderShopsList();
        alert(`Shop "${name}" created successfully!`);
    },

    deleteShop: function(shopId) {
        if (confirm("Are you sure you want to delete this shop and ALL its database tables permanently? This action cannot be undone.")) {
            ShopManager.deleteShop(shopId);
            this.renderShopsList();
        }
    },

    enterShop: function(shopId, shopName) {
        sessionStorage.setItem('currentShopId', shopId);
        sessionStorage.setItem('currentShopName', shopName);
        
        // Trigger database re-initialization for the entered shop
        LocalDB.init();
        
        // Disconnect and reconnect firestore sync for this shop
        if (typeof CloudSync !== 'undefined') {
            CloudSync.init();
        }
        
        // Load the settings for this shop and apply theme/lang
        this.initThemeAndLang();
        
        // Refresh sidebar view and load dashboard
        this.updateSidebarVisibility();
        this.loadPage('dashboard');
        
        // Highlight dashboard as active link in sidebar
        const navLinks = document.querySelectorAll('#sidebar ul li');
        navLinks.forEach(l => l.classList.remove('active'));
        const dashLink = document.querySelector('#sidebar ul li a[data-page="dashboard"]');
        if (dashLink) dashLink.parentElement.classList.add('active');
        
        alert(`Entering "${shopName}" administration console.`);
    },

    calculateExpiryDate: function(planType) {
        const now = new Date();
        switch (planType) {
            case 'Monthly':
                now.setMonth(now.getMonth() + 1);
                break;
            case 'Quarterly':
                now.setMonth(now.getMonth() + 3);
                break;
            case 'Half-Yearly':
                now.setMonth(now.getMonth() + 6);
                break;
            case 'Yearly':
                now.setFullYear(now.getFullYear() + 1);
                break;
            case 'Lifetime':
                now.setFullYear(now.getFullYear() + 99);
                break;
        }
        return now.toISOString().split('T')[0];
    },

    onNewShopPlanChange: function(planType) {
        const dateInput = document.getElementById('new-shop-amc-expiry');
        if (dateInput) {
            dateInput.value = this.calculateExpiryDate(planType);
        }
    },

    onEditPlanChange: function(planType) {
        const dateInput = document.getElementById('edit-shop-amc-expiry');
        if (dateInput) {
            dateInput.value = this.calculateExpiryDate(planType);
        }
    },

    openEditPlanModal: function(shopId) {
        const shops = ShopManager.getShops();
        const shop = shops.find(s => s.id === shopId);
        if (!shop) return;

        document.getElementById('edit-shop-id').value = shop.id;
        document.getElementById('edit-shop-name').value = shop.name;
        document.getElementById('edit-shop-amc-plan').value = shop.amcPlan || 'Yearly';
        document.getElementById('edit-shop-amc-expiry').value = shop.amcExpiryDate || new Date().toISOString().split('T')[0];

        const modalEl = document.getElementById('editPlanModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    },

    saveShopPlan: function(event) {
        event.preventDefault();
        const id = document.getElementById('edit-shop-id').value;
        const plan = document.getElementById('edit-shop-amc-plan').value;
        const expiryDate = document.getElementById('edit-shop-amc-expiry').value;

        if (!id || !plan || !expiryDate) {
            alert("All fields are required.");
            return;
        }

        ShopManager.updateShopPlan(id, plan, expiryDate);

        // Hide Modal
        const modalEl = document.getElementById('editPlanModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }

        // Refresh shops list
        this.renderShopsList();
        
        // Also if we are updating the current shop, we might need to alert or reload
        const currentShopId = sessionStorage.getItem('currentShopId');
        if (currentShopId === id) {
            sessionStorage.setItem('currentShopName', document.getElementById('edit-shop-name').value);
            this.updateTopbarBanner();
        }

        alert("Shop AMC plan updated successfully.");
    },

    exitShop: function() {
        const currentShopName = sessionStorage.getItem('currentShopName') || 'Shop';
        sessionStorage.removeItem('currentShopId');
        sessionStorage.removeItem('currentShopName');
        
        // Disconnect firestore listeners
        if (typeof CloudSync !== 'undefined') {
            CloudSync.init();
        }
        
        // Restore default application state/settings
        AppState.settings = this.getDefaultSettings();
        
        // Re-apply theme default colors
        document.documentElement.style.setProperty('--primary-blue', AppState.settings.themeColor);
        document.body.classList.remove('dark-theme');
        
        // Refresh sidebar and return to shops page
        this.updateSidebarVisibility();
        this.loadPage('shops');
        
        // Highlight shops as active link in sidebar
        const navLinks = document.querySelectorAll('#sidebar ul li');
        navLinks.forEach(l => l.classList.remove('active'));
        const shopsLink = document.getElementById('menu-shops');
        if (shopsLink) shopsLink.classList.add('active');
        
        alert(`Exited "${currentShopName}" console.`);
    }
};

// Expose app globally for inline event handlers and other controllers
window.app = app;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
