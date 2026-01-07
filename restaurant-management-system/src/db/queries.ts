const API_URL = "http://localhost:3001/api";

// User queries
export const userQueries = {
  login: async (username: string, password: string, party: string) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, party }),
    });
    if (!response.ok) throw new Error("Login failed");
    return await response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  },

  create: async (
    name: string,
    username: string,
    password: string,
    role: string,
    party: string
  ) => {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, role, party }),
    });
    if (!response.ok) throw new Error("Failed to create user");
    return await response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete user");
    return await response.json();
  },
};

// Category queries
export const categoryQueries = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return await response.json();
  },

  create: async (name: string) => {
    const response = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error("Failed to create category");
    return await response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete category");
    return await response.json();
  },
};

// Menu item queries
export const menuQueries = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/menu`);
    if (!response.ok) throw new Error("Failed to fetch menu items");
    return await response.json();
  },

  getAvailable: async () => {
    const response = await fetch(`${API_URL}/menu/available`);
    if (!response.ok) throw new Error("Failed to fetch available menu items");
    return await response.json();
  },

  create: async (
    name: string,
    price: number,
    categoryId: number,
    stock: number,
    imageUrl?: string
  ) => {
    console.log("menuQueries.create called with:", {
      name,
      price,
      categoryId,
      stock,
      hasImage: !!imageUrl,
      imageUrlLength: imageUrl?.length,
    });
    const response = await fetch(`${API_URL}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, categoryId, stock, imageUrl }),
    });
    if (!response.ok) throw new Error("Failed to create menu item");
    return await response.json();
  },

  update: async (
    id: number,
    name: string,
    price: number,
    categoryId: number,
    stock: number,
    available: number,
    imageUrl?: string
  ) => {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price,
        categoryId,
        stock,
        available,
        imageUrl,
      }),
    });
    if (!response.ok) throw new Error("Failed to update menu item");
    return await response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete menu item");
    return await response.json();
  },

  updateStock: async (id: number, quantityDecrement: number) => {
    const response = await fetch(`${API_URL}/menu/${id}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: quantityDecrement }),
    });
    if (!response.ok) throw new Error("Failed to update stock");
    return await response.json();
  },
};

// Order queries
export const orderQueries = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return await response.json();
  },

  getByWaiterId: async (waiterId: number) => {
    const response = await fetch(`${API_URL}/orders/waiter/${waiterId}`);
    if (!response.ok) throw new Error("Failed to fetch waiter orders");
    return await response.json();
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_URL}/orders/${id}`);
    if (!response.ok) throw new Error("Failed to fetch order");
    return await response.json();
  },

  create: async (
    tableNumber: number,
    waiterId: number,
    status: string,
    subtotal: number,
    discountAmount: number,
    totalPrice: number
  ) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableNumber,
        waiterId,
        status,
        subtotal,
        discountAmount,
        totalPrice,
      }),
    });
    if (!response.ok) throw new Error("Failed to create order");
    return await response.json();
  },

  updateStatus: async (id: number, status: string) => {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update order status");
    return await response.json();
  },

  update: async (
    id: number,
    subtotal: number,
    discountAmount: number,
    totalPrice: number
  ) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtotal, discountAmount, totalPrice }),
    });
    if (!response.ok) throw new Error("Failed to update order");
    return await response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete order");
    return await response.json();
  },
};

// Order item queries
export const orderItemQueries = {
  getByOrderId: async (orderId: number) => {
    const response = await fetch(`${API_URL}/order-items/${orderId}`);
    if (!response.ok) throw new Error("Failed to fetch order items");
    return await response.json();
  },

  create: async (
    orderId: number,
    menuItemId: number,
    quantity: number,
    price: number
  ) => {
    const response = await fetch(`${API_URL}/order-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, menuItemId, quantity, price }),
    });
    if (!response.ok) throw new Error("Failed to create order item");
    return await response.json();
  },

  deleteByOrderId: async (orderId: number) => {
    const response = await fetch(`${API_URL}/order-items/${orderId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete order items");
    return await response.json();
  },
};

// Discount queries
export const discountQueries = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/discounts`);
    if (!response.ok) throw new Error("Failed to fetch discounts");
    return await response.json();
  },

  getActive: async () => {
    const response = await fetch(`${API_URL}/discounts/active`);
    if (!response.ok) throw new Error("Failed to fetch active discounts");
    return await response.json();
  },

  create: async (name: string, type: string, value: number) => {
    const response = await fetch(`${API_URL}/discounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, value }),
    });
    if (!response.ok) throw new Error("Failed to create discount");
    return await response.json();
  },

  update: async (
    id: number,
    name: string,
    type: string,
    value: number,
    active: number
  ) => {
    const response = await fetch(`${API_URL}/discounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, value, active }),
    });
    if (!response.ok) throw new Error("Failed to update discount");
    return await response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/discounts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete discount");
    return await response.json();
  },
};

// Transaction queries
export const transactionQueries = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/transactions`);
    if (!response.ok) throw new Error("Failed to fetch transactions");
    return await response.json();
  },

  create: async (orderId: number, amount: number, paymentMethod: string) => {
    const response = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amount, paymentMethod }),
    });
    if (!response.ok) throw new Error("Failed to create transaction");
    return await response.json();
  },

  update: async (id: number, amount: number, paymentMethod: string) => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, paymentMethod }),
    });
    if (!response.ok) throw new Error("Failed to update transaction");
    return await response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete transaction");
    return await response.json();
  },

  getDailySales: async (date: string) => {
    const response = await fetch(`${API_URL}/transactions/daily-sales/${date}`);
    if (!response.ok) throw new Error("Failed to fetch daily sales");
    return await response.json();
  },

  getMonthlySales: async (year: string, month: string) => {
    const response = await fetch(
      `${API_URL}/transactions/monthly-sales/${year}/${month}`
    );
    if (!response.ok) throw new Error("Failed to fetch monthly sales");
    return await response.json();
  },

  getDailyReport: async (date: string) => {
    const response = await fetch(
      `${API_URL}/transactions/daily-report/${date}`
    );
    if (!response.ok) throw new Error("Failed to fetch daily report");
    return await response.json();
  },

  getWeeklyReport: async (startDate: string, endDate: string) => {
    const response = await fetch(
      `${API_URL}/transactions/weekly-report/${startDate}/${endDate}`
    );
    if (!response.ok) throw new Error("Failed to fetch weekly report");
    return await response.json();
  },

  getMonthlyReport: async (year: string, month: string) => {
    const response = await fetch(
      `${API_URL}/transactions/monthly-report/${year}/${month}`
    );
    if (!response.ok) throw new Error("Failed to fetch monthly report");
    return await response.json();
  },

  getYearlyReport: async (year: string) => {
    const response = await fetch(
      `${API_URL}/transactions/yearly-report/${year}`
    );
    if (!response.ok) throw new Error("Failed to fetch yearly report");
    return await response.json();
  },

  getMostSoldProducts: async (startDate: string, endDate: string) => {
    const response = await fetch(
      `${API_URL}/transactions/most-sold/${startDate}/${endDate}`
    );
    if (!response.ok) throw new Error("Failed to fetch most sold products");
    return await response.json();
  },
};
