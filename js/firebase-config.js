// Firebase Configuration
// Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyBUiIFwRvxrvkYF7rGnXKTIJvoRkQraRkU",
    authDomain: "wholessales-and-pattibill.firebaseapp.com",
    databaseURL: "https://wholessales-and-pattibill-default-rtdb.firebaseio.com",
    projectId: "wholessales-and-pattibill",
    storageBucket: "wholessales-and-pattibill.firebasestorage.app",
    messagingSenderId: "680348672298",
    appId: "1:680348672298:web:e1aa675584540d25857e53"
};

// Initialize Firebase only if config is valid (for demo purposes we will handle offline gracefully)
let firebaseApp, auth, db;
try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // Multi-Shop database collection override
        const originalCollection = db.collection;
        db.collection = function(name) {
            if (name === 'shops') {
                return originalCollection.call(db, 'shops');
            }
            const currentShopId = sessionStorage.getItem('currentShopId');
            if (currentShopId) {
                return originalCollection.call(db, `shop_${currentShopId}_${name}`);
            }
            return originalCollection.call(db, name);
        };

        // Enable offline persistence
        db.enablePersistence()
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
                } else if (err.code == 'unimplemented') {
                    console.warn("The current browser does not support all of the features required to enable persistence");
                }
            });

        console.log("Firebase initialized successfully");
    } else {
        console.log("Firebase config missing. Running in DEMO/OFFLINE mode.");
        window.DEMO_MODE = true;
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
    window.DEMO_MODE = true;
}

// Global state
const AppState = {
    user: null,
    settings: {
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
    }
};
