'use client';

import { DashboardLayout } from '@/app/dashboard-layout';
import { useAppState } from '@/lib/state';
import {
  checkDishStock,
  getOverPurchasedIngredients,
  getScrapSuggestions,
} from '@/lib/rules/macroFlex';
import { Card } from '@/components/ui/card';
import { useMemo, useState } from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';

export default function InventoryPage() {
  const { ingredients, menuItems, updateIngredientStock } = useAppState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const overPurchased = useMemo(
    () => getOverPurchasedIngredients(ingredients),
    [ingredients]
  );
  const scrapSuggestions = useMemo(
    () => getScrapSuggestions(ingredients, menuItems),
    [ingredients, menuItems]
  );
  const dishChecks = useMemo(
    () =>
      menuItems.map((dish) => ({
        dish,
        check: checkDishStock(dish, ingredients),
      })),
    [menuItems, ingredients]
  );

  const handleEdit = (id: string, current: number) => {
    setEditingId(id);
    setEditValue(current.toString());
  };

  const handleSave = (id: string) => {
    updateIngredientStock(id, parseInt(editValue, 10) || 0);
    setEditingId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-surface-foreground">
            Inventory (MacroFlex)
          </h1>
          <p className="text-surface-muted-foreground mt-2">
            Stock levels, per-serving availability, over-purchasing, and tira-tira suggestions.
          </p>
        </div>

        {overPurchased.length > 0 && (
          <Card className="p-6 border-yellow-300 bg-yellow-50/80">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-700" />
              <h2 className="font-heading font-bold text-yellow-900">Over-purchased</h2>
            </div>
            <ul className="text-sm text-yellow-900 space-y-1">
              {overPurchased.map((ing) => (
                <li key={ing.id}>
                  {ing.name}: {ing.currentStock}
                  {ing.unit} exceeds max storage of {ing.maxCapacity}
                  {ing.unit}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {scrapSuggestions.length > 0 && (
          <Card className="p-6 border-blue-200 bg-blue-50/80">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-700" />
              <h2 className="font-heading font-bold text-blue-900">
                Tira-tira suggestions
              </h2>
            </div>
            <ul className="text-sm text-blue-900 space-y-2">
              {scrapSuggestions.map((s) => (
                <li key={`${s.dishId}-${s.leftoverIngredientId}`}>
                  Leftover {s.leftoverIngredientName} ({s.leftoverQty}
                  {s.unit}) — can still make <strong>{s.dishName}</strong>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-6 font-semibold text-card-foreground">Ingredient</th>
                  <th className="text-left p-6 font-semibold text-card-foreground">Current Stock</th>
                  <th className="text-left p-6 font-semibold text-card-foreground">Capacity</th>
                  <th className="text-left p-6 font-semibold text-card-foreground">Usage</th>
                  <th className="text-left p-6 font-semibold text-card-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => {
                  const percentage =
                    (ingredient.currentStock / ingredient.maxCapacity) * 100;
                  const isOver = ingredient.currentStock > ingredient.maxCapacity;
                  const statusColor = isOver
                    ? 'bg-orange-100 text-orange-800'
                    : percentage < 25
                      ? 'bg-red-100 text-red-800'
                      : percentage < 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800';
                  const statusLabel = isOver
                    ? 'Over-bought'
                    : percentage < 25
                      ? 'Low'
                      : percentage < 50
                        ? 'Medium'
                        : 'Good';

                  return (
                    <tr
                      key={ingredient.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-6 font-medium text-card-foreground">
                        {ingredient.name}
                      </td>
                      <td className="p-6 text-card-foreground">
                        {editingId === ingredient.id ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 px-2 py-1 border border-border rounded"
                            />
                            <button
                              onClick={() => handleSave(ingredient.id)}
                              className="px-2 py-1 bg-primary text-white rounded text-sm"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleEdit(ingredient.id, ingredient.currentStock)
                            }
                            className="hover:text-primary cursor-pointer"
                          >
                            {ingredient.currentStock}
                            {ingredient.unit}
                          </button>
                        )}
                      </td>
                      <td className="p-6 text-muted-foreground">
                        {ingredient.maxCapacity}
                        {ingredient.unit}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${isOver ? 'bg-orange-500' : 'bg-primary'}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading text-lg font-bold text-card-foreground mb-4">
            Dish availability (per serving)
          </h2>
          <div className="space-y-3">
            {dishChecks.map(({ dish, check }) => (
              <div
                key={dish.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/50 rounded-lg"
              >
                <span className="font-medium text-card-foreground">{dish.name}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      check.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : check.status === 'limited'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {check.status}
                  </span>
                  {check.shortfalls.length > 0 && (
                    <span className="text-xs text-red-700">
                      Short:{' '}
                      {check.shortfalls
                        .map(
                          (s) =>
                            `${s.name} (need ${s.required}${s.unit}, have ${s.available}${s.unit})`
                        )
                        .join('; ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
