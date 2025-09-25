<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $orders = Order::with(['items.product.shop', 'items.product.category'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Authentication required',
                    'error' => 'User not authenticated'
                ], 401);
            }
            
            // Validate request
            $validatedData = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'shipping_info' => 'required|array',
                'shipping_info.firstName' => 'required|string|max:100',
                'shipping_info.lastName' => 'required|string|max:100',
                'shipping_info.email' => 'required|email|max:255',
                'shipping_info.phone' => 'required|string|max:20',
                'shipping_info.address' => 'required|string|max:500',
                'shipping_info.city' => 'required|string|max:100',
                'shipping_info.state' => 'required|string|max:100',
                'shipping_info.zipCode' => 'required|string|max:20',
                'shipping_info.country' => 'required|string|max:100',
                'payment_info' => 'required|array',
                'payment_info.method' => 'required|in:credit,debit,paypal',
                'total' => 'required|numeric|min:0'
            ]);

            DB::beginTransaction();

            // Verify products availability and calculate total
            $calculatedTotal = 0;
            $orderItems = [];

            foreach ($validatedData['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                
                if (!$product) {
                    throw new \Exception("Product with ID {$itemData['product_id']} not found");
                }

                if (!$product->is_active) {
                    throw new \Exception("Product '{$product->name}' is not available");
                }

                if ($product->quantity < $itemData['quantity']) {
                    throw new \Exception("Insufficient stock for product '{$product->name}'. Available: {$product->quantity}, Requested: {$itemData['quantity']}");
                }

                $itemTotal = $product->price * $itemData['quantity'];
                $calculatedTotal += $itemTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $product->price,
                    'total_price' => $itemTotal
                ];

                // Reserve stock
                $product->decrement('quantity', $itemData['quantity']);
            }

            // Verify total matches
            if (abs($calculatedTotal - $validatedData['total']) > 0.01) {
                throw new \Exception('Total amount mismatch');
            }

            // Generate order number
            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(uniqid());

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'subtotal' => $calculatedTotal,
                'tax_amount' => 0.00,
                'shipping_amount' => 0.00,
                'total_amount' => $calculatedTotal,
                'shipping_address' => $validatedData['shipping_info'],
                'billing_address' => $validatedData['shipping_info'], // Use same for now
                'payment_method' => $validatedData['payment_info']['method'],
                'payment_status' => 'pending',
                'notes' => null
            ]);

            // Create order items
            foreach ($orderItems as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'product_name' => $itemData['product_name'],
                    'product_sku' => $itemData['product_sku'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['total_price']
                ]);
            }

            // Process payment (simplified for demo)
            $paymentResult = $this->processOrderPayment($validatedData['payment_info'], $calculatedTotal);
            
            if ($paymentResult['success']) {
                $order->update([
                    'payment_status' => 'completed',
                    'status' => 'confirmed'
                ]);
            } else {
                $order->update([
                    'payment_status' => 'failed',
                    'status' => 'cancelled'
                ]);
                
                // Restore stock if payment failed
                foreach ($orderItems as $itemData) {
                    Product::find($itemData['product_id'])->increment('quantity', $itemData['quantity']);
                }
                
                throw new \Exception('Payment processing failed: ' . $paymentResult['message']);
            }

            DB::commit();

            // Load relationships for response (with error handling)
            try {
                $order->load(['items.product', 'user']);
            } catch (\Exception $e) {
                // Continue without relationships if loading fails
            }

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Order processing failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        
        // Check if user owns the order or is admin
        if ($order->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized to view this order'
            ], 403);
        }

        $order->load(['orderItems.product.shop', 'orderItems.product.category', 'user']);

        return response()->json($order);
    }

    /**
     * Update order status (admin only)
     */
    public function updateStatus(Request $request, Order $order)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string|max:1000'
        ]);

        $oldStatus = $order->status;
        
        $order->update([
            'status' => $request->status,
            'notes' => $request->notes
        ]);

        Log::info("Order {$order->order_number} status updated from {$oldStatus} to {$request->status} by admin {$user->email}");

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->load(['orderItems.product.shop', 'orderItems.product.category', 'user'])
        ]);
    }

    /**
     * Get orders for seller's products
     */
    public function sellerOrders(Request $request)
    {
        $user = $request->user();
        $shop = $user->shop;

        if (!$shop || $shop->status !== 'approved') {
            return response()->json([
                'message' => 'You must have an approved shop to view orders'
            ], 403);
        }

        $orders = Order::whereHas('orderItems.product', function ($query) use ($shop) {
            $query->where('shop_id', $shop->id);
        })
        ->with(['orderItems' => function ($query) use ($shop) {
            $query->whereHas('product', function ($q) use ($shop) {
                $q->where('shop_id', $shop->id);
            });
        }, 'orderItems.product', 'user'])
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        return response()->json($orders);
    }

    /**
     * Process payment (simplified demo version)
     */
    private function processOrderPayment($paymentInfo, $amount)
    {
        // In a real application, you would integrate with payment processors like:
        // - Stripe for credit/debit cards
        // - PayPal API for PayPal payments
        // - Square, Razorpay, etc.

        // For demo purposes, simulate payment processing
        $method = $paymentInfo['method'];
        
        // Simulate random success/failure for demo
        $simulateFailure = rand(1, 10) === 1; // 10% failure rate for demo
        
        if ($simulateFailure) {
            return [
                'success' => false,
                'message' => 'Payment declined. Please try a different payment method.',
                'transaction_id' => null
            ];
        }

        // Simulate successful payment
        return [
            'success' => true,
            'message' => 'Payment processed successfully',
            'transaction_id' => 'txn_' . strtoupper(uniqid()),
            'method' => $method,
            'amount' => $amount
        ];
    }

    /**
     * Get all orders for admin
     */
    public function adminIndex(Request $request)
    {
        Log::info('Admin orders request received');
        
        $user = $request->user();
        Log::info('Admin orders user check', ['user' => $user ? $user->toArray() : null]);
        
        if (!$user) {
            Log::info('Admin orders: No user found');
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        if (!$user->isAdmin()) {
            Log::info('Admin orders: User is not admin', ['role' => $user->role]);
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        Log::info('Admin orders: Fetching orders');
        $orders = Order::with(['orderItems.product.shop', 'orderItems.product.category', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        Log::info('Admin orders: Found orders', ['count' => $orders->count()]);
        return response()->json($orders);
    }

    /**
     * Generate PDF invoice for an order
     */
    public function generateInvoice(Order $order, Request $request)
    {
        $user = $request->user();

        // Check if user can access this order
        if ($order->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->payment_status !== 'completed') {
            return response()->json(['message' => 'Invoice can only be generated for paid orders'], 422);
        }

        $order->load(['orderItems.product.shop', 'user']);

        try {
            $pdf = Pdf::loadView('invoices.order', compact('order'));
            
            return $pdf->download("invoice-{$order->order_number}.pdf");
        } catch (\Exception $e) {
            Log::error('PDF generation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to generate invoice'], 500);
        }
    }

    /**
     * Approve an order (Admin only)
     */
    public function approve(Order $order, Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Only pending orders can be approved'], 422);
        }

        if ($order->payment_status !== 'completed') {
            return response()->json(['message' => 'Order must be paid before approval'], 422);
        }

        $order->update([
            'status' => 'confirmed',
            'admin_notes' => $request->admin_notes ?? null
        ]);

        return response()->json([
            'message' => 'Order approved successfully',
            'order' => $order->load(['orderItems.product.shop', 'user'])
        ]);
    }

    /**
     * Reject an order (Admin only)
     */
    public function reject(Order $order, Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => 'Cannot reject this order'], 422);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            // Restore product quantities
            foreach ($order->orderItems as $item) {
                $item->product->increment('quantity', $item->quantity);
            }

            // Update order status
            $order->update([
                'status' => 'rejected',
                'admin_notes' => $request->rejection_reason
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order rejected successfully',
                'order' => $order->load(['orderItems.product.shop', 'user'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Order rejection failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to reject order'
            ], 500);
        }
    }

    /**
     * Process payment for an order
     */
    public function processPayment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|in:credit_card,debit_card,paypal',
            'payment_details' => 'required|array',
        ]);

        $order = Order::findOrFail($request->order_id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->payment_status === 'completed') {
            return response()->json(['message' => 'Order is already paid'], 422);
        }

        try {
            // Mock payment processing
            $paymentResult = $this->mockPaymentProcess($request->payment_method, $request->payment_details, $order->total_amount);
            
            if (!$paymentResult['success']) {
                return response()->json([
                    'message' => 'Payment failed',
                    'error' => $paymentResult['message']
                ], 422);
            }

            // Update order payment status
            $order->update([
                'payment_status' => 'completed',
                'payment_method' => $request->payment_method,
            ]);

            return response()->json([
                'message' => 'Payment processed successfully',
                'order' => $order,
                'transaction_id' => $paymentResult['transaction_id']
            ]);

        } catch (\Exception $e) {
            Log::error('Payment processing failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Payment processing failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mock payment processing
     */
    private function mockPaymentProcess($method, $details, $amount)
    {
        Log::info('Processing payment', [
            'method' => $method,
            'amount' => $amount,
            'details' => array_keys($details) // Only log keys for security
        ]);

        // Simulate payment validation
        if ($method === 'credit_card' || $method === 'debit_card') {
            if (empty($details['card_number']) || empty($details['expiry']) || empty($details['cvv'])) {
                return ['success' => false, 'message' => 'Invalid card details'];
            }
            
            // Basic card number validation
            if (strlen(str_replace(' ', '', $details['card_number'])) < 13) {
                return ['success' => false, 'message' => 'Invalid card number'];
            }
        } elseif ($method === 'paypal') {
            if (empty($details['email'])) {
                return ['success' => false, 'message' => 'PayPal email is required'];
            }
            if (!filter_var($details['email'], FILTER_VALIDATE_EMAIL)) {
                return ['success' => false, 'message' => 'Invalid PayPal email'];
            }
        }

        // Simulate random payment failures (5% chance)
        if (rand(1, 100) <= 5) {
            return ['success' => false, 'message' => 'Payment declined by processor'];
        }

        return [
            'success' => true, 
            'transaction_id' => 'TXN_' . strtoupper(uniqid()),
            'message' => 'Payment processed successfully'
        ];
    }
}
