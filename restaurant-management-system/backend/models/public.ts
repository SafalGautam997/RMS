export type PublicMenuItem = {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  category_name?: string | null;
  stock: number;
  available: number;
  images?: string | null;
};

export type PublicCreateOrderItemInput = {
  menuItemId: number;
  quantity: number;
};

export type PublicCreateOrderRequest = {
  customerName: string;
  tableNumber: number;
  items: PublicCreateOrderItemInput[];
};

export type PublicCreateOrderResponse = {
  orderId: number;
  status: "Pending";
};
