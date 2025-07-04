import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, LogIn, LogOut } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Cart } from './Cart';
import { AuthModal } from './AuthModal';
import logoImage from '@/assets/login-cafe-logo.png';

export const Header = () => {
  const { items } = useCart();
  const { user, signOut } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      setShowAuth(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-b from-white/70 to-cream/60 shadow-warm border-b border-coffee-light/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="Login Cafe" 
              className="h-10 w-10 rounded-full shadow-warm"
            />
            <h1 className="text-xl font-bold text-coffee-dark">Login Cafe</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Button
              variant="cream"
              size="icon"
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-coffee-dark text-white text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Auth */}
            <Button
              variant="coffee"
              onClick={handleAuthAction}
              className="flex items-center space-x-2"
            >
              {user ? (
                <>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <Cart open={showCart} onOpenChange={setShowCart} />
      <AuthModal open={showAuth} onOpenChange={setShowAuth} />
    </>
  );
};