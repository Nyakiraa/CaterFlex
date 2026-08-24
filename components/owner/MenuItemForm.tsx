'use client';

import { useEffect, useState } from 'react';
import { useAppState } from '@/lib/state';
import type { AllergenType, MenuItem } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const CATEGORIES: MenuItem['category'][] = [
  'appetizers',
  'mains',
  'sides',
  'desserts',
  'beverages',
];

const ALLERGEN_OPTIONS: AllergenType[] = [
  'shellfish',
  'peanuts',
  'dairy',
  'gluten',
  'eggs',
  'soy',
  'tree_nuts',
  'other',
];

export type MenuItemFormValues = Omit<MenuItem, 'inventoryStatus'>;

interface MenuItemFormProps {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
}

function toFormValues(item: MenuItem | null): MenuItemFormValues {
  if (item) return { ...item };
  return {
    id: '',
    name: '',
    description: '',
    category: 'mains',
    price: 0,
    prepTimeDays: 1,
    macros: { carbs: 0, protein: 0, fat: 0 },
    allergyTags: [],
    requiredIngredients: [],
  };
}

export function MenuItemForm({ open, item, onClose }: MenuItemFormProps) {
  const { ingredients, addMenuItem, updateMenuItem } = useAppState();
  const [form, setForm] = useState<MenuItemFormValues>(() => toFormValues(item));
  const [ingredientId, setIngredientId] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');

  const isEditing = Boolean(item);

  useEffect(() => {
    if (open) {
      setForm(toFormValues(item));
      setIngredientId('');
      setIngredientQty('');
    }
  }, [open, item]);

  if (!open) return null;

  const toggleAllergen = (tag: AllergenType) => {
    setForm((prev) => ({
      ...prev,
      allergyTags: prev.allergyTags.includes(tag)
        ? prev.allergyTags.filter((t) => t !== tag)
        : [...prev.allergyTags, tag],
    }));
  };

  const addIngredient = () => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    const qty = parseFloat(ingredientQty);
    if (!ing || !qty || qty <= 0) return;
    if (form.requiredIngredients.some((r) => r.id === ing.id)) return;

    setForm((prev) => ({
      ...prev,
      requiredIngredients: [
        ...prev.requiredIngredients,
        { id: ing.id, name: ing.name, qty, unit: ing.unit },
      ],
    }));
    setIngredientId('');
    setIngredientQty('');
  };

  const removeIngredient = (id: string) => {
    setForm((prev) => ({
      ...prev,
      requiredIngredients: prev.requiredIngredients.filter((r) => r.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;

    const payload: MenuItem = {
      ...form,
      id: form.id || `menu-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      prepTimeDays: Math.max(0, Number(form.prepTimeDays) || 0),
      inventoryStatus: item?.inventoryStatus ?? 'available',
    };

    if (isEditing && item) {
      updateMenuItem(item.id, payload);
    } else {
      addMenuItem(payload);
    }
    onClose();
  };

  const inputClass =
    'mt-1 w-full px-3 py-2 border border-border rounded-lg bg-input text-card-foreground';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-card-foreground">
            {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Dish name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground">Description *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
                placeholder="Short description for customers"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as MenuItem['category'],
                  })
                }
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Price ($)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price || ''}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Prep time (days)</label>
              <input
                type="number"
                min={0}
                value={form.prepTimeDays}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prepTimeDays: parseInt(e.target.value, 10) || 0,
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-card-foreground mb-3">
              Macros (grams per serving)
            </p>
            <div className="grid grid-cols-3 gap-4">
              {(['carbs', 'protein', 'fat'] as const).map((key) => (
                <div key={key}>
                  <label className="text-sm text-muted-foreground capitalize">{key}</label>
                  <input
                    type="number"
                    min={0}
                    value={form.macros[key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        macros: {
                          ...form.macros,
                          [key]: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-card-foreground mb-3">Allergens</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ALLERGEN_OPTIONS.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.allergyTags.includes(tag)}
                    onChange={() => toggleAllergen(tag)}
                    className="rounded border-border"
                  />
                  <span className="capitalize">{tag.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-card-foreground mb-3">
              Required ingredients (per serving)
            </p>
            {form.requiredIngredients.length > 0 && (
              <ul className="space-y-2 mb-3">
                {form.requiredIngredients.map((req) => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                  >
                    <span className="text-card-foreground">
                      {req.name} — {req.qty}
                      {req.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(req.id)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-muted-foreground">Ingredient</label>
                <select
                  value={ingredientId}
                  onChange={(e) => setIngredientId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="text-xs text-muted-foreground">Qty</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={ingredientQty}
                  onChange={(e) => setIngredientQty(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                Add
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-border">
            <Button
              type="submit"
              className="flex-1 bg-primary text-white hover:bg-brand"
            >
              {isEditing ? 'Save Changes' : 'Add Item'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
