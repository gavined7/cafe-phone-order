import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';

interface CartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Cart = ({ open, onOpenChange }: CartProps) => {
  const { items, total, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCheckout = () => {
    if (!user) {
      // Could show auth modal here
      return;
    }
    setShowCheckout(true);
  };

  if (items.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-coffee-dark">Your Cart</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-coffee-dark">Your cart is empty</p>
            <p className="text-muted-foreground">Add some delicious items to get started!</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-coffee-dark">Your Cart</SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 bg-card p-3 rounded-lg border border-coffee-light/20">
                  <div className="flex-1">
                    <h4 className="font-medium text-coffee-dark">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <Badge variant="secondary" className="px-3">
                      {item.quantity}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="border-t border-coffee-light/20 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-coffee-dark">Total:</span>
              <span className="text-lg font-bold text-coffee-dark">{formatPrice(total)}</span>
            </div>
            
            <Button
              onClick={handleCheckout}
              disabled={!user}
              variant="coffee"
              className="w-full"
            >
              {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            </Button>
            
            {!user && (
              <p className="text-xs text-muted-foreground text-center">
                Please login with your phone number to place an order
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      <CheckoutModal 
        open={showCheckout} 
        onOpenChange={setShowCheckout}
        onSuccess={() => {
          setShowCheckout(false);
          onOpenChange(false);
        }}
      />
    </>
  );
};