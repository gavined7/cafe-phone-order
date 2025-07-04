import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard } from 'lucide-react';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CheckoutModal = ({ open, onOpenChange, onSuccess }: CheckoutModalProps) => {
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          phone: user.phone,
          customer_name: customerName,
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Success
      toast({
        title: "Order Placed Successfully!",
        description: `Your order for ${formatPrice(total)} has been received. We'll prepare it shortly!`,
      });

      clearCart();
      onSuccess();
      
      // Reset form
      setCustomerName('');
      setNotes('');
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-coffee-dark flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Checkout</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Summary */}
          <div className="space-y-2">
            <h3 className="font-medium text-coffee-dark">Order Summary</h3>
            <div className="bg-muted p-3 rounded-lg space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Your Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              required
              className="border-coffee-light/30 focus:border-coffee-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or dietary requirements..."
              className="border-coffee-light/30 focus:border-coffee-medium"
              rows={3}
            />
          </div>

          {/* Contact Info Display */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Contact:</strong> {user?.phone}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              We'll notify you when your order is ready for pickup
            </p>
          </div>

          <Button 
            type="submit" 
            variant="coffee" 
            className="w-full"
            disabled={loading || !customerName.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order - ${formatPrice(total)}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};