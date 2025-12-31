import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Order, OrderItem } from "../../types";

interface OrderState {
  orders: Order[];
  currentOrder: {
    tableNumber: number | null;
    items: Array<OrderItem & { menuItem?: any }>;
    subtotal: number;
    discountAmount: number;
    totalPrice: number;
  };
  loading: boolean;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: {
    tableNumber: null,
    items: [],
    subtotal: 0,
    discountAmount: 0,
    totalPrice: 0,
  },
  loading: false,
};

// Load current order from localStorage
const loadCurrentOrderFromStorage = () => {
  try {
    const stored = localStorage.getItem("currentOrder");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading order from localStorage:", error);
  }
  return initialState.currentOrder;
};

const orderSlice = createSlice({
  name: "order",
  initialState: {
    ...initialState,
    currentOrder: loadCurrentOrderFromStorage(),
  },
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(
        (order) => order.id === action.payload.id
      );
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    setTableNumber: (state, action: PayloadAction<number>) => {
      state.currentOrder.tableNumber = action.payload;
      localStorage.setItem("currentOrder", JSON.stringify(state.currentOrder));
    },
    addItemToCurrentOrder: (
      state,
      action: PayloadAction<{ menuItem: any; quantity: number }>
    ) => {
      const existingItemIndex = state.currentOrder.items.findIndex(
        (item: any) => item.menu_item_id === action.payload.menuItem.id
      );

      if (existingItemIndex !== -1) {
        state.currentOrder.items[existingItemIndex].quantity +=
          action.payload.quantity;
      } else {
        state.currentOrder.items.push({
          id: Date.now(),
          order_id: 0,
          menu_item_id: action.payload.menuItem.id,
          item_name: action.payload.menuItem.name,
          quantity: action.payload.quantity,
          price: action.payload.menuItem.price,
          menuItem: action.payload.menuItem,
        });
      }

      // Recalculate totals
      state.currentOrder.subtotal = state.currentOrder.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      state.currentOrder.totalPrice =
        state.currentOrder.subtotal - state.currentOrder.discountAmount;
      localStorage.setItem("currentOrder", JSON.stringify(state.currentOrder));
    },
    removeItemFromCurrentOrder: (state, action: PayloadAction<number>) => {
      state.currentOrder.items = state.currentOrder.items.filter(
        (item: any) => item.menu_item_id !== action.payload
      );

      // Recalculate totals
      state.currentOrder.subtotal = state.currentOrder.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      state.currentOrder.totalPrice =
        state.currentOrder.subtotal - state.currentOrder.discountAmount;
      localStorage.setItem("currentOrder", JSON.stringify(state.currentOrder));
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ menuItemId: number; quantity: number }>
    ) => {
      const item = state.currentOrder.items.find(
        (item: any) => item.menu_item_id === action.payload.menuItemId
      );
      if (item) {
        item.quantity = action.payload.quantity;

        // Recalculate totals
        state.currentOrder.subtotal = state.currentOrder.items.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        );
        state.currentOrder.totalPrice =
          state.currentOrder.subtotal - state.currentOrder.discountAmount;
        localStorage.setItem(
          "currentOrder",
          JSON.stringify(state.currentOrder)
        );
      }
    },
    applyDiscount: (
      state,
      action: PayloadAction<{ type: "Percentage" | "Fixed"; value: number }>
    ) => {
      if (action.payload.type === "Percentage") {
        state.currentOrder.discountAmount =
          (state.currentOrder.subtotal * action.payload.value) / 100;
      } else {
        state.currentOrder.discountAmount = action.payload.value;
      }
      state.currentOrder.totalPrice =
        state.currentOrder.subtotal - state.currentOrder.discountAmount;
      localStorage.setItem("currentOrder", JSON.stringify(state.currentOrder));
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = {
        tableNumber: null,
        items: [],
        subtotal: 0,
        discountAmount: 0,
        totalPrice: 0,
      };
      localStorage.removeItem("currentOrder");
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrder,
  setTableNumber,
  addItemToCurrentOrder,
  removeItemFromCurrentOrder,
  updateItemQuantity,
  applyDiscount,
  clearCurrentOrder,
  setLoading,
} = orderSlice.actions;

export default orderSlice.reducer;
