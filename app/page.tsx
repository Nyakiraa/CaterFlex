'use client';

import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/state';
import { Button } from '@/components/ui/button';
import { ChefHat, UtensilsCrossed } from 'lucide-react';


export default function Page() {
  const router = useRouter();
  const { setCurrentRole } = useAppState();

  const handleOwnerClick = () => {
    setCurrentRole('owner');
    router.push('/login?role=owner');
  };

  const handleCustomerClick = () => {
    setCurrentRole('customer');
    router.push('/login?role=customer');
  };

  return (
    <main className="h-screen relative overflow-hidden flex flex-col items-center p-4" style={{backgroundImage: 'url(/background.webp)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none -z-10" />

      {/* Logo pinned to the top, enlarged */}
      <img
        src="/logo.png"
        alt="CaterFlex Logo"
        className="w-56 h-56 object-contain mt-1 relative z-10"
      />

      <div className="max-w-2xl w-full flex-1 flex flex-col justify-center relative z-10 -mt-10">
        <div className="text-center mb-4">
          <p className="text-lg text-white/90 font-medium drop-shadow-sm">
            Professional Catering Management System
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Owner Card */}
          <div className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Owner</h2>
                <p className="text-xs text-muted-foreground">Manage your business</p>
              </div>
            </div>

            <p className="text-card-foreground text-sm mb-4 leading-snug">
              Access your dashboard to manage bookings, menus, inventory, and payments all in one place.
            </p>

            <ul className="space-y-1.5 mb-5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Booking management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Menu & pricing control
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Inventory tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Payment records
              </li>
            </ul>

            <Button
              onClick={handleOwnerClick}
              className="w-full bg-primary text-white font-medium mt-auto hover:bg-brand"
            >
              Continue as Owner
            </Button>
          </div>

          {/* Customer Card */}
          <div className="bg-card rounded-xl p-5 border border-border hover:border-secondary/50 transition-all hover:shadow-lg flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-secondary/10 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Customer</h2>
                <p className="text-xs text-muted-foreground">Book catering services</p>
              </div>
            </div>

            <p className="text-card-foreground text-sm mb-4 leading-snug">
              Browse our menu, check dietary options, and request catering for your event.
            </p>

            <ul className="space-y-1.5 mb-5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Event booking form
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Browse menu items
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Dietary preferences
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Macro tracking
              </li>
            </ul>

            <Button
              onClick={handleCustomerClick}
              className="w-full bg-secondary text-white font-medium mt-auto hover:bg-brand"
            >
              Continue as Customer
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
