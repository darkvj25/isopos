import { useState, useEffect } from 'react';
import { usePosData } from '@/hooks/usePosData';
import { usePosAuth } from '@/hooks/usePosAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator,
  CreditCard,
  Smartphone,
  DollarSign,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { CartItem, Product, PaymentMethod } from '@/types/pos';
import { formatPeso, calculateSubtotal, calculateDiscount, calculateTotal, calculateVAT, generateReceiptText } from '@/utils/pos';
import { toast } from '@/hooks/use-toast';

export const PosTerminal = () => {
  const { products, searchProducts, recordSale, settings } = usePosData();
  const { currentUser } = usePosAuth();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Discount state
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      setSearchResults(searchProducts(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchProducts]);

  const addToCart = (product: Product, qty: number = 1) => {
    if (product.stock < qty) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} units available`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + qty;
      if (newQuantity > product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} units available`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * product.price }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity: qty,
        subtotal: qty * product.price,
      };
      setCart([...cart, newItem]);
    }

    setSearchQuery('');
    setSelectedProduct(null);
    setQuantity(1);
    
    toast({
      title: "Added to Cart",
      description: `${product.name} x${qty}`,
    });
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product || newQuantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product?.stock || 0} units available`,
        variant: "destructive",
      });
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.price }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setAmountReceived(0);
    setShowPayment(false);
  };

  // Calculations
  const subtotal = calculateSubtotal(cart);
  const discountAmount = calculateDiscount(subtotal, discount, discountType);
  const total = calculateTotal(subtotal, discountAmount);
  const vatAmount = calculateVAT(total);
  const change = Math.max(0, amountReceived - total);

  const processSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing sale",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'cash' && amountReceived < total) {
      toast({
        title: "Insufficient Payment",
        description: "Please enter the correct amount received",
        variant: "destructive",
      });
      return;
    }

    const sale = recordSale({
      items: cart,
      subtotal,
      discount: discountAmount,
      discountType,
      vatAmount,
      total,
      paymentMethod,
      amountReceived: paymentMethod === 'cash' ? amountReceived : total,
      change: paymentMethod === 'cash' ? change : 0,
      cashierId: currentUser?.id || '',
      cashierName: currentUser?.fullName || '',
    });

    // Print receipt
    const receiptText = generateReceiptText(sale, settings);
    printReceipt(receiptText);

    toast({
      title: "Sale Completed",
      description: `Receipt #${sale.receiptNumber}`,
    });

    clearCart();
  };

  const printReceipt = (receiptText: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; margin: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${receiptText}</pre>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Product Search & Selection */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="pos-card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Product Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search products or scan barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => selectedProduct && addToCart(selectedProduct, quantity)}
                  disabled={!selectedProduct}
                  className="pos-button-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add ({quantity})
                </Button>
              </div>

              {selectedProduct && (
                <div className="flex items-center gap-4 p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{selectedProduct.name}</h4>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatPeso(selectedProduct.price)} • Stock: {selectedProduct.stock}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={selectedProduct.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                          : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {product.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPeso(product.price)}</p>
                          <Badge 
                            variant={product.stock <= 10 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {product.stock} in stock
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-6">
        <Card className="pos-card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium truncate">{item.product.name}</h5>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {formatPeso(item.product.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.productId)}
                            className="w-6 h-6 p-0 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatPeso(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Discount */}
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium">Discount</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="flex-1"
                      />
                      <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="fixed">₱</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatPeso(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-[hsl(var(--success))]">
                        <span>Discount:</span>
                        <span>-{formatPeso(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>VAT (12%):</span>
                      <span>{formatPeso(vatAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="pos-total">{formatPeso(total)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={clearCart} variant="outline" className="flex-1">
                      Clear
                    </Button>
                    <Button 
                      onClick={() => setShowPayment(true)} 
                      className="flex-1 pos-button-primary"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Checkout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        {showPayment && cart.length > 0 && (
          <Card className="pos-card-shadow border-[hsl(var(--primary))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Payment Method</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cash')}
                    className="pos-button-primary"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cash
                  </Button>
                  <Button
                    variant={paymentMethod === 'gcash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('gcash')}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    GCash
                  </Button>
                  <Button
                    variant={paymentMethod === 'maya' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('maya')}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Maya
                  </Button>
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Card
                  </Button>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <Label className="text-sm font-medium">Amount Received</Label>
                  <Input
                    type="number"
                    min={total}
                    step="0.01"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                    className="mt-2"
                    placeholder="0.00"
                  />
                  {amountReceived >= total && (
                    <p className="text-sm text-[hsl(var(--success))] mt-2">
                      Change: {formatPeso(change)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => setShowPayment(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={processSale} 
                  className="flex-1 pos-button-success"
                  disabled={paymentMethod === 'cash' && amountReceived < total}
                >
                  <ReceiptIcon className="w-4 h-4 mr-2" />
                  Complete Sale
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};