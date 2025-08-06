import { usePosData } from '@/hooks/usePosData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Receipt, 
  Package, 
  AlertTriangle,
  DollarSign,
  Users,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import { formatPeso, formatPhilippineDate, getTopSellingProducts } from '@/utils/pos';

export const Dashboard = () => {
  const { 
    getTodaySales, 
    getDailySalesTotal, 
    getLowStockProducts, 
    getOutOfStockProducts,
    sales,
    products 
  } = usePosData();

  const todaySales = getTodaySales();
  const todayTotal = getDailySalesTotal(new Date());
  const lowStockItems = getLowStockProducts();
  const outOfStockItems = getOutOfStockProducts();
  const topProducts = getTopSellingProducts(sales, 5);

  const stats = [
    {
      title: "Today's Sales",
      value: formatPeso(todayTotal),
      icon: DollarSign,
      color: "text-[hsl(var(--success))]",
      bg: "bg-[hsl(var(--success))]/10",
    },
    {
      title: "Transactions",
      value: todaySales.length.toString(),
      icon: Receipt,
      color: "text-[hsl(var(--primary))]",
      bg: "bg-[hsl(var(--primary))]/10",
    },
    {
      title: "Products",
      value: products.length.toString(),
      icon: Package,
      color: "text-[hsl(var(--accent))]",
      bg: "bg-[hsl(var(--accent))]/10",
    },
    {
      title: "Low Stock",
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      color: "text-[hsl(var(--warning))]",
      bg: "bg-[hsl(var(--warning))]/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Dashboard</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            {formatPhilippineDate(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Calendar className="w-4 h-4" />
          <span>Live Data</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="pos-card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="pos-card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySales.slice(-5).reverse().map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <div>
                    <p className="font-medium">#{sale.receiptNumber}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {sale.items.length} item(s) • {sale.cashierName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold pos-total">{formatPeso(sale.total)}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] capitalize">
                      {sale.paymentMethod}
                    </p>
                  </div>
                </div>
              ))}
              {todaySales.length === 0 && (
                <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="pos-card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div key={item.product} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[hsl(var(--primary))] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.product}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {item.quantity} sold
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">{formatPeso(item.revenue)}</p>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sales data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <Card className="pos-card-shadow border-[hsl(var(--warning))]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--warning))]">
              <AlertTriangle className="w-5 h-5" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {outOfStockItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-[hsl(var(--destructive))] mb-3">Out of Stock</h4>
                  <div className="space-y-2">
                    {outOfStockItems.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-[hsl(var(--destructive))]/10 rounded">
                        <span className="text-sm">{product.name}</span>
                        <Badge className="out-of-stock">0 left</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {lowStockItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-[hsl(var(--warning))] mb-3">Low Stock</h4>
                  <div className="space-y-2">
                    {lowStockItems.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-[hsl(var(--warning))]/10 rounded">
                        <span className="text-sm">{product.name}</span>
                        <Badge className="low-stock">{product.stock} left</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};