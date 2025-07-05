import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { ImageCarousel } from '@/components/ImageCarousel';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, RefreshCw, Sparkles } from 'lucide-react';
interface Category {
  id: string;
  name: string;
  description: string;
}
interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_popular: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    toast
  } = useToast();

  // Fetch categories with React Query
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('categories').select('*').eq('is_active', true).order('display_order');
      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000,
    // 5 minutes
    retry: 2
  });

  // Fetch products with React Query
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('products').select('*').eq('is_available', true).order('display_order');
      if (error) throw error;
      return data as Product[];
    },
    staleTime: 5 * 60 * 1000,
    // 5 minutes
    retry: 2
  });

  // Handle errors
  useEffect(() => {
    if (categoriesError || productsError) {
      toast({
        title: "Error Loading Menu",
        description: "Failed to load menu items. Please try refreshing.",
        variant: "destructive"
      });
    }
  }, [categoriesError, productsError, toast]);

  // Memoized filtered products with search and category filtering
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category or show popular items
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    } else {
      filtered = filtered.filter(product => product.is_popular);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query));
    }
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Get section title
  const sectionTitle = useMemo(() => {
    if (searchQuery.trim()) {
      return `Search Results for "${searchQuery}"`;
    }
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      return category?.name || 'Menu';
    }
    return 'Popular Menu';
  }, [selectedCategory, searchQuery, categories]);

  // Handle refresh
  const handleRefresh = () => {
    refetchCategories();
    refetchProducts();
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };
  const isLoading = categoriesLoading || productsLoading;
  if (isLoading) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6 space-y-8">
          {/* Hero Carousel Skeleton */}
          <div className="h-64 md:h-80 lg:h-96 bg-muted rounded-lg animate-pulse" />
          
          {/* Category Filter Skeleton */}
          <div className="border border-coffee-light/20 rounded-lg p-4">
            <div className="h-6 bg-muted rounded mb-4 w-32 animate-pulse" />
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-muted rounded-full w-20 animate-pulse" />)}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-8 bg-muted rounded w-48 animate-pulse" />
              <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <div key={i} className="border border-coffee-light/20 rounded-lg p-2">
                  <div className="aspect-square bg-muted rounded-lg mb-2 animate-pulse" />
                  <div className="h-4 bg-muted rounded mb-2 animate-pulse" />
                  <div className="h-3 bg-muted rounded mb-2 w-3/4 animate-pulse" />
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </div>)}
            </div>
          </div>
        </div>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8 animate-fade-in">
        {/* Hero Carousel */}
        <div className="animate-scale-in">
          <ImageCarousel />
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto animate-fade-in" style={{
        animationDelay: '0.1s'
      }}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search coffee, pastries, or dishes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-10 border-coffee-light/30 focus:border-coffee-medium" />
          {searchQuery && <Button variant="ghost" size="sm" onClick={clearSearch} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-coffee-light/20">
              ×
            </Button>}
        </div>
        
        {/* Category Filter */}
        <div className="animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
        </div>
        
        {/* Products Grid */}
        <div className="space-y-6 animate-fade-in" style={{
        animationDelay: '0.3s'
      }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-coffee-dark flex items-center">
                {!searchQuery && !selectedCategory && <Sparkles className="h-6 w-6 mr-2 text-coffee-medium" />}
                {sectionTitle}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <p className="text-muted-foreground">
                {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} available
              </p>
              
            </div>
          </div>
          
          {filteredProducts.length === 0 ? <div className="text-center py-16">
              <div className="mb-4">
                <Search className="h-16 w-16 mx-auto text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-coffee-dark mb-2">
                {searchQuery ? 'No items found' : 'No items in this category'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? `No items match "${searchQuery}". Try a different search term.` : 'This category is currently empty. Check back soon!'}
              </p>
              {searchQuery && <Button onClick={clearSearch} variant="coffee">
                  Clear Search
                </Button>}
            </div> : <ProductGrid products={filteredProducts} />}
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default Index;