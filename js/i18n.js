const i18n = {
    language: localStorage.getItem('vmaster_lang') || 'en',
    
    translations: {
        en: {
            "app_title": "V MASTER BILLING",
            "subtitle": "Wholesale Market Management",
            "dashboard": "Dashboard",
            "patti_bill": "Patti Bill (POS)",
            "products_rates": "Products & Rates",
            "special_rates": "Special Rates",
            "categories_units": "Categories & Units",
            "customers_parties": "Customers / Parties",
            "purchase_mgmt": "Purchase Management",
            "expenses_manager": "Expenses Manager",
            "accounts_ledger": "Accounts & Ledger",
            "reports": "Reports",
            "settings": "Settings",
            "today_sales": "Today's Sales",
            "today_expenses": "Today's Expenses",
            "net_profit": "Net Profit",
            "pending_collections": "Pending Collection",
            "recent_bills": "Recent Bills",
            "top_products": "Top Products",
            "bill_no": "Bill No",
            "customer": "Customer",
            "amount": "Amount",
            "status": "Status",
            "action": "Action",
            "sync": "Sync",
            "logout": "Logout",
            "pos_search_placeholder": "Search product or scan barcode (F1)",
            "cust_search_placeholder": "Walk-in Customer (F2 to select)",
            "clear": "Clear",
            "hold": "Hold",
            "pay_print": "Pay & Print",
            "add_product": "Add Product",
            "prod_name": "Product Name",
            "category": "Category",
            "unit": "Unit",
            "stock": "Stock",
            "actions": "Actions",
            "purchase_rate": "Purchase Rate",
            "market_rate": "Market Rate",
            "retail_rate": "Retail Rate",
            "wholesale_rate": "Wholesale Rate",
            "vip_rate": "VIP Rate",
            "dealer_rate": "Dealer Rate",
            "opening_stock": "Opening Stock",
            "mark": "Mark",
            "from_who": "From Who",
            "upi_id": "Merchant UPI ID",
            "time_date": "Date & Time",
            "qty": "Qty",
            "min_rate": "Min. Sale Rate",
            "save_product": "Save Product",
            "add_customer": "Add Customer",
            "cust_name": "Customer Name",
            "phone": "Phone",
            "type": "Type",
            "balance": "Balance",
            "opening_balance": "Opening Balance",
            "save_customer": "Save Customer",
            "ledger_statement": "Party Ledger Statement",
            "running_balance": "Running Balance",
            "whatsapp": "WhatsApp",
            "print_statement": "Print Statement",
            "supplier_name": "Supplier Name",
            "invoice_no": "Invoice / Lot No",
            "purchase_date": "Purchase Date",
            "vehicle_no": "Vehicle No",
            "cost_rate": "Cost Rate",
            "add": "Add",
            "gross_total": "Gross Total",
            "net_amount": "Net Amount",
            "payment_method": "Payment Method",
            "complete_purchase": "Complete Purchase",
            "add_expense": "Add New Expense",
            "expense_cat": "Expense Category",
            "title_desc": "Title / Description",
            "vendor_person": "Vendor / Person",
            "payment_mode": "Payment Mode",
            "record_expense": "Record Expense",
            "daily_closing": "Daily Closing",
            "factory_reset": "Factory Reset",
            "force_sync": "Force Cloud Sync",
            "print_settings": "Printing Settings",
            "printer_size": "Printer Size",
            "shop_name": "Shop Header Name",
            "address": "Address Line",
            "phone_gst": "Phone & GST",
            "daily_sales_trend": "Sales & Expense Trend (Last 7 Days)",
            "payment_modes": "Payment Modes",
            "fast_moving": "Fast Moving Products",
            "low_stock_alerts": "Low Stock Alerts",
            "outstanding": "Outstanding",
            "receivables": "Receivables (Customers)",
            "payables": "Payables (Suppliers)",
            "tamil": "Tamil",
            "english": "English",
            "online_sync": "Online Sync Active",
            "login_title": "Login to Counter",
            "phone_or_email": "Phone or Email",
            "password": "Password",
            "amc_expired_title": "Annual Maintenance Contract (AMC) Expired",
            "amc_expired_desc": "Your shop's subscription plan has expired. Please contact Super Administrator VIKI for plan renewal.",
            "amc_expired_contact": "Contact Admin VIKI",
            "amc_expired_whatsapp": "WhatsApp Admin VIKI",
            "amc_expired_logout": "Back to Login",
            "amc_expired_status": "Plan Status",
            "amc_expired_date": "Expiry Date"
        },
        ta: {
            "app_title": "வி மாஸ்டர் பில்லிங்",
            "subtitle": "மொத்த விற்பனை அங்காடி மேலாண்மை",
            "dashboard": "முகப்பு பலகை",
            "patti_bill": "பட்டி பில் (POS)",
            "products_rates": "பொருட்கள் & விலைகள்",
            "special_rates": "சிறப்பு விலைகள்",
            "categories_units": "பிரிவுகள் & அலகுகள்",
            "customers_parties": "வாடிக்கையாளர்கள்",
            "purchase_mgmt": "கொள்முதல் மேலாண்மை",
            "expenses_manager": "செலவு மேலாண்மை",
            "accounts_ledger": "கணக்கு பதிவேடு",
            "reports": "அறிக்கைகள்",
            "settings": "அமைப்புகள்",
            "today_sales": "இன்றைய விற்பனை",
            "today_expenses": "இன்றைய செலவுகள்",
            "net_profit": "நிகர லாபம்",
            "pending_collections": "நிலுவைத் தொகை",
            "recent_bills": "சமீபத்திய பில்கள்",
            "top_products": "முக்கிய பொருட்கள்",
            "bill_no": "பில் எண்",
            "customer": "வாடிக்கையாளர்",
            "amount": "தொகை",
            "status": "நிலை",
            "action": "நடவடிக்கை",
            "sync": "ஒத்திசை",
            "logout": "வெளியேறு",
            "pos_search_placeholder": "பொருளைத் தேடவும் அல்லது ஸ்கேன் செய்யவும் (F1)",
            "cust_search_placeholder": "சில்லறை வாடிக்கையாளர் (F2)",
            "clear": "அழிக்க",
            "hold": "நிறுத்திவைக்க",
            "pay_print": "பணம் & அச்சிடுக",
            "add_product": "பொருளைச் சேர்க்க",
            "prod_name": "பொருளின் பெயர்",
            "category": "பிரிவு",
            "unit": "அலகு",
            "stock": "இருப்பு",
            "actions": "செயல்கள்",
            "purchase_rate": "கொள்முதல் விலை",
            "market_rate": "சந்தை விலை",
            "retail_rate": "சில்லறை விலை",
            "wholesale_rate": "மொத்த விலை",
            "vip_rate": "வி.ஐ.பி விலை",
            "dealer_rate": "டீலர் விலை",
            "opening_stock": "ஆரம்ப இருப்பு",
            "mark": "மார்க்கு",
            "from_who": "யாரிடமிருந்து",
            "upi_id": "வியாபாரி UPI ஐடி",
            "time_date": "தேதி & நேரம்",
            "qty": "அளவு",
            "min_rate": "குறைந்தபட்ச விலை",
            "save_product": "பொருளைச் சேமி",
            "add_customer": "வாடிக்கையாளர் சேர்க்க",
            "cust_name": "வாடிக்கையாளர் பெயர்",
            "phone": "அலைபேசி",
            "type": "வகை",
            "balance": "நிலுவை",
            "opening_balance": "ஆரம்ப நிலுவை",
            "save_customer": "வாடிக்கையாளர் சேமி",
            "ledger_statement": "வாடிக்கையாளர் கணக்கு அறிக்கை",
            "running_balance": "நடைப்பு நிலுவை",
            "whatsapp": "வாட்ஸ்அப்",
            "print_statement": "அறிக்கை அச்சிடு",
            "supplier_name": "வழங்குநர் பெயர்",
            "invoice_no": "விலைப்பட்டியல் / லாட் எண்",
            "purchase_date": "கொள்முதல் தேதி",
            "vehicle_no": "வண்டி எண்",
            "cost_rate": "அடக்க விலை",
            "add": "சேர்க்க",
            "gross_total": "மொத்தத் தொகை",
            "net_amount": "நிகரத் தொகை",
            "payment_method": "பணப் பரிமாற்ற முறை",
            "complete_purchase": "கொள்முதலை முடி",
            "add_expense": "புதிய செலவு சேர்க்க",
            "expense_cat": "செலவுப் பிரிவு",
            "title_desc": "விவரம் / விளக்கம்",
            "vendor_person": "வழங்கியவர் / நபர்",
            "payment_mode": "பணப் பரிமாற்ற முறை",
            "record_expense": "செலவைச் சேமி",
            "daily_closing": "தினசரி கணக்கு முடிப்பு",
            "factory_reset": "தரவு அழிப்பு",
            "force_sync": "மேகக்கணி ஒத்திசை",
            "print_settings": "அச்சு அமைப்புகள்",
            "printer_size": "அச்சு அளவு",
            "shop_name": "கடை பெயர்",
            "address": "முகவரி",
            "phone_gst": "தொலைபேசி & GST",
            "daily_sales_trend": "விற்பனை மற்றும் செலவு வரைபடம்",
            "payment_modes": "பணப் பரிமாற்ற முறைகள்",
            "fast_moving": "வேகமாக விற்பனையாகும் பொருட்கள்",
            "low_stock_alerts": "குறைந்த இருப்பு எச்சரிக்கைகள்",
            "outstanding": "நிலுவைகள்",
            "receivables": "வரவேண்டியவை (வாடிக்கையாளர்)",
            "payables": "தரவேண்டியவை (வழங்குநர்)",
            "tamil": "தமிழ்",
            "english": "ஆங்கிலம்",
            "online_sync": "நேரடி ஒத்திசைவு செயலில் உள்ளது",
            "login_title": "கவுண்டர் உள்நுழைவு",
            "phone_or_email": "தொலைபேசி அல்லது மின்னஞ்சல்",
            "password": "கடவுச்சொல்",
            "amc_expired_title": "ஆண்டு பராமரிப்பு ஒப்பந்தம் (AMC) முடிவடைந்தது",
            "amc_expired_desc": "உங்கள் கடையின் சந்தா திட்டம் முடிவடைந்தது. திட்டத்தை புதுப்பிக்க சூப்பர் அட்மின் VIKI-ஐ தொடர்பு கொள்ளவும்.",
            "amc_expired_contact": "அட்மின் VIKI-ஐ தொடர்பு கொள்ளவும்",
            "amc_expired_whatsapp": "அட்மின் VIKI-க்கு வாட்ஸ்அப் செய்க",
            "amc_expired_logout": "உள்நுழைவுப் பக்கத்திற்குச் செல்லவும்",
            "amc_expired_status": "திட்ட நிலை",
            "amc_expired_date": "காலாவதி தேதி"
        }
    },
    
    t: function(key) {
        if (this.translations[this.language] && this.translations[this.language][key]) {
            return this.translations[this.language][key];
        }
        return this.translations['en'][key] || key;
    },
    
    setLanguage: function(lang) {
        this.language = lang;
        localStorage.setItem('vmaster_lang', lang);
        if (typeof AppState !== 'undefined') {
            AppState.settings.language = lang;
        }
        this.translateDOM();
        
        // Dispatch event for components to know the language changed
        window.dispatchEvent(new Event('languageChanged'));
    },
    
    translateDOM: function() {
        // Translate all static texts marked with data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder) {
                    el.placeholder = translation;
                } else {
                    el.value = translation;
                }
            } else {
                // Keep inner HTML icons if they exist
                const icon = el.querySelector('i');
                if (icon) {
                    el.innerHTML = '';
                    el.appendChild(icon);
                    el.appendChild(document.createTextNode(' ' + translation));
                } else {
                    el.innerText = translation;
                }
            }
        });
        
        // Translate page title specifically if applicable
        const pageTitle = document.getElementById('page-title');
        if (pageTitle && typeof app !== 'undefined') {
            let activeMenu = document.querySelector('#sidebar ul li.active a');
            if (activeMenu) {
                const pageKey = activeMenu.getAttribute('data-page');
                let key = pageKey;
                if(pageKey === 'pos') key = 'patti_bill';
                if(pageKey === 'products') key = 'products_rates';
                if(pageKey === 'masters') key = 'categories_units';
                if(pageKey === 'customers') key = 'customers_parties';
                if(pageKey === 'purchase') key = 'purchase_mgmt';
                if(pageKey === 'expenses') key = 'expenses_manager';
                if(pageKey === 'accounting') key = 'accounts_ledger';
                if(pageKey === 'rates') key = 'special_rates';
                
                pageTitle.innerText = this.t(key);
            }
        }
    }
};

window.i18n = i18n;
