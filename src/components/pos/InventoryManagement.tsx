import { useState } from 'react';
import { usePosData } from '@/hooks/usePosData';
import { usePosAuth } from '@/hooks/usePosAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Warehouse, 
  Plus, 
  Minus, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Package
} from 'lucide-react';
import { Product } from '@/types/pos';
import { formatPeso, isLowStock, isOutOfStock } from '@/utils/pos';
import { toast } from '@/hooks/use-toast';

export const InventoryManagement = () => {
  const { products, adjustStock, searchProducts, getLowStockProducts, getOutOfStockProducts } = usePosData();
  const { currentUser } = usePosAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  const filteredProducts = searchQuery ? searchProducts(searchQuery) : products;
  const lowStockItems = getLowStockProducts();
  const outOfStockItems = getOutOfStockProducts();

  const handleAdjustStock = () => {
    if (!selectedProduct || !currentUser) {
      return;
    }

    if (quantity <= 0 || !reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter valid quantity and reason",
        variant: "destructive",
      });
      return;
    }

    adjustStock(selectedProduct.id, quantity, adjustmentType, reason, currentUser.id);
    
    toast({
      title: "Stock Adjusted",
      description: `${selectedProduct.name} stock ${adjustmentType === 'add' ? 'increased' : 'decreased'} by ${quantity}`,
    });

    setShowAdjustDialog(false);
    setSelectedProduct(null);
    setQuantity(1);
    setReason('');
  };

  const openAdjustDialog = (product: Product, type: 'add' | 'remove') => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setShowAdjustDialog(true);
  };

  const getStockStatus = (product: Product) => {
    if (isOutOfStock(product)) {
      return { status: 'Out of Stock', color: 'destructive', icon: AlertTriangle };
    }
    if (isLowStock(product)) {
      return { status: 'Low Stock', color: 'warning' as const, icon: AlertTriangle };
    }
    return { status: 'In Stock', color: 'secondary' as const, icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Inventory Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Monitor stock levels and adjust inventory
          </p>
        </div>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {outOfStockItems.length > 0 && (
            <Card className="pos-card-shadow border-[hsl(var(--destructive))]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[hsl(var(--destructive))]">
                  <AlertTriangle className="w-5 h-5" />
                  Out of Stock ({outOfStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {outOfStockItems.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-[hsl(var(--destructive))]/10 rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{product.category}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openAdjustDialog(product, 'add')}
                        className="pos-button-primary"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Restock
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockItems.length > 0 && (
            <Card className="pos-card-shadow border-[hsl(var(--warning))]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[hsl(var(--warning))]">
                  <AlertTriangle className="w-5 h-5" />
                  Low Stock ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {lowStockItems.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-[hsl(var(--warning))]/10 rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {product.category} • {product.stock} left
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openAdjustDialog(product, 'add')}
                        className="pos-button-warning"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Stock
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search */}
      <Card className="pos-card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              placeholder="Search products to adjust inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="pos-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="w-5 h-5" />
            Current Inventory ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.barcode && (
                          <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {product.barcode}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatPeso(product.price)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{product.stock}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={stockStatus.color === 'warning' ? 'secondary' : stockStatus.color === 'destructive' ? 'destructive' : 'secondary'}
                        className={stockStatus.color === 'warning' ? 'low-stock' : stockStatus.color === 'destructive' ? 'out-of-stock' : ''}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {stockStatus.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAdjustDialog(product, 'add')}
                          className="text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAdjustDialog(product, 'remove')}
                          className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                          disabled={product.stock === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}: {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Stock</p>
              <p className="text-2xl font-bold">{selectedProduct?.stock || 0}</p>
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={adjustmentType === 'remove' ? selectedProduct?.stock : undefined}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentType === 'add' ? (
                    <>
                      <SelectItem value="Restock">Restock</SelectItem>
                      <SelectItem value="New delivery">New delivery</SelectItem>
                      <SelectItem value="Return from customer">Return from customer</SelectItem>
                      <SelectItem value="Inventory correction">Inventory correction</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Stolen">Stolen</SelectItem>
                      <SelectItem value="Return to supplier">Return to supplier</SelectItem>
                      <SelectItem value="Inventory correction">Inventory correction</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAdjustDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleAdjustStock} 
                className={`flex-1 ${adjustmentType === 'add' ? 'pos-button-success' : 'pos-button-destructive'}`}
                disabled={!reason || quantity <= 0}
              >
                {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};