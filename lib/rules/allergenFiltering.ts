import type { AllergenType, MenuItem } from '../types';

/**
 * Dietary restriction / allergen filtering logic.
 *
 * Implements the cross-referencing rule described in the thesis
 * (Chapter 3, Section 3.2.2 and FR-5.1 - FR-5.3): the Customer's declared
 * allergy tags are matched against the allergy tags assigned to each menu
 * item, and any match is surfaced as a conflict before the booking or
 * meal-prep order is finalized.
 */

export interface MenuItemAllergenCheck {
  menuItemId: string;
  menuItemName: string;
  conflicts: AllergenType[];
}

/**
 * Returns the allergens shared between a customer's declared restrictions
 * and a single menu item's allergy tags. An empty array means no conflict.
 */
export function checkAllergenConflict(
  menuItem: Pick<MenuItem, 'allergyTags'>,
  dietaryRestrictions: AllergenType[]
): AllergenType[] {
  if (dietaryRestrictions.length === 0 || menuItem.allergyTags.length === 0) {
    return [];
  }
  return menuItem.allergyTags.filter((tag) => dietaryRestrictions.includes(tag));
}

/**
 * Convenience boolean wrapper around checkAllergenConflict.
 */
export function hasAllergenConflict(
  menuItem: Pick<MenuItem, 'allergyTags'>,
  dietaryRestrictions: AllergenType[]
): boolean {
  return checkAllergenConflict(menuItem, dietaryRestrictions).length > 0;
}

/**
 * Runs the cross-reference check across a set of menu items (e.g. a
 * customer's current selection, or the full items attached to a submitted
 * booking) and returns only the items that have at least one conflict.
 */
export function getConflictingMenuItems(
  menuItems: MenuItem[],
  dietaryRestrictions: AllergenType[]
): MenuItemAllergenCheck[] {
  if (dietaryRestrictions.length === 0) return [];

  return menuItems
    .map((item) => ({
      menuItemId: item.id,
      menuItemName: item.name,
      conflicts: checkAllergenConflict(item, dietaryRestrictions),
    }))
    .filter((check) => check.conflicts.length > 0);
}

/**
 * Flattens the conflicts across a set of menu items into a unique,
 * deduplicated list of allergens — useful for a single summary warning
 * (e.g. in the booking sidebar) rather than repeating tags per item.
 */
export function getUniqueConflictingAllergens(
  menuItems: MenuItem[],
  dietaryRestrictions: AllergenType[]
): AllergenType[] {
  const conflicts = getConflictingMenuItems(menuItems, dietaryRestrictions);
  const unique = new Set<AllergenType>();
  conflicts.forEach((check) => check.conflicts.forEach((tag) => unique.add(tag)));
  return Array.from(unique);
}