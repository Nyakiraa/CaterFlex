'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/app/dashboard-layout';
import { useAppState } from '@/lib/state';
import type { MenuItem } from '@/lib/types';
import { MenuItemForm } from '@/components/owner/MenuItemForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

const CATEGORIES = ['appetizers', 'mains', 'sides', 'desserts', 'beverages'] as const;

export default function MenuPage() {
  const { menuItems, deleteMenuItem } = useAppState();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const openAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (item: MenuItem) => {
    const isReferenced = useAppState.getState().bookings.some((booking) =>
      booking.selectedMenuItemIds.includes(item.id)
    );
    if (isReferenced) {
      window.alert('This menu item is referenced by a booking and cannot be permanently deleted.');
      return;
    }
    if (window.confirm(`Delete "${item.name}" from the menu?`)) {
      deleteMenuItem(item.id);
    }
  };

  const categorized = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = menuItems.filter((m) => m.category === category);
      return acc;
    },
    {} as Record<(typeof CATEGORIES)[number], MenuItem[]>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-surface-foreground">
              Menu Management
            </h1>
            <p className="text-surface-muted-foreground mt-2">
              Edit your catering menu items
            </p>
          </div>
          <Button
            onClick={openAdd}
            className="bg-primary text-white hover:bg-brand"
          >
            + Add Item
          </Button>
        </div>

        {menuItems.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No menu items yet.</p>
            <Button onClick={openAdd} className="bg-primary text-white hover:bg-brand">
              Add your first item
            </Button>
          </Card>
        )}

        {CATEGORIES.map((category) => {
          const items = categorized[category];
          if (items.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="font-heading text-xl font-bold text-surface-foreground mb-4 capitalize">
                {category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {items.map((item) => (
                  <Card key={item.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-card-foreground text-lg">
                        {item.name}
                      </h3>
                      <span className="text-lg font-bold text-primary">
                        ${item.price}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded mb-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                        <p className="font-semibold text-card-foreground">
                          {item.macros.carbs}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Protein</p>
                        <p className="font-semibold text-card-foreground">
                          {item.macros.protein}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fat</p>
                        <p className="font-semibold text-card-foreground">
                          {item.macros.fat}g
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      Prep: {item.prepTimeDays} day{item.prepTimeDays === 1 ? '' : 's'} ·{' '}
                      <span
                        className={
                          item.inventoryStatus === 'available'
                            ? 'text-green-700'
                            : item.inventoryStatus === 'limited'
                              ? 'text-yellow-700'
                              : 'text-red-700'
                        }
                      >
                        {item.inventoryStatus}
                      </span>
                    </p>

                    {item.allergyTags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {item.allergyTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <MenuItemForm open={formOpen} item={editingItem} onClose={closeForm} />
    </DashboardLayout>
  );
}
