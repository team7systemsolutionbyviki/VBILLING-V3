/**
 * V Master Billing - Application View Templates
 * Fully bilingual (data-i18n), dark mode compatible, and optimized for high-speed workflows.
 */

window.Views = {
    dashboard: `
        <!-- Today's Operational Brief -->
        <div class="row g-3 mb-4">
            <div class="col-md-3 col-sm-6">
                <div class="card dashboard-card bg-primary text-white h-100 py-2">
                    <div class="card-body d-flex align-items-center">
                        <div class="icon-box bg-white text-primary me-3">
                            <i class="fas fa-rupee-sign"></i>
                        </div>
                        <div>
                            <h6 class="mb-1 text-white-50 small" data-i18n="today_sales">Today's Sales</h6>
                            <h3 class="mb-0 fw-bold" id="dash-total-sales">\u20B90.00</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card dashboard-card bg-success text-white h-100 py-2">
                    <div class="card-body d-flex align-items-center">
                        <div class="icon-box bg-white text-success me-3">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div>
                            <h6 class="mb-1 text-white-50 small" data-i18n="patti_bill">Patti Bills</h6>
                            <h3 class="mb-0 fw-bold" id="dash-bills-count">0</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card dashboard-card bg-danger text-white h-100 py-2">
                    <div class="card-body d-flex align-items-center">
                        <div class="icon-box bg-white text-danger me-3">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div>
                            <h6 class="mb-1 text-white-50 small" data-i18n="today_expenses">Today's Expenses</h6>
                            <h3 class="mb-0 fw-bold" id="dash-expenses">\u20B90.00</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card dashboard-card bg-warning text-dark h-100 py-2">
                    <div class="card-body d-flex align-items-center">
                        <div class="icon-box bg-white text-warning me-3">
                            <i class="fas fa-hand-holding-usd"></i>
                        </div>
                        <div>
                            <h6 class="mb-1 text-dark-50 small" data-i18n="pending_collections">Pending Collection</h6>
                            <h3 class="mb-0 fw-bold" id="dash-pending">\u20B90.00</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <!-- Left Side: Recent Sales Bills -->
            <div class="col-md-8 mb-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 fw-bold text-dark" data-i18n="recent_bills">Recent Bills</h5>
                        <button class="btn btn-sm btn-outline-primary" onclick="app.loadPage('pos')"><i class="fas fa-plus"></i> <span data-i18n="patti_bill">New Patti Bill</span></button>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th data-i18n="bill_no">Bill No</th>
                                        <th data-i18n="customer">Customer</th>
                                        <th data-i18n="amount" class="text-end">Amount</th>
                                        <th data-i18n="payment_mode">Payment Mode</th>
                                        <th data-i18n="action" class="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="recent-bills-table">
                                    <!-- Dynamic rows -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side: Low Stock Warnings -->
            <div class="col-md-4 mb-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-white border-0 py-3">
                        <h5 class="mb-0 fw-bold text-danger" data-i18n="low_stock_alerts"><i class="fas fa-exclamation-triangle"></i> Low Stock Alerts</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th data-i18n="prod_name">Product</th>
                                        <th data-i18n="stock" class="text-center">Stock</th>
                                        <th data-i18n="status" class="text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody id="dash-low-stock">
                                    <!-- Dynamic alerts -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    pos: `
        <div class="pos-layout">
            <!-- Left Side: Invoice Cart & Totals -->
            <div class="pos-cart">
                <div class="p-3 border-bottom bg-light">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0 fw-bold"><i class="fas fa-receipt me-1"></i> <span data-i18n="bill_no">Bill No</span>: <span id="pos-bill-no" class="text-primary fw-extrabold">1001</span></h5>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-xs btn-outline-warning text-dark fw-bold" onclick="POS.showHeldBills()">
                                <i class="fas fa-hand-paper"></i> <span data-i18n="hold">Held</span> (<span id="held-count">0</span>)
                            </button>
                            <span class="badge bg-success" id="pos-date"></span>
                        </div>
                    </div>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="fas fa-user text-muted"></i></span>
                        <input type="text" class="form-control border-start-0 ps-0" id="pos-customer-search" list="customer-datalist" placeholder="Walk-in Customer (F2 to select)" data-i18n="cust_search_placeholder">
                        <button class="btn btn-outline-primary" type="button" data-bs-toggle="modal" data-bs-target="#customerModal"><i class="fas fa-plus"></i></button>
                    </div>
                    <datalist id="customer-datalist"></datalist>
                    <input type="hidden" id="pos-customer-id" value="c1">
                </div>

                <!-- Scrollable POS Cart Items -->
                <div class="cart-table-wrapper">
                    <table class="table table-hover mb-0 cart-table">
                        <thead>
                            <tr>
                                <th data-i18n="prod_name">Item</th>
                                <th width="15%" class="text-center" data-i18n="mark">Mark</th>
                                <th width="18%" class="text-center" data-i18n="qty">Qty</th>
                                <th width="18%" class="text-end" data-i18n="rate">Rate</th>
                                <th width="18%" class="text-end" data-i18n="amount">Total</th>
                                <th width="8%"></th>
                            </tr>
                        </thead>
                        <tbody id="pos-cart-items">
                            <!-- Items go here -->
                        </tbody>
                    </table>
                </div>

                <!-- Aggregated Cart Totals -->
                <div class="cart-totals bg-dark-blue p-3">
                    <div class="d-flex justify-content-between mb-1 small text-white-50">
                        <span data-i18n="today_sales">Subtotal:</span>
                        <span id="pos-subtotal">\u20B90.00</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2 align-items-center small text-white-50">
                        <span data-i18n="expense_cat">Coolie / Charges (+):</span>
                        <input type="number" id="pos-charges" class="form-control form-control-sm w-25 bg-dark text-white border-secondary text-end" value="0" oninput="POS.calculateTotals()">
                    </div>
                    <div class="d-flex justify-content-between mb-2 align-items-center small text-white-50">
                        <span data-i18n="clear">Discount (-):</span>
                        <input type="number" id="pos-discount" class="form-control form-control-sm w-25 bg-dark text-white border-secondary text-end" value="0" oninput="POS.calculateTotals()">
                    </div>
                    <hr class="border-secondary my-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <h4 class="mb-0 fw-bold" data-i18n="gross_total">Total:</h4>
                        <h3 class="mb-0 fw-extrabold text-warning" id="pos-total">\u20B90.00</h3>
                    </div>
                </div>

                <!-- Dynamic Cart Action Buttons -->
                <div class="p-2 bg-light d-flex gap-2">
                    <button class="btn btn-danger flex-fill pos-action-btn" onclick="POS.clearCart()">
                        <i class="fas fa-trash mb-1 d-block"></i> <span data-i18n="clear">Clear</span>
                    </button>
                    <button class="btn btn-warning flex-fill pos-action-btn text-dark" onclick="POS.holdBill()">
                        <i class="fas fa-pause mb-1 d-block"></i> <span data-i18n="hold">Hold</span>
                    </button>
                    <button class="btn btn-success flex-fill pos-action-btn" onclick="POS.payAndPrint()" id="btn-pay-print">
                        <i class="fas fa-print mb-1 d-block"></i> <span data-i18n="pay_print">Pay & Print</span>
                    </button>
                </div>
            </div>

            <!-- Right Side: Live Products / Search Matrix -->
            <div class="pos-products">
                <div class="row g-2 mb-3">
                    <div class="col-md-8">
                        <div class="input-group">
                            <span class="input-group-text bg-white"><i class="fas fa-search"></i></span>
                            <input type="text" id="pos-product-search" class="form-control form-control-lg border-end-0" placeholder="Search product or scan barcode (F1)" data-i18n="pos_search_placeholder">
                            <button class="btn btn-outline-primary border-start-0" type="button" id="btn-camera-scan" onclick="POS.toggleCameraScanner()"><i class="fas fa-camera"></i></button>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select form-select-lg" id="pos-category-filter" onchange="POS.filterProducts()">
                            <option value="all">All Categories</option>
                        </select>
                    </div>
                </div>

                <!-- Camera Barcode Stream Overlay -->
                <div id="camera-scan-container" class="d-none mb-3 p-3 bg-dark border rounded text-center text-white position-relative">
                    <div id="camera-preview-box" class="mx-auto rounded border border-warning" style="width: 100%; max-width: 320px; height: 180px; background: #000; position: relative;">
                        <!-- We show a moving laser animation to simulate scanning -->
                        <div class="laser-scanner" style="position: absolute; top:0; left:0; width:100%; height:2px; background: red; box-shadow: 0 0 8px red; animation: scanLine 2s infinite linear;"></div>
                        <i class="fas fa-qrcode fa-3x text-muted" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></i>
                    </div>
                    <div class="mt-2 text-warning small fw-bold"><i class="fas fa-info-circle"></i> Camera stream simulated - Barcodes scan in real time.</div>
                    <div class="input-group input-group-sm mt-2 mx-auto" style="max-width: 280px;">
                        <input type="text" class="form-control form-control-sm text-center" id="camera-mock-code" placeholder="Enter Mock Barcode...">
                        <button class="btn btn-warning btn-sm" onclick="POS.simulateScan()">Trigger Scan</button>
                    </div>
                    <button class="btn btn-close btn-close-white position-absolute top-0 end-0 m-2" onclick="POS.toggleCameraScanner()"></button>
                </div>

                <!-- Scrolling grid for rapid product selection -->
                <div class="row g-2" id="pos-product-grid" style="overflow-y: auto;">
                    <!-- Filled by JavaScript -->
                </div>
            </div>
        </div>

        <!-- Add Customer Modal -->
        <div class="modal fade" id="customerModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content shadow border-0">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold" data-i18n="add_customer">Select / Add Customer</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-0">
                        <ul class="nav nav-tabs nav-fill border-0 bg-light" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active fw-bold py-3" data-bs-toggle="tab" href="#cust-existing"><i class="fas fa-search"></i> Search</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link fw-bold py-3" data-bs-toggle="tab" href="#cust-new"><i class="fas fa-plus"></i> Quick Add</a>
                            </li>
                        </ul>
                        <div class="tab-content p-3">
                            <div class="tab-pane fade show active" id="cust-existing">
                                <input type="text" class="form-control mb-3" placeholder="Search customer..." oninput="POS.filterCustomerList(this.value)">
                                <div class="list-group overflow-auto" id="customer-list" style="max-height: 280px;">
                                    <!-- Populated by JS -->
                                </div>
                            </div>
                            <div class="tab-pane fade" id="cust-new">
                                <form onsubmit="event.preventDefault(); POS.quickAddCustomer();">
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold" data-i18n="cust_name">Customer Name *</label>
                                        <input type="text" class="form-control" id="quick-cust-name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold" data-i18n="phone">Mobile Number *</label>
                                        <input type="tel" class="form-control" id="quick-cust-mobile" pattern="[0-9]{10}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold" data-i18n="type">Type</label>
                                        <select class="form-select" id="quick-cust-type">
                                            <option value="Retail">Retail Customer</option>
                                            <option value="Credit">Credit Party</option>
                                            <option value="Wholesale">Wholesale Merchant</option>
                                        </select>
                                    </div>
                                    <button type="submit" class="btn btn-primary w-100 fw-bold py-2" data-i18n="save_customer">Save & Select</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Payment Settlement Modal -->
        <div class="modal fade" id="paymentModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content shadow border-0">
                    <div class="modal-header bg-success text-white border-0">
                        <h5 class="modal-title fw-bold" data-i18n="payment_method"><i class="fas fa-cash-register me-2"></i> Payment Settlement</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4 text-center">
                        <h6 class="text-muted text-uppercase mb-1" data-i18n="gross_total">TOTAL AMOUNT DUE</h6>
                        <h1 class="fw-extrabold text-success mb-4" id="payment-amount-display">\u20B90.00</h1>
                        
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 py-3 active d-flex flex-column align-items-center gap-1" id="btn-pay-cash" onclick="POS.setPaymentMethod('cash')">
                                    <i class="fas fa-money-bill-wave fa-lg"></i> <span class="fw-bold">CASH</span>
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 py-3 d-flex flex-column align-items-center gap-1" id="btn-pay-upi" onclick="POS.setPaymentMethod('upi')">
                                    <i class="fas fa-qrcode fa-lg"></i> <span class="fw-bold">UPI / QR</span>
                                </button>
                            </div>
                        </div>
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 py-3 d-flex flex-column align-items-center gap-1" id="btn-pay-split" onclick="POS.setPaymentMethod('split')">
                                    <i class="fas fa-balance-scale fa-lg"></i> <span class="fw-bold">SPLIT</span>
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-outline-warning w-100 py-3 text-dark d-flex flex-column align-items-center gap-1" id="btn-pay-credit" onclick="POS.setPaymentMethod('credit')">
                                    <i class="fas fa-user-tag fa-lg"></i> <span class="fw-bold">CREDIT</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Split Payment Details -->
                        <div class="card border border-warning bg-light d-none p-3 mb-3" id="split-payment-inputs">
                            <h6 class="fw-bold mb-2 text-dark text-start" data-i18n="payment_modes">Split Details</h6>
                            <div class="row g-2">
                                <div class="col-6 text-start">
                                    <label class="small text-muted mb-1">Cash Paid (\u20B9)</label>
                                    <input type="number" class="form-control form-control-lg text-center font-monospace fw-bold" id="split-cash" oninput="POS.calcSplit('cash')">
                                </div>
                                <div class="col-6 text-start">
                                    <label class="small text-muted mb-1">UPI Paid (\u20B9)</label>
                                    <input type="number" class="form-control form-control-lg text-center font-monospace fw-bold" id="split-upi" oninput="POS.calcSplit('upi')">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0">
                        <button type="button" class="btn btn-secondary px-3" data-bs-dismiss="modal" data-i18n="clear">Cancel</button>
                        <button type="button" class="btn btn-success px-4 fw-bold" onclick="POS.finalizePrint()" data-i18n="pay_print"><i class="fas fa-check-double"></i> Confirm & Print</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Held Bills Modal -->
        <div class="modal fade" id="heldBillsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content shadow border-0">
                    <div class="modal-header bg-warning border-0">
                        <h5 class="modal-title fw-bold text-dark"><i class="fas fa-pause me-2"></i> Held Bills (Hold List)</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-0">
                        <ul class="list-group list-group-flush" id="held-bills-list">
                            <!-- Populated by JS -->
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `,

    products: `
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold text-dark" data-i18n="products_rates">Products & Rates</h5>
                <button class="btn btn-primary" onclick="app.openProductModal()"><i class="fas fa-plus"></i> <span data-i18n="add_product">Add Product</span></button>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th data-i18n="prod_name">Name</th>
                                <th data-i18n="category">Category</th>
                                <th class="text-center" data-i18n="mark">Mark</th>
                                <th class="text-center" data-i18n="from_who">From Who</th>
                                <th data-i18n="retail_rate" class="text-end">Retail Rate</th>
                                <th data-i18n="wholesale_rate" class="text-end">Wholesale Rate</th>
                                <th data-i18n="unit" class="text-center">Unit</th>
                                <th data-i18n="stock" class="text-center">Stock</th>
                                <th class="text-center" data-i18n="time_date">Date & Time</th>
                                <th data-i18n="actions" class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="products-table">
                            <!-- Filled dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Product Details Form Modal -->
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content shadow border-0">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold" data-i18n="add_product">Add / Edit Product</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="product-form" onsubmit="event.preventDefault(); app.saveProduct();">
                            <input type="hidden" id="prod-id">
                            
                            <div class="row g-2 mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold" data-i18n="prod_name">Product Name (English)</label>
                                    <input type="text" class="form-control" id="prod-name" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Tamil Name (தமிழ்)</label>
                                    <input type="text" class="form-control" id="prod-name-ta" placeholder="எ.கா. தக்காளி (உள்ளூர்)">
                                </div>
                            </div>
                            
                            <div class="row g-2 mb-3">
                                <div class="col-md-4">
                                    <label class="form-label fw-bold" data-i18n="category">Category</label>
                                    <select class="form-select" id="prod-category" required></select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold" data-i18n="unit">Unit</label>
                                    <select class="form-select" id="prod-unit" required></select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Barcode / PLU</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="prod-barcode" placeholder="Scan/Type Code">
                                        <button class="btn btn-outline-secondary" type="button" onclick="app.generateBarcodeField()"><i class="fas fa-barcode"></i></button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row g-2 mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold" data-i18n="mark">Mark</label>
                                    <input type="text" class="form-control" id="prod-mark" placeholder="e.g. AM, KVR">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold" data-i18n="from_who">From Who (Farmer/Supplier)</label>
                                    <input type="text" class="form-control" id="prod-from-who" placeholder="e.g. Ramesh, Murugan">
                                </div>
                            </div>
                            
                            <div class="row g-2 mb-3">
                                <div class="col-md-4">
                                    <label class="form-label small text-muted mb-1" data-i18n="purchase_rate">Purchase Cost (\u20B9)</label>
                                    <input type="number" class="form-control" id="prod-purchase-rate" value="0" step="0.01">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small text-muted mb-1" data-i18n="market_rate">Market Rate (\u20B9)</label>
                                    <input type="number" class="form-control" id="prod-market-rate" value="0" step="0.01">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small text-muted mb-1" data-i18n="retail_rate">Retail price (Walk-in)</label>
                                    <input type="number" class="form-control fw-bold text-primary" id="prod-price" required step="0.01">
                                </div>
                            </div>
                            
                            <div class="row g-2 mb-3">
                                <div class="col-md-4">
                                    <label class="form-label small text-muted mb-1" data-i18n="wholesale_rate">Wholesale Rate (\u20B9)</label>
                                    <input type="number" class="form-control" id="prod-wholesale-rate" value="0" step="0.01">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small text-muted mb-1" data-i18n="vip_rate">VIP Rate (\u20B9)</label>
                                    <input type="number" class="form-control" id="prod-vip-rate" value="0" step="0.01">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small text-muted mb-1" data-i18n="dealer_rate">Dealer Rate (\u20B9)</label>
                                    <input type="number" class="form-control" id="prod-dealer-rate" value="0" step="0.01">
                                </div>
                            </div>
                            
                            <div class="row g-2 mb-4">
                                <div class="col-md-6">
                                    <label class="form-label small text-muted mb-1" data-i18n="opening_stock">Initial Stock</label>
                                    <input type="number" class="form-control" id="prod-stock" value="0">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small text-danger fw-bold mb-1" data-i18n="min_rate">Min. Allowed Price (\u20B9)</label>
                                    <input type="number" class="form-control border-danger" id="prod-min-rate" value="0" step="0.01">
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100 fw-bold py-2" data-i18n="save_product">Save Product</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,

    customers: `
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold text-dark" data-i18n="customers_parties">Customers / Parties</h5>
                <button class="btn btn-primary" onclick="app.openCustomerModal()"><i class="fas fa-plus"></i> <span data-i18n="add_customer">Add Customer</span></button>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th data-i18n="cust_name">Name</th>
                                <th data-i18n="phone">Phone</th>
                                <th data-i18n="type">Type</th>
                                <th data-i18n="balance" class="text-end">Balance</th>
                                <th data-i18n="actions" class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="customers-table">
                            <!-- Filled dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Customer CRUD Modal -->
        <div class="modal fade" id="customerMgmtModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content shadow border-0">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold" data-i18n="add_customer">Add / Edit Customer</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="customer-form" onsubmit="event.preventDefault(); app.saveCustomer();">
                            <input type="hidden" id="cust-id">
                            <div class="mb-3">
                                <label class="form-label fw-bold" data-i18n="cust_name">Customer Name</label>
                                <input type="text" class="form-control" id="cust-name" required>
                            </div>
                            <div class="row g-2 mb-3">
                                <div class="col-6">
                                    <label class="form-label fw-bold" data-i18n="phone">Phone</label>
                                    <input type="text" class="form-control" id="cust-phone">
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold" data-i18n="type">Type</label>
                                    <select class="form-select" id="cust-type">
                                        <option value="Retail">Retail</option>
                                        <option value="Wholesale">Wholesale</option>
                                        <option value="VIP">VIP</option>
                                        <option value="Dealer">Dealer</option>
                                        <option value="Hotel">Hotel</option>
                                        <option value="Credit">Credit Party</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-bold" data-i18n="opening_balance">Opening Balance (\u20B9)</label>
                                <input type="number" class="form-control" id="cust-balance" value="0">
                                <small class="text-muted">Positive = Owed to you. Negative = Advance payment.</small>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 fw-bold py-2" data-i18n="save_customer">Save Customer</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Statement Ledger Modal -->
        <div class="modal fade" id="ledgerViewModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content shadow border-0">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold" data-i18n="ledger_statement"><i class="fas fa-file-invoice-dollar me-2"></i> Party Ledger Statement</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-0">
                        <div class="p-4 bg-light d-flex justify-content-between align-items-center border-bottom">
                            <div>
                                <h4 class="mb-1 fw-extrabold text-dark" id="ledg-name">Name</h4>
                                <span class="badge bg-secondary font-monospace" id="ledg-phone">Phone</span>
                            </div>
                            <div class="text-end">
                                <h6 class="text-muted small mb-1" data-i18n="running_balance">Running Balance</h6>
                                <h3 class="mb-0 fw-extrabold text-primary" id="ledg-bal">\u20B90.00</h3>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-striped table-hover mb-0">
                                <thead class="table-dark">
                                    <tr>
                                        <th data-i18n="purchase_date">Date</th>
                                        <th data-i18n="bill_no">Voucher/Bill</th>
                                        <th data-i18n="title_desc">Description</th>
                                        <th class="text-end">Debit (-)</th>
                                        <th class="text-end">Credit (+)</th>
                                        <th class="text-end" data-i18n="balance">Balance</th>
                                    </tr>
                                </thead>
                                <tbody id="party-ledger-tbody">
                                    <!-- Dynamic statement rows -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0">
                        <button type="button" class="btn btn-success fw-bold px-3" onclick="app.shareLedgerWA()"><i class="fab fa-whatsapp"></i> <span data-i18n="whatsapp">WhatsApp</span></button>
                        <button type="button" class="btn btn-primary fw-bold px-3" onclick="app.printLedger()"><i class="fas fa-print"></i> <span data-i18n="print_statement">Print Statement</span></button>
                    </div>
                </div>
            </div>
        </div>
    `,

    purchase: `
        <div class="row g-3">
            <!-- Purchase Form Terminal (8 Columns) -->
            <div class="col-lg-8 d-flex flex-column">
                <div class="card border-0 shadow-sm mb-3">
                    <div class="card-body bg-light p-3">
                        <div class="row g-2">
                            <div class="col-md-4">
                                <label class="form-label small fw-bold" data-i18n="supplier_name">Supplier Name</label>
                                <input type="text" class="form-control" id="pur-supplier-search" placeholder="Select/Type Supplier..." list="supplier-datalist">
                                <datalist id="supplier-datalist"></datalist>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold" data-i18n="invoice_no">Lot / Invoice No</label>
                                <input type="text" class="form-control" id="pur-invoice-no" placeholder="e.g. LOT-425">
                            </div>
                            <div class="col-md-2">
                                <label class="form-label small fw-bold" data-i18n="purchase_date">Purchase Date</label>
                                <input type="date" class="form-control" id="pur-date">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold" data-i18n="vehicle_no">Vehicle Number</label>
                                <input type="text" class="form-control" id="pur-vehicle" placeholder="TN-00-XX-0000">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mb-3">
                    <div class="card-body p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3">
                        <form onsubmit="event.preventDefault(); PurchaseLogic.addItem();" id="pur-add-item-form">
                            <div class="row g-2 align-items-end">
                                <div class="col-md-3 text-start">
                                    <label class="form-label small fw-bold" data-i18n="prod_name">Product Name</label>
                                    <input type="text" class="form-control border-primary" id="pur-item-search" placeholder="Search Product..." list="pur-product-datalist" required>
                                    <datalist id="pur-product-datalist"></datalist>
                                </div>
                                <div class="col-md-2 text-start">
                                    <label class="form-label small fw-bold" data-i18n="mark">Mark</label>
                                    <input type="text" class="form-control border-primary" id="pur-item-mark" placeholder="e.g. AM, KVR" list="pur-mark-datalist">
                                    <datalist id="pur-mark-datalist"></datalist>
                                </div>
                                <div class="col-md-2 text-start">
                                    <label class="form-label small fw-bold" data-i18n="qty">Qty</label>
                                    <div class="input-group input-group-sm">
                                        <input type="number" class="form-control" id="pur-item-qty" min="0.01" step="0.01" required>
                                        <span class="input-group-text" id="pur-item-unit">KG</span>
                                    </div>
                                </div>
                                <div class="col-md-2 text-start">
                                    <label class="form-label small fw-bold" data-i18n="cost_rate">Cost Rate (\u20B9)</label>
                                    <input type="number" class="form-control form-control-sm" id="pur-item-rate" min="0" step="0.01" required>
                                </div>
                                <div class="col-md-2 text-start">
                                    <label class="form-label small fw-bold" data-i18n="retail_rate">Sale price (MRP)</label>
                                    <input type="number" class="form-control form-control-sm" id="pur-item-mrp" min="0" step="0.01">
                                </div>
                                <div class="col-md-1">
                                    <button type="submit" class="btn btn-primary btn-sm w-100 py-2"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="card border-0 shadow-sm flex-grow-1 overflow-hidden" style="min-height: 250px;">
                    <div class="card-body p-0">
                        <div class="table-responsive" style="max-height: 320px; overflow-y: auto;">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-dark">
                                    <tr>
                                        <th width="8%">#</th>
                                        <th data-i18n="prod_name">Product</th>
                                        <th width="15%" class="text-center" data-i18n="mark">Mark</th>
                                        <th width="15%" class="text-center" data-i18n="qty">Qty</th>
                                        <th width="18%" class="text-end" data-i18n="cost_rate">Cost</th>
                                        <th width="20%" class="text-end" data-i18n="amount">Total</th>
                                        <th width="9%"></th>
                                    </tr>
                                </thead>
                                <tbody id="pur-cart-table">
                                    <tr><td colspan="7" class="text-center text-muted py-4">No items added to purchase yet.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Financial Summary Panel (4 Columns) -->
            <div class="col-lg-4 d-flex flex-column">
                <div class="card border-0 shadow-sm bg-dark text-white mb-3">
                    <div class="card-body text-center py-4">
                        <h6 class="text-white-50 small mb-1" data-i18n="purchase_mgmt">PURCHASE ID</h6>
                        <h4 class="fw-bold mb-3 text-warning font-monospace" id="pur-bill-no">PUR-1001</h4>
                        <h6 class="text-white-50 small mb-1" data-i18n="gross_total">GROSS TOTAL</h6>
                        <h1 class="display-6 fw-extrabold mb-0 text-success" id="pur-total-display">\u20B90.00</h1>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mb-3">
                    <div class="card-body bg-light">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted" data-i18n="today_sales">Subtotal:</span>
                            <span class="fw-bold text-dark" id="pur-subtotal">\u20B90.00</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2 align-items-center">
                            <span class="text-muted">Transport/Loading (+):</span>
                            <input type="number" class="form-control form-control-sm w-50 text-end" id="pur-charges" value="0" oninput="PurchaseLogic.calcTotals()">
                        </div>
                        <div class="d-flex justify-content-between mb-2 align-items-center">
                            <span class="text-muted">Discount (-):</span>
                            <input type="number" class="form-control form-control-sm w-50 text-end text-danger" id="pur-discount" value="0" oninput="PurchaseLogic.calcTotals()">
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between">
                            <h5 class="mb-0 fw-bold" data-i18n="net_amount">Net Amount:</h5>
                            <h5 class="mb-0 fw-extrabold text-success" id="pur-net-total">\u20B90.00</h5>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm flex-grow-1">
                    <div class="card-body d-flex flex-column">
                        <h6 class="fw-bold mb-3 text-muted" data-i18n="payment_method">PAYMENT METHOD</h6>
                        <div class="row g-2 mb-3">
                            <div class="col-6"><button class="btn btn-outline-success w-100 active fw-bold" id="btn-pur-pay-cash" onclick="PurchaseLogic.setPayment('CASH')">CASH</button></div>
                            <div class="col-6"><button class="btn btn-outline-success w-100 fw-bold" id="btn-pur-pay-upi" onclick="PurchaseLogic.setPayment('UPI')">UPI / BANK</button></div>
                        </div>
                        <div class="mb-3">
                            <button class="btn btn-outline-danger w-100 fw-bold" id="btn-pur-pay-credit" onclick="PurchaseLogic.setPayment('CREDIT')"><i class="fas fa-book"></i> CREDIT (DUE)</button>
                        </div>
                        
                        <div class="row g-2 mb-3 d-none" id="pur-split-box">
                            <div class="col-6">
                                <label class="small text-muted">Paid (\u20B9)</label>
                                <input type="number" class="form-control" id="pur-paid-amount" oninput="PurchaseLogic.calcDue()">
                            </div>
                            <div class="col-6">
                                <label class="small text-muted">Due (\u20B9)</label>
                                <input type="number" class="form-control text-danger fw-bold" id="pur-due-amount" readonly>
                            </div>
                        </div>
                        
                        <div class="mt-auto pt-3">
                            <button class="btn btn-primary btn-lg w-100 fw-bold py-3" onclick="PurchaseLogic.savePurchase()"><i class="fas fa-check-circle"></i> <span data-i18n="complete_purchase">Complete Purchase</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    expenses: `
        <div class="row g-3">
            <!-- Expense Form Input -->
            <div class="col-md-5 d-flex flex-column">
                <div class="card border-0 shadow-sm flex-grow-1">
                    <div class="card-header bg-white border-0 py-3">
                        <h5 class="mb-0 fw-bold text-dark" data-i18n="add_expense">Add New Expense</h5>
                    </div>
                    <div class="card-body bg-light">
                        <form onsubmit="event.preventDefault(); ExpenseLogic.saveExpense();" id="expense-form">
                            <div class="row g-2 mb-3">
                                <div class="col-6">
                                    <label class="form-label small text-muted mb-1" data-i18n="purchase_date">Date</label>
                                    <input type="date" class="form-control" id="exp-date" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label small text-muted mb-1">Voucher No</label>
                                    <input type="text" class="form-control bg-white font-monospace fw-bold" id="exp-voucher" readonly>
                                </div>
                            </div>
                            
                            <div class="mb-3 text-start">
                                <label class="form-label small text-muted mb-1" data-i18n="expense_cat">Category</label>
                                <select class="form-select" id="exp-category" required>
                                    <option value="" disabled selected>Select Category</option>
                                    <option value="Transport expense">Transport expense</option>
                                    <option value="EB current bill">EB current bill</option>
                                    <option value="Worker salary">Worker salary</option>
                                    <option value="Daily coolie charges">Daily coolie charges</option>
                                    <option value="Food expense">Food / Tea expense</option>
                                    <option value="Commission expense">Commission expense</option>
                                    <option value="Shop rent">Shop rent</option>
                                    <option value="Miscellaneous expense">Miscellaneous expense</option>
                                </select>
                            </div>
                            
                            <div class="mb-3 text-start">
                                <label class="form-label small text-muted mb-1" data-i18n="title_desc">Description</label>
                                <input type="text" class="form-control" id="exp-title" placeholder="Details (e.g. Loading charge Tomato)" required>
                            </div>
                            
                            <div class="mb-3 text-start">
                                <label class="form-label small text-muted mb-1" data-i18n="vendor_person">Vendor / Person</label>
                                <input type="text" class="form-control" id="exp-vendor" placeholder="Supplier / Handover name">
                            </div>
                            
                            <div class="row g-2 mb-4">
                                <div class="col-6 text-start">
                                    <label class="form-label small text-muted mb-1" data-i18n="amount">Amount (\u20B9)</label>
                                    <input type="number" class="form-control fw-bold text-danger font-monospace" id="exp-amount" step="0.01" required>
                                </div>
                                <div class="col-6 text-start">
                                    <label class="form-label small text-muted mb-1" data-i18n="payment_mode">Payment Mode</label>
                                    <select class="form-select" id="exp-method">
                                        <option value="CASH">Cash</option>
                                        <option value="UPI">UPI / Bank</option>
                                        <option value="CREDIT">Credit (Due)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-danger w-100 fw-bold py-2" data-i18n="record_expense">Record Expense</button>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Expense Voucher History -->
            <div class="col-md-7 d-flex flex-column">
                <div class="card border-0 shadow-sm mb-3">
                    <div class="card-body p-3 bg-light d-flex justify-content-between align-items-center">
                        <div>
                            <span class="small text-muted" data-i18n="today_expenses">Today's Total</span>
                            <h4 class="mb-0 fw-extrabold text-danger" id="exp-summary-today">\u20B90.00</h4>
                        </div>
                        <div class="text-end">
                            <span class="small text-muted">This Month Total</span>
                            <h4 class="mb-0 fw-extrabold text-danger" id="exp-summary-month">\u20B90.00</h4>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm flex-grow-1">
                    <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 fw-bold text-dark">Recent Expense Book</h5>
                        <input type="date" class="form-control form-control-sm w-auto" id="exp-filter-date" onchange="ExpenseLogic.updateUI()">
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th data-i18n="purchase_date">Date</th>
                                        <th data-i18n="category">Category</th>
                                        <th data-i18n="title_desc">Description</th>
                                        <th data-i18n="payment_mode">Mode</th>
                                        <th data-i18n="amount" class="text-end">Amount</th>
                                        <th data-i18n="actions" class="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="exp-history-table">
                                    <!-- Populated by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    accounting: `
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div class="card bg-success text-white py-3 border-0">
                    <div class="card-body text-center p-2">
                        <h6 class="text-white-50 small mb-1">CASH INFLOW</h6>
                        <h3 class="fw-bold mb-0" id="acc-income">\u20B90.00</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-danger text-white py-3 border-0">
                    <div class="card-body text-center p-2">
                        <h6 class="text-white-50 small mb-1">CASH OUTFLOW</h6>
                        <h3 class="fw-bold mb-0" id="acc-expense">\u20B90.00</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white py-3 border-0">
                    <div class="card-body text-center p-2">
                        <h6 class="text-white-50 small mb-1">UPI & BANK</h6>
                        <h3 class="fw-bold mb-0" id="acc-bank">\u20B90.00</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-primary text-white py-3 border-0">
                    <div class="card-body text-center p-2">
                        <h6 class="text-white-50 small mb-1">NET LIQUID CASH</h6>
                        <h3 class="fw-bold mb-0" id="acc-balance">\u20B90.00</h3>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0 py-3">
                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-keyboard"></i> Quick Ledger Adjustment</h5>
            </div>
            <div class="card-body bg-light">
                <form id="ledger-form" onsubmit="event.preventDefault(); app.saveLedgerEntry();">
                    <div class="row g-2 align-items-end">
                        <div class="col-md-2 text-start">
                            <label class="form-label small fw-bold" data-i18n="purchase_date">Date</label>
                            <input type="date" class="form-control form-control-sm" id="led-date" required>
                        </div>
                        <div class="col-md-2 text-start">
                            <label class="form-label small fw-bold" data-i18n="type">Type</label>
                            <select class="form-select form-select-sm" id="led-type">
                                <option value="IN">Cash IN (Collection)</option>
                                <option value="OUT">Cash OUT (Payment)</option>
                            </select>
                        </div>
                        <div class="col-md-2 text-start">
                            <label class="form-label small fw-bold" data-i18n="payment_mode">Mode</label>
                            <select class="form-select form-select-sm" id="led-method">
                                <option value="CASH">Cash</option>
                                <option value="UPI">UPI Transfer</option>
                                <option value="BANK">Bank Deposit</option>
                                <option value="ADJUSTMENT">Discount Adjust</option>
                            </select>
                        </div>
                        <div class="col-md-2 text-start">
                            <label class="form-label small fw-bold" data-i18n="customer">Party / Name</label>
                            <input type="text" class="form-control form-control-sm" id="led-party" placeholder="Name..." list="party-datalist" required>
                            <datalist id="party-datalist"></datalist>
                        </div>
                        <div class="col-md-2 text-start">
                            <label class="form-label small fw-bold" data-i18n="amount">Amount (\u20B9)</label>
                            <input type="number" class="form-control form-control-sm" id="led-amount" required step="0.01">
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-primary btn-sm w-100 py-2"><i class="fas fa-plus"></i> <span data-i18n="add">Save Entry</span></button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold text-dark" data-i18n="accounts_ledger">Comprehensive Cash Book</h5>
                <div>
                    <button class="btn btn-outline-success btn-sm me-2" onclick="app.printCashBook()"><i class="fas fa-print"></i> <span data-i18n="print_statement">Print</span></button>
                    <button class="btn btn-outline-primary btn-sm" onclick="app.renderAccounting()"><i class="fas fa-sync"></i> <span data-i18n="sync">Refresh</span></button>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th data-i18n="purchase_date">Date</th>
                                <th data-i18n="customer">Party Name</th>
                                <th data-i18n="title_desc">Description</th>
                                <th data-i18n="payment_mode">Mode</th>
                                <th class="text-success text-end">Credit (In)</th>
                                <th class="text-danger text-end">Debit (Out)</th>
                                <th class="text-primary text-end" data-i18n="balance">Balance</th>
                            </tr>
                        </thead>
                        <tbody id="ledger-table">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,

    reports: `
        <ul class="nav nav-tabs border-0 mb-4 bg-light p-2 rounded-3" id="reportTabs" role="tablist">
            <li class="nav-item">
                <a class="nav-link active fw-bold border-0" data-bs-toggle="tab" href="#rep-dashboard"><i class="fas fa-chart-pie me-1"></i> Dashboard Stats</a>
            </li>
            <li class="nav-item">
                <a class="nav-link fw-bold border-0" data-bs-toggle="tab" href="#rep-sales-detail"><i class="fas fa-file-invoice me-1"></i> Sales Report</a>
            </li>
            <li class="nav-item">
                <a class="nav-link fw-bold border-0" data-bs-toggle="tab" href="#rep-inventory"><i class="fas fa-boxes me-1"></i> Stock Valuation</a>
            </li>
            <li class="nav-item">
                <a class="nav-link fw-bold border-0" data-bs-toggle="tab" href="#rep-ledger-summary"><i class="fas fa-address-book me-1"></i> Ledger Outstanding</a>
            </li>
        </ul>

        <div class="tab-content">
            <!-- Dashboard Charts Tab -->
            <div class="tab-pane fade show active" id="rep-dashboard">
                <!-- Today's Operational Stats -->
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5 g-3 mb-4">
                    <div class="col">
                        <div class="card dashboard-card bg-primary text-white h-100 py-2 border-0 shadow-sm">
                            <div class="card-body d-flex align-items-center p-3">
                                <div class="icon-box bg-white text-primary me-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; flex-shrink: 0;">
                                    <i class="fas fa-rupee-sign"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0 text-white-50 small font-sans-serif" style="font-size: 0.75rem;" data-i18n="today_sales">Today's Sales</h6>
                                    <h5 class="mb-0 fw-bold" id="rep-total-sales">₹0.00</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card dashboard-card bg-success text-white h-100 py-2 border-0 shadow-sm">
                            <div class="card-body d-flex align-items-center p-3">
                                <div class="icon-box bg-white text-success me-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; flex-shrink: 0;">
                                    <i class="fas fa-file-invoice"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0 text-white-50 small font-sans-serif" style="font-size: 0.75rem;" data-i18n="patti_bill">Patti Bills</h6>
                                    <h5 class="mb-0 fw-bold" id="rep-sales-count">0</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card dashboard-card bg-danger text-white h-100 py-2 border-0 shadow-sm">
                            <div class="card-body d-flex align-items-center p-3">
                                <div class="icon-box bg-white text-danger me-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; flex-shrink: 0;">
                                    <i class="fas fa-wallet"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0 text-white-50 small font-sans-serif" style="font-size: 0.75rem;" data-i18n="today_expenses">Today's Expenses</h6>
                                    <h5 class="mb-0 fw-bold" id="rep-total-expenses">₹0.00</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card dashboard-card bg-info text-white h-100 py-2 border-0 shadow-sm">
                            <div class="card-body d-flex align-items-center p-3">
                                <div class="icon-box bg-white text-info me-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; flex-shrink: 0;">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0 text-white-50 small font-sans-serif" style="font-size: 0.75rem;">Net Profit</h6>
                                    <h5 class="mb-0 fw-bold" id="rep-net-profit">₹0.00</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card dashboard-card bg-warning text-dark h-100 py-2 border-0 shadow-sm">
                            <div class="card-body d-flex align-items-center p-3">
                                <div class="icon-box bg-white text-warning me-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; flex-shrink: 0;">
                                    <i class="fas fa-hand-holding-usd"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0 text-dark-50 small font-sans-serif" style="font-size: 0.75rem;" data-i18n="pending_collections">Pending</h6>
                                    <h5 class="mb-0 fw-bold" id="rep-pending">₹0.00</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row g-3 mb-4">
                    <div class="col-md-8">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-header bg-white border-0 py-3">
                                <h6 class="mb-0 fw-bold" data-i18n="daily_sales_trend">Sales & Expense Trend (Last 7 Days)</h6>
                            </div>
                            <div class="card-body">
                                <div style="height: 280px; position: relative;">
                                    <canvas id="salesTrendChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-header bg-white border-0 py-3">
                                <h6 class="mb-0 fw-bold" data-i18n="payment_modes">Payment Modes</h6>
                            </div>
                            <div class="card-body">
                                <div style="height: 280px; position: relative;">
                                    <canvas id="paymentModeChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-white border-0 py-3">
                                <h6 class="mb-0 fw-bold" data-i18n="fast_moving">Fast Moving Products</h6>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0 small">
                                        <thead class="table-light">
                                            <tr>
                                                <th data-i18n="prod_name">Product</th>
                                                <th class="text-center">Qty Sold</th>
                                                <th class="text-end">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody id="rep-fast-moving"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-white border-0 py-3">
                                <h6 class="mb-0 fw-bold" data-i18n="low_stock_alerts">Low Stock Warnings</h6>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0 small">
                                        <thead class="table-light">
                                            <tr>
                                                <th data-i18n="prod_name">Product</th>
                                                <th class="text-center" data-i18n="stock">Stock</th>
                                                <th class="text-center" data-i18n="status">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody id="rep-low-stock"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Date Range Sales Report Tab -->
            <div class="tab-pane fade" id="rep-sales-detail">
                <div class="card border-0 shadow-sm">
                    <div class="card-body bg-light border-bottom p-3">
                        <div class="row g-2 align-items-end">
                            <div class="col-md-3 text-start">
                                <label class="small text-muted mb-1">From Date</label>
                                <input type="date" class="form-control form-control-sm" id="rep-sales-from">
                            </div>
                            <div class="col-md-3 text-start">
                                <label class="small text-muted mb-1">To Date</label>
                                <input type="date" class="form-control form-control-sm" id="rep-sales-to">
                            </div>
                            <div class="col-md-6">
                                <div class="btn-group btn-group-sm w-100">
                                    <button class="btn btn-primary" onclick="ReportLogic.generateSalesReport()"><i class="fas fa-sync"></i> <span data-i18n="sync">Refresh</span></button>
                                    <button class="btn btn-success" onclick="ReportLogic.exportSalesExcel()"><i class="fas fa-file-excel"></i> Excel</button>
                                    <button class="btn btn-danger" onclick="ReportLogic.exportSalesPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th data-i18n="bill_no">Bill #</th>
                                        <th data-i18n="purchase_date">Date</th>
                                        <th data-i18n="customer">Customer</th>
                                        <th>Items Count</th>
                                        <th class="text-end">Gross Total</th>
                                        <th class="text-end">Charges</th>
                                        <th class="text-end">Discount</th>
                                        <th class="text-end text-success">Net Total</th>
                                        <th data-i18n="payment_mode">Mode</th>
                                    </tr>
                                </thead>
                                <tbody id="rep-sales-tbody"></tbody>
                                <tfoot class="table-dark font-monospace text-end align-middle">
                                    <tr>
                                        <td colspan="4" class="text-start fw-bold">TOTALS:</td>
                                        <td id="rep-sales-total-gross">₹0.00</td>
                                        <td id="rep-sales-total-charges">₹0.00</td>
                                        <td id="rep-sales-total-discount">₹0.00</td>
                                        <td id="rep-sales-total-net" class="text-success fw-bold">₹0.00</td>
                                        <td></td>
                                    </tr>
                                    <tr class="table-secondary text-dark text-start">
                                        <td colspan="9">
                                            <div class="d-flex flex-wrap gap-4 justify-content-between font-sans-serif px-2 py-1">
                                                <span><strong>Total Cash Payment:</strong> <span id="rep-sales-total-cash" class="text-success fw-bold">₹0.00</span></span>
                                                <span><strong>Total UPI Payment:</strong> <span id="rep-sales-total-upi" class="text-info fw-bold">₹0.00</span></span>
                                                <span><strong>Total Credit / Unpaid:</strong> <span id="rep-sales-total-credit" class="text-warning fw-bold">₹0.00</span></span>
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stock Valuation Tab -->
            <div class="tab-pane fade" id="rep-inventory">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                         <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0">Current Stock Inventory Valuation</h5>
                            <button class="btn btn-sm btn-outline-primary" onclick="ReportLogic.initInventory()"><i class="fas fa-sync"></i> <span data-i18n="sync">Refresh</span></button>
                         </div>
                         <div class="table-responsive">
                            <table class="table table-bordered table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th data-i18n="prod_name">Product Name</th>
                                        <th class="text-center" data-i18n="mark">Mark</th>
                                        <th class="text-center" data-i18n="stock">Current Stock</th>
                                        <th class="text-end" data-i18n="cost_rate">Estimated Unit Cost</th>
                                        <th class="text-end">Assigned Assets Value</th>
                                    </tr>
                                </thead>
                                <tbody id="rep-stock-tbody"></tbody>
                                <tfoot class="table-dark font-monospace">
                                    <tr>
                                        <td colspan="4" class="text-end fw-bold">TOTAL PORTFOLIO ASSET VALUE:</td>
                                        <td class="text-end fw-extrabold text-warning" id="rep-stock-total">\u20B90.00</td>
                                    </tr>
                                </tfoot>
                            </table>
                         </div>
                    </div>
                </div>
            </div>

            <!-- Ledger Outstanding Balances Tab -->
            <div class="tab-pane fade" id="rep-ledger-summary">
                 <div class="row g-3">
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-header bg-primary text-white py-3">
                                <h6 class="mb-0 fw-bold" data-i18n="receivables">Receivables Outstanding (Customers)</h6>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0 align-middle">
                                        <tbody id="rep-cust-due-tbody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-header bg-danger text-white py-3">
                                <h6 class="mb-0 fw-bold" data-i18n="payables">Payables Outstanding (Suppliers)</h6>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0 align-middle">
                                        <tbody id="rep-supp-due-tbody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    `,

    masters: `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 fw-bold text-dark" data-i18n="category">Product Categories</h5>
                        <button class="btn btn-sm btn-primary" onclick="app.addCategory()"><i class="fas fa-plus"></i> <span data-i18n="add">Add</span></button>
                    </div>
                    <div class="card-body p-0">
                        <ul class="list-group list-group-flush" id="category-list">
                            <!-- dynamic list -->
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 fw-bold text-dark" data-i18n="unit">Product Units</h5>
                        <button class="btn btn-sm btn-primary" onclick="app.addUnit()"><i class="fas fa-plus"></i> <span data-i18n="add">Add</span></button>
                    </div>
                    <div class="card-body p-0">
                        <ul class="list-group list-group-flush" id="unit-list">
                            <!-- dynamic list -->
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `,

    settings: `
        <div class="row g-4">
            <!-- Left Sidebar Tabs -->
            <div class="col-lg-3 col-md-4">
                <div class="card border-0 shadow-sm sticky-lg-top" style="top: 90px; z-index: 10;">
                    <div class="card-header bg-white border-0 py-3">
                        <h6 class="mb-0 fw-bold text-dark"><i class="fas fa-sliders-h me-2"></i>Control Center</h6>
                    </div>
                    <div class="list-group list-group-flush" id="settings-tab-list" role="tablist">
                        <a class="list-group-item list-group-item-action active d-flex align-items-center py-3" id="tab-profile-list" data-bs-toggle="list" href="#tab-profile" role="tab">
                            <i class="fas fa-store me-3 text-primary fa-fw"></i> <span>1. Shop Profile</span>
                        </a>
                        <a class="list-group-item list-group-item-action d-flex align-items-center py-3" id="tab-branding-list" data-bs-toggle="list" href="#tab-branding" role="tab">
                            <i class="fas fa-palette me-3 text-success fa-fw"></i> <span>2. Logo & Branding</span>
                        </a>
                        <a class="list-group-item list-group-item-action d-flex align-items-center py-3" id="tab-billing-list" data-bs-toggle="list" href="#tab-billing" role="tab">
                            <i class="fas fa-file-invoice-dollar me-3 text-warning fa-fw"></i> <span>3. Bill Settings</span>
                        </a>
                        <a class="list-group-item list-group-item-action d-flex align-items-center py-3" id="tab-security-list" data-bs-toggle="list" href="#tab-security" role="tab">
                            <i class="fas fa-shield-alt me-3 text-danger fa-fw"></i> <span>4. User & Security</span>
                        </a>
                        <a class="list-group-item list-group-item-action d-flex align-items-center py-3" id="tab-backup-list" data-bs-toggle="list" href="#tab-backup" role="tab">
                            <i class="fas fa-database me-3 text-info fa-fw"></i> <span>5. Backup & Restore</span>
                        </a>
                        <a class="list-group-item list-group-item-action d-flex align-items-center py-3" id="tab-stock-list" data-bs-toggle="list" href="#tab-stock" role="tab">
                            <i class="fas fa-cubes me-3 text-secondary fa-fw"></i> <span>6. Stock Settings</span>
                        </a>
                        <a class="list-group-item list-group-item-action d-flex align-items-center py-3" id="tab-payment-list" data-bs-toggle="list" href="#tab-payment" role="tab">
                            <i class="fas fa-wallet me-3 text-dark fa-fw"></i> <span>7. Payments Settings</span>
                        </a>
                        <a class="list-group-item list-group-item-action d-flex align-items-center py-3" id="tab-notifications-list" data-bs-toggle="list" href="#tab-notifications" role="tab">
                            <i class="fas fa-bell me-3 text-primary fa-fw"></i> <span>8. Notifications</span>
                        </a>
                        <a class="list-group-item list-group-item-action d-flex align-items-center py-3" id="tab-system-list" data-bs-toggle="list" href="#tab-system" role="tab">
                            <i class="fas fa-cog me-3 text-success fa-fw"></i> <span>9. System Settings</span>
                        </a>
                        <a class="list-group-item list-group-item-action d-flex align-items-center py-3" id="tab-print-list" data-bs-toggle="list" href="#tab-print" role="tab">
                            <i class="fas fa-print me-3 text-warning fa-fw"></i> <span>10. Receipt & Print</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Right Content Panels -->
            <div class="col-lg-9 col-md-8 text-start">
                <div class="tab-content" id="nav-tabContent">
                    
                    <!-- 1. Shop Profile -->
                    <div class="tab-pane fade show active" id="tab-profile" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-store text-primary me-2"></i>Shop Profile Settings</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Shop Name</label>
                                        <input type="text" class="form-control" id="set-shop-name">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Owner Name</label>
                                        <input type="text" class="form-control" id="set-owner-name">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Mobile Number</label>
                                        <input type="text" class="form-control" id="set-phone">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">WhatsApp Number</label>
                                        <input type="text" class="form-control" id="set-whatsapp">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Email ID</label>
                                        <input type="email" class="form-control" id="set-email">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">GST Number</label>
                                        <input type="text" class="form-control" id="set-gstin">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">PAN Number</label>
                                        <input type="text" class="form-control" id="set-pan">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Website URL</label>
                                        <input type="text" class="form-control" id="set-website">
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label fw-semibold">Address Line details</label>
                                        <input type="text" class="form-control" id="set-address">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">City</label>
                                        <input type="text" class="form-control" id="set-city">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">State</label>
                                        <input type="text" class="form-control" id="set-state">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">Pincode</label>
                                        <input type="text" class="form-control" id="set-pincode">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">Business Type</label>
                                        <select class="form-select" id="set-business-type">
                                            <option value="Wholesale">Wholesale Patti Merchant</option>
                                            <option value="Retail">Retail Store</option>
                                            <option value="Supermarket">Supermarket / Grocery</option>
                                            <option value="Other">Other Business</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">Currency Symbol</label>
                                        <select class="form-select" id="set-currency">
                                            <option value="₹">Rupee (₹)</option>
                                            <option value="$">US Dollar ($)</option>
                                            <option value="€">Euro (€)</option>
                                            <option value="£">Pound (£)</option>
                                            <option value="AED">AED (د.إ)</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">Timezone</label>
                                        <select class="form-select" id="set-timezone">
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">US/Eastern (EST)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Logo & Branding -->
                    <div class="tab-pane fade" id="tab-branding" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-palette text-success me-2"></i>Logo & Branding Settings</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <!-- Logo Uploads -->
                                    <div class="col-md-4 text-center">
                                        <label class="form-label d-block fw-semibold mb-2">Shop Logo</label>
                                        <div class="border rounded p-2 mb-2 bg-light d-flex align-items-center justify-content-center" style="height: 100px;">
                                            <img id="preview-logo" src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" style="max-height: 100%; max-width: 100%; object-fit: contain;">
                                        </div>
                                        <input type="file" class="form-control form-control-sm" id="upload-logo" accept="image/*">
                                    </div>
                                    
                                    <div class="col-md-4 text-center">
                                        <label class="form-label d-block fw-semibold mb-2">Invoice Header Logo</label>
                                        <div class="border rounded p-2 mb-2 bg-light d-flex align-items-center justify-content-center" style="height: 100px;">
                                            <img id="preview-header-logo" src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" style="max-height: 100%; max-width: 100%; object-fit: contain;">
                                        </div>
                                        <input type="file" class="form-control form-control-sm" id="upload-header-logo" accept="image/*">
                                    </div>

                                    <div class="col-md-4 text-center">
                                        <label class="form-label d-block fw-semibold mb-2">Favicon Icon</label>
                                        <div class="border rounded p-2 mb-2 bg-light d-flex align-items-center justify-content-center" style="height: 100px;">
                                            <img id="preview-favicon" src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" style="max-height: 32px; max-width: 32px; object-fit: contain;">
                                        </div>
                                        <input type="file" class="form-control form-control-sm" id="upload-favicon" accept="image/*">
                                    </div>

                                    <hr class="my-4">

                                    <!-- Theme Settings -->
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Theme Color Picker</label>
                                        <div class="d-flex align-items-center gap-3">
                                            <input type="color" class="form-control form-control-color border" id="set-theme-color" value="#2563eb" title="Choose brand color">
                                            <span class="text-muted small">Select your shop's primary brand theme color.</span>
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold d-block">App Layout Mode</label>
                                        <div class="form-check form-switch pt-2">
                                            <input class="form-check-input" type="checkbox" id="set-dark-mode" onchange="app.toggleTheme()">
                                            <label class="form-check-label fw-semibold" for="set-dark-mode">Enable Premium Dark Theme</label>
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Invoice Print Font Family</label>
                                        <select class="form-select" id="set-invoice-font">
                                            <option value="Arial">Arial (Standard Sans-Serif)</option>
                                            <option value="Courier New">Courier New (Teletype Monospace)</option>
                                            <option value="Times New Roman">Times New Roman (Elegant Serif)</option>
                                            <option value="Inter">Inter (Modern Clean)</option>
                                        </select>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Thermal Receipt Font Family</label>
                                        <select class="form-select" id="set-thermal-font">
                                            <option value="Courier New">Courier New (Recommended Monospace)</option>
                                            <option value="monospace">Standard browser monospace</option>
                                            <option value="Consolas">Consolas (HD Monospace)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. Bill Settings -->
                    <div class="tab-pane fade" id="tab-billing" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-file-invoice-dollar text-warning me-2"></i>Bill & Invoice Configurations</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">Invoice Series Prefix</label>
                                        <input type="text" class="form-control" id="set-invoice-prefix" value="INV-">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold d-block">Sequence Management</label>
                                        <div class="form-check form-switch pt-2">
                                            <input class="form-check-input" type="checkbox" id="set-auto-invoice" checked>
                                            <label class="form-check-label" for="set-auto-invoice">Auto Invoice Numbering</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">Default Printing Format</label>
                                        <select class="form-select" id="set-printer">
                                            <option value="80mm">Thermal 80mm Layout</option>
                                            <option value="58mm">Thermal 58mm Layout</option>
                                            <option value="A4">A4 Full Page Invoice</option>
                                        </select>
                                    </div>

                                    <hr class="my-3">

                                    <!-- Tax Management -->
                                    <div class="col-12">
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="set-gst-enabled" checked>
                                            <label class="form-check-label fw-bold" for="set-gst-enabled">Enable GST Calculations</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">CGST Default Rate (%)</label>
                                        <input type="number" step="0.01" class="form-control" id="set-cgst" value="2.5">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">SGST Default Rate (%)</label>
                                        <input type="number" step="0.01" class="form-control" id="set-sgst" value="2.5">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-semibold">IGST Default Rate (%)</label>
                                        <input type="number" step="0.01" class="form-control" id="set-igst" value="5.0">
                                    </div>

                                    <hr class="my-3">

                                    <!-- Billing Toggles -->
                                    <div class="col-md-6">
                                        <h6 class="fw-bold mb-2 text-primary">Calculation Controls</h6>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-discount-enabled" checked>
                                            <label class="form-check-label" for="set-discount-enabled">Enable Cart/Item Discounts</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-roundoff-enabled" checked>
                                            <label class="form-check-label" for="set-roundoff-enabled">Enable Bill Total Round-off</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-barcode-enabled" checked>
                                            <label class="form-check-label" for="set-barcode-enabled">Enable Barcode Scanning Mode</label>
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <h6 class="fw-bold mb-2 text-success">Dispatch & Share Settings</h6>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-print-preview" checked>
                                            <label class="form-check-label" for="set-print-preview">Show Print Preview Dialog</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-auto-print">
                                            <label class="form-check-label" for="set-auto-print">Auto-Print Instantly on Finalize</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-whatsapp-share" checked>
                                            <label class="form-check-label" for="set-whatsapp-share">Enable WhatsApp Bill Sharing</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-sms-share">
                                            <label class="form-check-label" for="set-sms-share">Enable SMS Bill Dispatch alerts</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 4. User & Security Settings -->
                    <div class="tab-pane fade" id="tab-security" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-shield-alt text-danger me-2"></i>User & Security Management</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <!-- Admin and Staff Controls -->
                                    <div class="col-md-6">
                                        <h6 class="fw-bold text-dark mb-2">Admin Profile Control</h6>
                                        <div class="border rounded p-3 bg-light mb-3">
                                            <div class="d-flex align-items-center gap-3">
                                                <i class="fas fa-user-shield fa-2x text-primary"></i>
                                                <div>
                                                    <span class="fw-bold d-block">Super Administrator</span>
                                                    <small class="text-muted font-monospace">Username: VIKI</small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <label class="form-label fw-semibold">Staff Operator Permission Role</label>
                                        <select class="form-select mb-3" id="set-staff-role">
                                            <option value="admin">Administrator (Full Admin Access)</option>
                                            <option value="operator">Billing Counter Clerk (POS Operations Only)</option>
                                            <option value="manager">Store Manager (POS + Product Rates Editor)</option>
                                        </select>

                                        <div class="form-check mb-3">
                                            <input class="form-check-input" type="checkbox" id="set-two-step">
                                            <label class="form-check-label fw-bold" for="set-two-step">Enable Two-Step Verification</label>
                                        </div>

                                        <label class="form-label fw-semibold">Session Idle Timeout</label>
                                        <select class="form-select" id="set-session-timeout">
                                            <option value="15">15 Minutes Idle</option>
                                            <option value="30">30 Minutes Idle (Recommended)</option>
                                            <option value="60">60 Minutes Idle</option>
                                            <option value="0">Keep Logged In (Never Timeout)</option>
                                        </select>
                                    </div>

                                    <!-- Password Change Card -->
                                    <div class="col-md-6 border-start ps-lg-4">
                                        <h6 class="fw-bold text-dark mb-2">Reset Password Security</h6>
                                        <div class="mb-3">
                                            <label class="form-label text-muted small">Current Admin Password</label>
                                            <input type="password" class="form-control form-control-sm" id="sec-curr-pwd" value="VIKI1101">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label text-muted small">New Secure Password</label>
                                            <input type="password" class="form-control form-control-sm" id="sec-new-pwd" placeholder="Enter new password">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label text-muted small">Confirm New Password</label>
                                            <input type="password" class="form-control form-control-sm" id="sec-conf-pwd" placeholder="Re-enter new password">
                                        </div>
                                        <button class="btn btn-sm btn-outline-danger fw-bold" onclick="app.changePassword()"><i class="fas fa-key me-1"></i> Update Security Credentials</button>
                                    </div>
                                    
                                    <hr class="my-3">

                                    <!-- Activity Logs -->
                                    <div class="col-12">
                                        <h6 class="fw-bold text-dark mb-2">Device Login & Counter Activity History</h6>
                                        <div class="border rounded font-monospace p-3 bg-light overflow-auto" style="max-height: 120px; font-size: 11px;">
                                            <div>[2026-05-22 19:40:22] Counter opened by SuperAdmin "VIKI" (IP: 127.0.0.1 on Chrome/Win64)</div>
                                            <div>[2026-05-22 18:12:05] Cloud Sync completed successfully for 4 transactions</div>
                                            <div>[2026-05-22 13:55:10] Security login checklist passed (Local storage cache loaded)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 5. Backup & Restore -->
                    <div class="tab-pane fade" id="tab-backup" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-database text-info me-2"></i>Backup, Restore & Disaster Recovery</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <h6 class="fw-bold mb-2">Export Data Sheets</h6>
                                        <p class="small text-muted">Generate manual offline backup files containing all inventory sheets, daily transaction books, customers ledger, and local settings configurations.</p>
                                        <div class="d-grid gap-2">
                                            <button class="btn btn-outline-primary text-start" onclick="app.downloadBackup()"><i class="fas fa-file-download me-2"></i> Download JSON Backup Database</button>
                                            <button class="btn btn-outline-success text-start" onclick="app.exportBackupExcel()"><i class="fas fa-file-excel me-2"></i> Export Data Base to MS Excel (.xlsx)</button>
                                            <button class="btn btn-outline-danger text-start" onclick="app.exportBackupPDF()"><i class="fas fa-file-pdf me-2"></i> Export Complete Records to Adobe PDF</button>
                                        </div>
                                    </div>
                                    
                                    <div class="col-md-6 border-start ps-lg-4">
                                        <h6 class="fw-bold mb-2">Restore Backup File</h6>
                                        <p class="small text-muted">Import a previously downloaded &quot;.json&quot; database file to restore customer balances, stock sheets, and transaction ledgers instantly.</p>
                                        <div class="border rounded p-3 bg-light text-center">
                                            <input type="file" class="form-control mb-3" id="upload-backup-file" accept=".json">
                                            <button class="btn btn-danger btn-sm w-100 fw-bold" onclick="app.restoreBackup()"><i class="fas fa-file-upload me-1"></i> Upload & Overwrite Database</button>
                                        </div>
                                    </div>

                                    <hr class="my-4">

                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Auto Backup Scheduler</label>
                                        <select class="form-select" id="set-backup-schedule">
                                            <option value="disabled">Disabled (Manual Only)</option>
                                            <option value="hourly">Hourly Cache Backup</option>
                                            <option value="daily">Daily Day-End Backup (Recommended)</option>
                                            <option value="weekly">Weekly Cloud Archive</option>
                                        </select>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold d-block">Firestore Remote Storage</label>
                                        <div class="pt-2">
                                            <button class="btn btn-outline-info fw-bold btn-sm me-2" onclick="app.forceSync()"><i class="fas fa-cloud-upload-alt me-1"></i> Initialize FireStore Backup Sync</button>
                                            <span class="badge bg-success py-2">Connected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 6. Stock Settings -->
                    <div class="tab-pane fade" id="tab-stock" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-cubes text-secondary me-2"></i>Stock & Inventory Configurations</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Low Stock Alarm Threshold</label>
                                        <input type="number" class="form-control" id="set-low-stock-limit" value="150">
                                        <small class="text-muted">Highlights products red in the dashboard when stock falls below this level.</small>
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Expiry Alerts Notification</label>
                                        <input type="number" class="form-control" id="set-expiry-alert-days" value="30">
                                        <small class="text-muted">Alerts operator if batches are expiring within these many days.</small>
                                    </div>

                                    <hr class="my-3">

                                    <div class="col-md-6">
                                        <h6 class="fw-bold text-primary mb-2">Automated Inventory Logic</h6>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-auto-deduct-stock" checked>
                                            <label class="form-check-label" for="set-auto-deduct-stock">Auto deduct stock quantities on billing save</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-auto-barcode" checked>
                                            <label class="form-check-label" for="set-auto-barcode">Auto-generate random barcode for new products</label>
                                        </div>
                                    </div>

                                    <div class="col-md-6 border-start ps-lg-4">
                                        <h6 class="fw-bold text-dark mb-2">Master Listings Shortcut</h6>
                                        <p class="small text-muted">Manage product categories, measurement units (e.g. KG, Sack, Box) and vendors databases.</p>
                                        <div class="d-flex gap-2">
                                            <button class="btn btn-sm btn-outline-secondary" onclick="app.loadPage('masters')"><i class="fas fa-tags me-1"></i> Open Categories & Units</button>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="app.loadPage('products')"><i class="fas fa-box me-1"></i> Edit Products Catalog</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 7. Payments Settings -->
                    <div class="tab-pane fade" id="tab-payment" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-wallet text-dark me-2"></i>Payment Gateway & Bank Configurations</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <!-- UPI QR File Upload -->
                                    <div class="col-md-5 text-center">
                                        <label class="form-label d-block fw-semibold mb-2">Store UPI QR Code Image</label>
                                        <div class="border rounded p-2 mb-2 bg-light d-flex align-items-center justify-content-center mx-auto" style="height: 140px; width: 140px;">
                                            <img id="preview-upi-qr" src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=upi://pay?pa=vmaster@upi" style="height: 100%; width: 100%; object-fit: contain;">
                                        </div>
                                        <input type="file" class="form-control form-control-sm" id="upload-upi-qr" accept="image/*">
                                        <small class="text-muted small d-block mt-1">Upload a static QR code image to print directly on bills.</small>
                                    </div>

                                    <!-- Bank Account Specifications -->
                                    <div class="col-md-7 border-start ps-lg-4">
                                        <h6 class="fw-bold mb-2">Settlement Bank Account details</h6>
                                        <div class="row g-2">
                                            <div class="col-md-6">
                                                <label class="form-label small text-muted mb-1">Bank Name</label>
                                                <input type="text" class="form-control form-control-sm" id="set-bank-name" value="V-Bank Ltd">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label small text-muted mb-1">Account Number</label>
                                                <input type="text" class="form-control form-control-sm" id="set-bank-account" value="98765432101">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label small text-muted mb-1">IFSC Code</label>
                                                <input type="text" class="form-control form-control-sm" id="set-bank-ifsc" value="VBNK000101">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label small text-muted mb-1">Branch Location</label>
                                                <input type="text" class="form-control form-control-sm" id="set-bank-branch" value="Main Branch">
                                            </div>
                                            <div class="col-md-12">
                                                <label class="form-label small text-muted mb-1" data-i18n="upi_id">Merchant UPI ID</label>
                                                <input type="text" class="form-control form-control-sm font-monospace" id="set-upi-id" placeholder="e.g. vmaster@upi">
                                            </div>
                                        </div>
                                    </div>

                                    <hr class="my-4">

                                    <!-- Payment Options Toggle -->
                                    <div class="col-md-6">
                                        <h6 class="fw-bold mb-2 text-primary">Accepted Payments Options</h6>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-cash-enabled" checked>
                                            <label class="form-check-label" for="set-cash-enabled">Cash payments at Counter</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-card-enabled" checked>
                                            <label class="form-check-label" for="set-card-enabled">Credit / Debit Card swipe terminal</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-upi-enabled" checked>
                                            <label class="form-check-label" for="set-upi-enabled">Bhim UPI QR Code Scanning</label>
                                        </div>
                                    </div>

                                    <!-- Razorpay Details -->
                                    <div class="col-md-6 border-start ps-lg-4">
                                        <h6 class="fw-bold mb-2 text-success">Online Gateway (Razorpay Integration)</h6>
                                        <div class="mb-2">
                                            <label class="form-label small text-muted mb-0">Razorpay Key ID</label>
                                            <input type="text" class="form-control form-control-sm" id="set-razorpay-key" placeholder="rzp_live_...">
                                        </div>
                                        <div>
                                            <label class="form-label small text-muted mb-0">Razorpay Secret Key</label>
                                            <input type="password" class="form-control form-control-sm" id="set-razorpay-secret" placeholder="••••••••••••">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 8. Notifications -->
                    <div class="tab-pane fade" id="tab-notifications" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-bell text-primary me-2"></i>Automated Notifications & Sharing Alerts</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <h6 class="fw-bold mb-3 text-primary">Global Channels</h6>
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="set-whatsapp-notify" checked>
                                            <label class="form-check-label fw-semibold" for="set-whatsapp-notify">Enable WhatsApp Cloud API alerts</label>
                                        </div>
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="set-email-notify">
                                            <label class="form-check-label fw-semibold" for="set-email-notify">Enable SMTP Email Dispatchers</label>
                                        </div>
                                    </div>

                                    <div class="col-md-6 border-start ps-lg-4">
                                        <h6 class="fw-bold mb-3 text-success">Triggers & Scheduled Alerts</h6>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-daily-report-notify" checked>
                                            <label class="form-check-label" for="set-daily-report-notify">Send Daily Sales Summary to Owner</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-low-stock-notify" checked>
                                            <label class="form-check-label" for="set-low-stock-notify">Send low stock alarms instantly</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-due-alert-notify" checked>
                                            <label class="form-check-label" for="set-due-alert-notify">Auto send Outstanding Due reminders to Creditors</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 9. System Settings -->
                    <div class="tab-pane fade" id="tab-system" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-cog text-success me-2"></i>System Configuration & Shortcuts</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Default Interface Language</label>
                                        <select class="form-select" id="set-language-selection" onchange="i18n.setLanguage(this.value)">
                                            <option value="en">English (US)</option>
                                            <option value="ta">Tamil (தமிழ்)</option>
                                        </select>
                                        <small class="text-muted d-block mt-1">Full Bilingual translation supported on menus, catalog, and print receipts.</small>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Date Format Representation</label>
                                        <select class="form-select" id="set-date-format">
                                            <option value="dd/mm/yyyy">DD/MM/YYYY (Standard - 22/05/2026)</option>
                                            <option value="yyyy-mm-dd">YYYY-MM-DD (ISO Format - 2206-05-22)</option>
                                        </select>
                                    </div>

                                    <hr class="my-3">

                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Default Global Tax Rate (%)</label>
                                        <input type="number" class="form-control" id="set-default-tax" value="5.0">
                                    </div>

                                    <div class="col-md-6 pt-md-4">
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-offline-sync" checked>
                                            <label class="form-check-label fw-semibold" for="set-offline-sync">Offline Persistence Support</label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-auto-sync" checked>
                                            <label class="form-check-label fw-semibold" for="set-auto-sync">Auto Cloud Data Sync (Firestore)</label>
                                        </div>
                                    </div>
                                    
                                    <hr class="my-3">

                                    <!-- Hotkeys list -->
                                    <div class="col-12">
                                        <h6 class="fw-bold mb-2">System Hotkeys Keyboard Shortcuts</h6>
                                        <div class="row g-2 font-monospace" style="font-size: 12px;">
                                            <div class="col-md-4"><span class="badge bg-secondary py-2 px-3 me-2">F1</span> Focus Product Search Input</div>
                                            <div class="col-md-4"><span class="badge bg-secondary py-2 px-3 me-2">F2</span> Focus Customer Search Dropdown</div>
                                            <div class="col-md-4"><span class="badge bg-secondary py-2 px-3 me-2">F9</span> Complete Cash POS & Print Bill</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 10. Receipt & Print -->
                    <div class="tab-pane fade" id="tab-print" role="tabpanel">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-0 py-3">
                                <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-print text-warning me-2"></i>Receipt Design & Customization</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-12">
                                        <label class="form-label fw-semibold">Default Receipt Footer Message</label>
                                        <input type="text" class="form-control" id="set-footer-message" value="*** Thank You! Visit Again ***">
                                        <small class="text-muted">Prints at the bottom of 80mm/58mm thermal receipts.</small>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Terms & Conditions (Standard)</label>
                                        <textarea class="form-control font-monospace" id="set-terms" rows="3" style="font-size: 12px;">1. Goods once sold will not be returned or exchanged.
2. Please settle pending outstanding within due limits.</textarea>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Return & Refund Policy details</label>
                                        <textarea class="form-control font-monospace" id="set-return-policy" rows="3" style="font-size: 12px;">No return on perishables or damaged packages.</textarea>
                                    </div>

                                    <hr class="my-3">

                                    <div class="col-md-6">
                                        <h6 class="fw-bold mb-2 text-primary">Thermal Receipt Add-ons</h6>
                                        <div class="form-check form-switch mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-qr-on-bill" checked>
                                            <label class="form-check-label" for="set-qr-on-bill">Print Payment UPI QR Code on Bill</label>
                                        </div>
                                    </div>

                                    <div class="col-md-6 border-start ps-lg-4">
                                        <h6 class="fw-bold mb-2 text-success">A4 Invoice Customization</h6>
                                        <div class="form-check form-switch mb-2">
                                            <input class="form-check-input" type="checkbox" id="set-barcode-on-invoice" checked>
                                            <label class="form-check-label" for="set-barcode-on-invoice">Print Barcode scan line on Invoice header</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Floating Action Buttons -->
                    <div class="col-12 d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <span class="text-muted small"><i class="fas fa-info-circle me-1"></i> Make sure to click save configurations to update cache.</span>
                        <button type="button" class="btn btn-primary btn-lg px-5 fw-bold rounded-pill shadow-lg" onclick="app.saveSettings()">
                            <i class="fas fa-save me-2"></i> Save All Settings
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `,

    rates: `
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="text-start">
                    <h5 class="mb-0 fw-bold text-dark" data-i18n="special_rates"><i class="fas fa-money-bill-wave me-1 text-primary"></i> Bulk Rates Matrix</h5>
                    <p class="text-muted small mb-0">Instantly edit price lists for Retail, Wholesale, and VIP accounts globally.</p>
                </div>
                <div class="d-flex gap-2">
                    <div class="input-group input-group-sm" style="width: 240px;">
                        <span class="input-group-text bg-white"><i class="fas fa-search"></i></span>
                        <input type="text" class="form-control border-start-0" placeholder="Filter list..." oninput="PricingLogic.filterBulkRates(this.value)">
                    </div>
                    <button class="btn btn-primary btn-sm px-3 fw-bold" onclick="PricingLogic.saveAllBulkRates()">
                        <i class="fas fa-save me-1"></i> Save Changes
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive" style="max-height: 68vh;">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-dark sticky-top">
                            <tr>
                                <th style="width: 25%" data-i18n="prod_name">Product Name</th>
                                <th style="width: 15%" data-i18n="category">Category</th>
                                <th class="text-center" style="width: 15%" data-i18n="retail_rate">Retail Rate</th>
                                <th class="text-center" style="width: 15%" data-i18n="wholesale_rate">Wholesale Rate</th>
                                <th class="text-center" style="width: 15%" data-i18n="vip_rate">VIP Rate</th>
                                <th class="text-center" style="width: 15%" data-i18n="min_rate">Min Rate</th>
                            </tr>
                        </thead>
                        <tbody id="bulk-rates-table">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,

    shops: `
        <div class="row">
            <!-- Left Panel: Create Shop -->
            <div class="col-lg-4 mb-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white border-0 py-3">
                        <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-plus-circle me-1 text-primary"></i> Create New Shop</h5>
                        <p class="text-muted small mb-0">Add a new store entity and assign its administrator credentials.</p>
                    </div>
                    <div class="card-body">
                        <form id="create-shop-form" onsubmit="app.createNewShop(event)">
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Shop Name</label>
                                <input type="text" class="form-control" id="new-shop-name" placeholder="e.g. Viki Patti Shop" required autocomplete="off">
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Admin Username</label>
                                <input type="text" class="form-control" id="new-shop-username" placeholder="e.g. vikiadmin" required autocomplete="off">
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Admin Password</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="new-shop-password" placeholder="Min 4 characters" required autocomplete="off">
                                    <button class="btn btn-outline-secondary" type="button" onclick="app.toggleNewShopPasswordVisibility()"><i class="fas fa-eye"></i></button>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold">AMC Plan</label>
                                <select class="form-select" id="new-shop-amc-plan" onchange="app.onNewShopPlanChange(this.value)" required>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Half-Yearly">Half-Yearly</option>
                                    <option value="Yearly" selected>Yearly</option>
                                    <option value="Lifetime">Lifetime</option>
                                </select>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-semibold">AMC Expiry Date</label>
                                <input type="date" class="form-control" id="new-shop-amc-expiry" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 fw-bold py-2"><i class="fas fa-store-alt me-1"></i> Launch Shop</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Right Panel: Shop List -->
            <div class="col-lg-8 mb-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-0 fw-bold text-dark"><i class="fas fa-store text-success me-1"></i> Active Registered Shops</h5>
                            <p class="text-muted small mb-0">System counters and administration access points.</p>
                        </div>
                        <span class="badge bg-primary fs-6 py-2 px-3 rounded-pill" id="total-shops-badge">0 Shops</span>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Shop Details</th>
                                        <th>Admin Username</th>
                                        <th>Credentials</th>
                                        <th>AMC Plan</th>
                                        <th>Status & Expiry</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="shops-list-tbody">
                                    <!-- Populated dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal for Editing AMC Plan & Expiry -->
        <div class="modal fade" id="editPlanModal" tabindex="-1" aria-labelledby="editPlanModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-header bg-primary text-white border-0 py-3">
                        <h5 class="modal-title fw-bold" id="editPlanModalLabel"><i class="fas fa-edit me-1"></i> Edit Shop AMC Subscription</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form id="edit-plan-form" onsubmit="app.saveShopPlan(event)">
                        <input type="hidden" id="edit-shop-id">
                        <div class="modal-body p-4">
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Shop Name</label>
                                <input type="text" class="form-control bg-light" id="edit-shop-name" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold">AMC Plan</label>
                                <select class="form-select" id="edit-shop-amc-plan" onchange="app.onEditPlanChange(this.value)" required>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Half-Yearly">Half-Yearly</option>
                                    <option value="Yearly">Yearly</option>
                                    <option value="Lifetime">Lifetime</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold">AMC Expiry Date</label>
                                <input type="date" class="form-control" id="edit-shop-amc-expiry" required>
                            </div>
                        </div>
                        <div class="modal-footer border-0 bg-light p-3">
                            <button type="button" class="btn btn-outline-secondary fw-semibold px-3" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary fw-bold px-4">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `
};
