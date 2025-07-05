import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Package, Tags, ShoppingCart, Users, TrendingUp, DollarSign } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const AdminDashboard = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [products, categories, orders, users] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_amount, status'),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      const totalRevenue = orders.data?.reduce((sum, order) => 
        sum + (order.status === 'completed' ? Number(order.total_amount) : 0), 0
      ) || 0;

      const pendingOrders = orders.data?.filter(order => order.status === 'pending').length || 0;

      return {
        totalProducts: products.count || 0,
        totalCategories: categories.count || 0,
        totalOrders: orders.data?.length || 0,
        totalUsers: users.count || 0,
        pendingOrders,
        totalRevenue,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Recent orders
  const { data: recentOrders } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          phone,
          total_amount,
          status,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-coffee-dark">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-coffee-dark">Dashboard</h1>
          <Badge variant="secondary" className="bg-coffee-light text-coffee-dark">
            Live Data
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-coffee-light/20 shadow-warm hover:shadow-coffee transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-coffee-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-coffee-medium" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-coffee-dark">{stats?.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="border-coffee-light/20 shadow-warm hover:shadow-coffee transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-coffee-medium">
                Categories
              </CardTitle>
              <Tags className="h-4 w-4 text-coffee-medium" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-coffee-dark">{stats?.totalCategories}</div>
            </CardContent>
          </Card>

          <Card className="border-coffee-light/20 shadow-warm hover:shadow-coffee transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-coffee-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-coffee-medium" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-coffee-dark">{stats?.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card className="border-coffee-light/20 shadow-warm hover:shadow-coffee transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-coffee-medium">
                Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-coffee-medium" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-coffee-dark">
                {formatPrice(stats?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalUsers} customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-coffee-light/20 shadow-warm">
          <CardHeader>
            <CardTitle className="text-coffee-dark flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 bg-cream/50 rounded-lg border border-coffee-light/10"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-coffee-dark">
                            {order.customer_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.phone}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-coffee-dark">
                        {formatPrice(Number(order.total_amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent orders found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;