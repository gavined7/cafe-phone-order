import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ImageCarousel } from '@/components/ImageCarousel';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
}

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order');

        if (categoriesError) throw categoriesError;

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('display_order');

        if (productsError) throw productsError;

        setCategories(categoriesData || []);
        setProducts(productsData || []);
        setFilteredProducts(productsData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load menu items. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter(product => product.category_id === selectedCategory));
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-coffee-medium" />
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Carousel */}
        <ImageCarousel />
        
        {/* Category Filter */}
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        
        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-coffee-dark">
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory)?.name || 'Menu'
                : 'Our Menu'
              }
            </h2>
            <p className="text-muted-foreground">
              {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} available
            </p>
          </div>
          
          <ProductGrid products={filteredProducts} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
