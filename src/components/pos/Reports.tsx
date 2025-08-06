import { usePosData } from '@/hooks/usePosData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import { formatPeso, getTopSellingProducts } from '@/utils/pos';

export const Reports = () => {
  const { sales, products } = usePosData();
  
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = sales.length;
  const totalProducts = products.length;
  const topProducts = getTopSellingProducts(sales, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Sales Reports</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Business analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="pos-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Revenue</p>
                <p className="text-2xl font-bold pos-total">{formatPeso(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-[hsl(var(--success))]" />
            </div>
          </CardContent>
        </Card>

        <Card className="pos-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[hsl(var(--primary))]" />
            </div>
          </CardContent>
        </Card>

        <Card className="pos-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-[hsl(var(--accent))]" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.quantity} sold</p>
                  </div>
                </div>
                <p className="font-bold">{formatPeso(item.revenue)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};