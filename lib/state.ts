import { create } from 'zustand';
import {
  UserRole,
  Booking,
  MenuItem,
  EventProfile,
  Ingredient,
  Alert,
  AllergenType,
  OrderType,
  OperatorSettings,
  Payment,
  Invoice,
  PaymentType,
} from './types';
import {
  mockMenuItems,
  mockEventProfiles,
  mockIngredients,
  mockOperatorSettings,
  mockPayments,
  buildInitialBookings,
  buildInitialInvoices,
} from './mockData';
import {
  applyBookingValidation,
  buildAlerts,
  syncMenuInventoryStatus,
} from './alerts';
import { validateBooking } from './rules/bookingValidation';
import { generateInvoice, getPaymentsTotal } from './rules/invoices';

function refreshDerivedState(state: {
  bookings: Booking[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  operatorSettings: OperatorSettings;
  payments: Payment[];
  invoices: Invoice[];
}) {
  const menuItems = syncMenuInventoryStatus(state.menuItems, state.ingredients);
  const alerts = buildAlerts({ ...state, menuItems });
  return { menuItems, alerts };
}

const initialBookings = buildInitialBookings();
const initialMenuItems = syncMenuInventoryStatus(mockMenuItems, mockIngredients);
const initialInvoices = buildInitialInvoices(initialBookings, initialMenuItems);

interface AppState {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  bookings: Booking[];
  menuItems: MenuItem[];
  eventProfiles: EventProfile[];
  ingredients: Ingredient[];
  alerts: Alert[];
  operatorSettings: OperatorSettings;
  payments: Payment[];
  invoices: Invoice[];

  selectedMenuItemIds: string[];
  customerDietaryRestrictions: AllergenType[];
  selectedEventProfileId: string;
  customerBookingDraft: Partial<Booking>;
  customerOrderType: OrderType;

  toggleRole: () => void;
  createBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  confirmBooking: (bookingId: string) => boolean;
  rejectBooking: (bookingId: string) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (itemId: string) => void;
  updateIngredientStock: (ingredientId: string, newStock: number) => void;
  addEventProfile: (profile: EventProfile) => void;
  updateEventProfile: (profileId: string, updates: Partial<EventProfile>) => void;
  updateOperatorSettings: (updates: Partial<OperatorSettings>) => void;
  recordPayment: (
    bookingId: string,
    amount: number,
    type: PaymentType,
    notes?: string
  ) => void;
  getInvoiceForBooking: (bookingId: string) => Invoice | undefined;
  selectMenuItem: (itemId: string) => void;
  deselectMenuItem: (itemId: string) => void;
  setDietaryRestrictions: (restrictions: AllergenType[]) => void;
  setSelectedEventProfile: (profileId: string) => void;
  setCustomerBookingDraft: (draft: Partial<Booking>) => void;
  setCustomerOrderType: (type: OrderType) => void;
  clearCustomerSession: () => void;
  updateAlerts: (alerts: Alert[]) => void;
  regenerateAlerts: () => void;
}

export const useAppState = create<AppState>((set, get) => ({
  currentRole: 'customer',
  bookings: initialBookings,
  menuItems: initialMenuItems,
  eventProfiles: mockEventProfiles,
  ingredients: mockIngredients,
  operatorSettings: mockOperatorSettings,
  payments: mockPayments,
  invoices: initialInvoices,
  alerts: buildAlerts({
    bookings: initialBookings,
    menuItems: initialMenuItems,
    ingredients: mockIngredients,
    operatorSettings: mockOperatorSettings,
  }),

  selectedMenuItemIds: [],
  customerDietaryRestrictions: [],
  selectedEventProfileId: mockEventProfiles[0].id,
  customerBookingDraft: {},
  customerOrderType: 'catering',

  setCurrentRole: (role) => set({ currentRole: role }),

  toggleRole: () =>
    set((state) => ({
      currentRole: state.currentRole === 'owner' ? 'customer' : 'owner',
    })),

  createBooking: (booking) => {
    const state = get();
    const validated = applyBookingValidation(booking, state.operatorSettings, state.bookings);
    const bookings = [...state.bookings, validated];
    const next = { ...state, bookings };
    const derived = refreshDerivedState(next);
    set({ bookings, ...derived });
  },

  updateBooking: (bookingId, updates) => {
    const state = get();
    const bookings = state.bookings.map((b) => {
      if (b.id !== bookingId) return b;
      const merged = { ...b, ...updates };
      return applyBookingValidation(merged, state.operatorSettings, state.bookings);
    });
    const next = { ...state, bookings };
    const derived = refreshDerivedState(next);
    set({ bookings, ...derived });
  },

  confirmBooking: (bookingId) => {
    const state = get();
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status !== 'pending') return false;

    const validated = applyBookingValidation(booking, state.operatorSettings, state.bookings);
    if (!validated.validationPassed) {
      const bookings = state.bookings.map((b) =>
        b.id === bookingId ? validated : b
      );
      const next = { ...state, bookings };
      set({ bookings, ...refreshDerivedState(next) });
      return false;
    }

    const confirmed: Booking = {
      ...validated,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
    };
    const bookings = state.bookings.map((b) => (b.id === bookingId ? confirmed : b));
    const invoice = generateInvoice(confirmed, state.menuItems, state.payments);
    const next = { ...state, bookings, invoices: [...state.invoices, invoice] };
    set({ bookings, invoices: next.invoices, ...refreshDerivedState(next) });
    return true;
  },

  rejectBooking: (bookingId) =>
    set((state) => {
      const next = {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'rejected' as const } : b
        ),
      };
      return refreshDerivedState(next);
    }),

  addMenuItem: (item) =>
    set((state) => {
      const next = { ...state, menuItems: [...state.menuItems, item] };
      return refreshDerivedState(next);
    }),

  updateMenuItem: (itemId, updates) =>
    set((state) => {
      const next = {
        ...state,
        menuItems: state.menuItems.map((m) =>
          m.id === itemId ? { ...m, ...updates } : m
        ),
      };
      return refreshDerivedState(next);
    }),

  deleteMenuItem: (itemId) =>
    set((state) => {
      const next = {
        ...state,
        menuItems: state.menuItems.filter((m) => m.id !== itemId),
      };
      return refreshDerivedState(next);
    }),

  updateIngredientStock: (ingredientId, newStock) =>
    set((state) => {
      const next = {
        ...state,
        ingredients: state.ingredients.map((i) =>
          i.id === ingredientId ? { ...i, currentStock: newStock } : i
        ),
      };
      return refreshDerivedState(next);
    }),

  addEventProfile: (profile) =>
    set((state) => ({
      eventProfiles: [...state.eventProfiles, profile],
    })),

  updateEventProfile: (profileId, updates) =>
    set((state) => ({
      eventProfiles: state.eventProfiles.map((p) =>
        p.id === profileId ? { ...p, ...updates } : p
      ),
    })),

  updateOperatorSettings: (updates) =>
    set((state) => {
      const operatorSettings = { ...state.operatorSettings, ...updates };
      const bookings = state.bookings.map((b) =>
        applyBookingValidation(b, operatorSettings, state.bookings)
      );
      const next = { ...state, operatorSettings, bookings };
      return { operatorSettings, bookings, ...refreshDerivedState(next) };
    }),

  recordPayment: (bookingId, amount, type, notes) =>
    set((state) => {
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        bookingId,
        amount,
        date: new Date().toISOString(),
        type,
        notes,
      };
      const payments = [...state.payments, payment];
      const totalPaid = getPaymentsTotal(payments, bookingId);
      const bookings = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, paymentsReceived: totalPaid } : b
      );
      const invoices = state.invoices.map((inv) =>
        inv.bookingId === bookingId
          ? {
              ...inv,
              paymentsMade: totalPaid,
              balanceDue: Math.max(inv.totalDue - totalPaid, 0),
            }
          : inv
      );
      return { payments, bookings, invoices };
    }),

  getInvoiceForBooking: (bookingId) => {
    const state = get();
    return state.invoices.find((inv) => inv.bookingId === bookingId);
  },

  selectMenuItem: (itemId) =>
    set((state) => ({
      selectedMenuItemIds: [...state.selectedMenuItemIds, itemId],
    })),

  deselectMenuItem: (itemId) =>
    set((state) => ({
      selectedMenuItemIds: state.selectedMenuItemIds.filter((id) => id !== itemId),
    })),

  setDietaryRestrictions: (restrictions) =>
    set({ customerDietaryRestrictions: restrictions }),

  setSelectedEventProfile: (profileId) =>
    set({ selectedEventProfileId: profileId }),

  setCustomerBookingDraft: (draft) =>
    set({ customerBookingDraft: draft }),

  setCustomerOrderType: (type) => set({ customerOrderType: type }),

  clearCustomerSession: () =>
    set({
      selectedMenuItemIds: [],
      customerDietaryRestrictions: [],
      selectedEventProfileId: mockEventProfiles[0].id,
      customerBookingDraft: {},
      customerOrderType: 'catering',
    }),

  updateAlerts: (alerts) => set({ alerts }),

  regenerateAlerts: () => {
    const state = get();
    set(refreshDerivedState(state));
  },
}));

export { validateBooking, applyBookingValidation };
