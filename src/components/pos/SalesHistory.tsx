import { useState, useMemo } from 'react';
import { usePosData } from '@/hooks/usePosData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Receipt, 
  Search, 
  Eye, 
  Printer, 
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react';
import { Sale } from '@/types/pos';
import { formatPeso, formatPhilippineDateTime, generateReceiptText } from '@/utils/pos';

export const SalesHistory = () => {
  const { sales, settings } = usePosData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  const filteredSales = useMemo(() => {
    let filtered = [...sales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.receiptNumber.toLowerCase().includes(query) ||
        sale.cashierName.toLowerCase().includes(query) ||
        sale.customer?.toLowerCase().includes(query) ||
        sale.items.some(item => item.product.name.toLowerCase().includes(query))
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        switch (dateFilter) {
          case 'today':
            return saleDate.toDateString() === now.toDateString();
          case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            return saleDate.toDateString() === yesterday.toDateString();
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return saleDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return saleDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(sale => sale.paymentMethod === paymentFilter);
    }

    return filtered;
  }, [sales, searchQuery, dateFilter, paymentFilter]);

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  const viewReceipt = (sale: Sale) => {
    setSelectedSale(sale);
    setShowReceiptDialog(true);
  };

  const printReceipt = (sale: Sale) => {
    const receiptText = generateReceiptText(sale, settings);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt #${sale.receiptNumber}</title>
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

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]';
      case 'gcash': return 'bg-blue-100 text-blue-700';
      case 'maya': return 'bg-green-100 text-green-700';
      case 'card': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Sales History</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            View and manage transaction records
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Sales</p>
          <p className="text-2xl font-bold pos-total">{formatPeso(totalSales)}</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="pos-card-shadow">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Search receipts, cashier, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="maya">Maya</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <Filter className="w-4 h-4" />
              {filteredSales.length} of {sales.length} transactions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="pos-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{sale.receiptNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatPhilippineDateTime(new Date(sale.timestamp))}
                    </div>
                  </TableCell>
                  <TableCell>{sale.cashierName}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{sale.items.length} item(s)</span>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {sale.items.slice(0, 2).map(item => item.product.name).join(', ')}
                        {sale.items.length > 2 && '...'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPaymentMethodColor(sale.paymentMethod)} border-0`}>
                      {sale.paymentMethod.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">{formatPeso(sale.total)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewReceipt(sale)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => printReceipt(sale)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt View Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt #{selectedSale?.receiptNumber}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold">{settings.businessName}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{settings.address}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">TIN: {settings.tin}</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span className="font-mono">{selectedSale.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formatPhilippineDateTime(new Date(selectedSale.timestamp))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{selectedSale.cashierName}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <div>{item.product.name}</div>
                        <div className="text-[hsl(var(--muted-foreground))]">
                          {item.quantity} x {formatPeso(item.product.price)}
                        </div>
                      </div>
                      <div className="text-right font-medium">
                        {formatPeso(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPeso(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-[hsl(var(--success))]">
                    <span>Discount:</span>
                    <span>-{formatPeso(selectedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT (12%):</span>
                  <span>{formatPeso(selectedSale.vatAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatPeso(selectedSale.total)}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="capitalize">{selectedSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Received:</span>
                  <span>{formatPeso(selectedSale.amountReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>{formatPeso(selectedSale.change)}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowReceiptDialog(false)} className="flex-1">
                  Close
                </Button>
                <Button onClick={() => printReceipt(selectedSale)} className="flex-1 pos-button-primary">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};