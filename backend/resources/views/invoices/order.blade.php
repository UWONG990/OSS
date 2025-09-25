<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - {{ $order->order_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            border-bottom: 2px solid #007bff;
            margin-bottom: 30px;
            padding-bottom: 20px;
        }
        .company-info {
            text-align: center;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin: 0;
        }
        .company-tagline {
            color: #666;
            margin: 5px 0;
        }
        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #333;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .invoice-meta, .customer-info {
            width: 48%;
        }
        .invoice-meta h3, .customer-info h3 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
            color: #007bff;
        }
        .info-row {
            margin: 8px 0;
        }
        .label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        .items-table .text-right {
            text-align: right;
        }
        .items-table .text-center {
            text-align: center;
        }
        .totals-section {
            margin-top: 20px;
            text-align: right;
        }
        .totals-table {
            margin-left: auto;
            width: 300px;
        }
        .totals-table td {
            padding: 8px 15px;
            border-bottom: 1px solid #eee;
        }
        .totals-table .total-row {
            background-color: #007bff;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .payment-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-completed {
            background-color: #d4edda;
            color: #155724;
        }
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        .status-rejected {
            background-color: #f8d7da;
            color: #721c24;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1 class="company-name">OSS - Online Shopping System</h1>
            <p class="company-tagline">Your Trusted Marketplace</p>
        </div>
    </div>

    <h1 class="invoice-title">INVOICE</h1>

    <div class="invoice-details">
        <div class="invoice-meta">
            <h3>Invoice Details</h3>
            <div class="info-row">
                <span class="label">Invoice #:</span>
                {{ $order->order_number }}
            </div>
            <div class="info-row">
                <span class="label">Order Date:</span>
                {{ $order->created_at->format('F j, Y') }}
            </div>
            <div class="info-row">
                <span class="label">Due Date:</span>
                {{ $order->created_at->addDays(30)->format('F j, Y') }}
            </div>
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="status-badge status-{{ $order->status }}">{{ ucfirst($order->status) }}</span>
            </div>
            <div class="info-row">
                <span class="label">Payment:</span>
                <span class="status-badge status-{{ $order->payment_status }}">{{ ucfirst($order->payment_status) }}</span>
            </div>
        </div>

        <div class="customer-info">
            <h3>Bill To</h3>
            <div class="info-row">
                <span class="label">Customer:</span>
                {{ $order->user->name }}
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                {{ $order->user->email }}
            </div>
            @if($order->billing_address)
            <div class="info-row">
                <span class="label">Address:</span>
                {{ $order->billing_address['address'] ?? '' }}
            </div>
            <div class="info-row">
                <span class="label">City:</span>
                {{ $order->billing_address['city'] ?? '' }}, {{ $order->billing_address['state'] ?? '' }} {{ $order->billing_address['postal_code'] ?? '' }}
            </div>
            <div class="info-row">
                <span class="label">Country:</span>
                {{ $order->billing_address['country'] ?? '' }}
            </div>
            @endif
        </div>
    </div>

    @if($order->payment_method)
    <div class="payment-info">
        <h3 style="margin-top: 0;">Payment Information</h3>
        <div class="info-row">
            <span class="label">Method:</span>
            {{ ucfirst(str_replace('_', ' ', $order->payment_method)) }}
        </div>
        <div class="info-row">
            <span class="label">Status:</span>
            {{ ucfirst($order->payment_status) }}
        </div>
    </div>
    @endif

    <table class="items-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>
                    <strong>{{ $item->product_name }}</strong>
                    @if($item->product && $item->product->shop)
                    <br><small style="color: #666;">by {{ $item->product->shop->name }}</small>
                    @endif
                </td>
                <td>{{ $item->product_sku }}</td>
                <td class="text-center">{{ $item->quantity }}</td>
                <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">${{ number_format($item->total_price, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td><strong>Subtotal:</strong></td>
                <td class="text-right">${{ number_format($order->subtotal, 2) }}</td>
            </tr>
            @if($order->tax_amount > 0)
            <tr>
                <td><strong>Tax:</strong></td>
                <td class="text-right">${{ number_format($order->tax_amount, 2) }}</td>
            </tr>
            @endif
            @if($order->shipping_amount > 0)
            <tr>
                <td><strong>Shipping:</strong></td>
                <td class="text-right">${{ number_format($order->shipping_amount, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>${{ number_format($order->total_amount, 2) }}</strong></td>
            </tr>
        </table>
    </div>

    @if($order->notes)
    <div style="margin-top: 30px;">
        <h3>Notes</h3>
        <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff;">
            {{ $order->notes }}
        </p>
    </div>
    @endif

    @if($order->shipping_address)
    <div style="margin-top: 30px;">
        <h3>Shipping Address</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
            {{ $order->shipping_address['name'] ?? '' }}<br>
            {{ $order->shipping_address['address'] ?? '' }}<br>
            {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['postal_code'] ?? '' }}<br>
            {{ $order->shipping_address['country'] ?? '' }}
            @if(isset($order->shipping_address['phone']))
            <br>Phone: {{ $order->shipping_address['phone'] }}
            @endif
        </div>
    </div>
    @endif

    <div class="footer">
        <p><strong>Thank you for your business!</strong></p>
        <p>This invoice was generated on {{ now()->format('F j, Y \a\t g:i A') }}</p>
        <p>For questions about this invoice, please contact support@oss-marketplace.com</p>
    </div>
</body>
</html>