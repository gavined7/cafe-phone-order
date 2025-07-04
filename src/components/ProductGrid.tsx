import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url
    });
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {products.map((product) => (
        <Card 
          key={product.id}
          className="group border-coffee-light/20 shadow-warm hover:shadow-coffee transition-all duration-300 hover:-translate-y-1"
        >
          <CardHeader className="pb-3">
            {product.image_url && (
              <div className="aspect-video rounded-lg overflow-hidden mb-3">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg text-coffee-dark">{product.name}</CardTitle>
              <Badge variant="secondary" className="bg-gradient-warm text-coffee-dark">
                {formatPrice(product.price)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pb-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>
          </CardContent>
          
          <CardFooter>
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={!product.is_available}
              variant="coffee"
              className="w-full"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.is_available ? 'Add to Cart' : 'Unavailable'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
