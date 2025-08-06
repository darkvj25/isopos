import { useState } from 'react';
import { usePosData } from '@/hooks/usePosData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Product } from '@/types/pos';
import { formatPeso, isLowStock, isOutOfStock } from '@/utils/pos';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = [
  'Beverages',
  'Snacks',
  'Instant Noodles',
  'Seasonings',
  'Personal Care',
  'Household',
  'Canned Goods',
  'Dairy',
  'Frozen',
  'Others'
];

export const ProductManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct, searchProducts } = usePosData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    barcode: '',
    description: ''
  });

  const filteredProducts = searchQuery ? searchProducts(searchQuery) : products;

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      barcode: '',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated successfully`,
      });
      setEditingProduct(null);
    } else {
      addProduct(formData);
      toast({
        title: "Product Added",
        description: `${formData.name} has been added successfully`,
      });
      setShowAddDialog(false);
    }
    
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost || 0,
      stock: product.stock,
      barcode: product.barcode || '',
      description: product.description || ''
    });
    setEditingProduct(product);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
      toast({
        title: "Product Deleted",
        description: `${product.name} has been deleted`,
      });
    }
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
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Product Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Manage your store inventory and product catalog
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="pos-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Selling Price (₱) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost Price (₱)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="barcode">Barcode (Optional)</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  placeholder="Product barcode"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Product description"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 pos-button-primary">
                  Add Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="pos-card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              placeholder="Search products by name, category, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="pos-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products ({filteredProducts.length})
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
                    <TableCell>{product.stock}</TableCell>
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
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product)}
                          className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">Selling Price (₱) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-cost">Cost Price (₱)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-barcode">Barcode (Optional)</Label>
              <Input
                id="edit-barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                placeholder="Product barcode"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Product description"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 pos-button-primary">
                Update Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};