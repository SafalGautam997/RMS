// SQLite Database Client
// Uses API calls to backend server

const API_BASE_URL = "http://localhost:3001/api";

class SQLiteClient {
  constructor() {
    // No initialization needed - we call the API directly
  }

  exec(_query: string) {
    // Mock implementation - no need to create tables via frontend
  }

  pragma(_statement: string) {
    // Mock implementation
  }

  prepare(query: string) {
    return {
      get: (...params: any[]) => this.executeQuery(query, params, "get"),
      all: (...params: any[]) => this.executeQuery(query, params, "all"),
      run: (...params: any[]) => this.executeQuery(query, params, "run"),
    };
  }

  private async executeQuery(
    query: string,
    params: any[],
    type: "get" | "all" | "run"
  ) {
    const normalizedQuery = query.toLowerCase().trim();

    // SELECT queries
    if (normalizedQuery.includes("select")) {
      return await this.handleSelectQuery(query, params, type);
    }

    // INSERT queries
    if (normalizedQuery.includes("insert")) {
      return await this.handleInsertQuery(query, params);
    }

    // UPDATE queries
    if (normalizedQuery.includes("update")) {
      return await this.handleUpdateQuery(query, params);
    }

    // DELETE queries
    if (normalizedQuery.includes("delete")) {
      return await this.handleDeleteQuery(query, params);
    }

    return null;
  }

  private async handleSelectQuery(
    query: string,
    params: any[],
    type: "get" | "all" | "run"
  ) {
    const normalizedQuery = query.toLowerCase();

    // User login
    if (
      normalizedQuery.includes("from users") &&
      normalizedQuery.includes("username = ? and password = ?")
    ) {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: params[0], password: params[1] }),
      });
      const data = await response.json();
      return type === "get" ? data : [data];
    }

    // All users
    if (normalizedQuery.includes("from users")) {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        return type === "get" ? data[0] : data;
      } catch (error) {
        console.error("Error fetching users:", error);
        return type === "get" ? {} : [];
      }
    }

    // All categories
    if (normalizedQuery.includes("from categories")) {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        return type === "get" ? data[0] : data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return type === "get" ? {} : [];
      }
    }

    // Menu items
    if (normalizedQuery.includes("from menu_items m")) {
      try {
        const endpoint = normalizedQuery.includes("available = 1")
          ? `${API_BASE_URL}/menu/available`
          : `${API_BASE_URL}/menu`;
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch menu items");
        const data = await response.json();
        return type === "get" ? data[0] : data;
      } catch (error) {
        console.error("Error fetching menu items:", error);
        return type === "get" ? {} : [];
      }
    }

    // Orders
    if (normalizedQuery.includes("from orders o")) {
      try {
        if (normalizedQuery.includes("waiter_id = ?")) {
          const response = await fetch(
            `${API_BASE_URL}/orders/waiter/${params[0]}`
          );
          if (!response.ok) throw new Error("Failed to fetch orders");
          const data = await response.json();
          return type === "get" ? data : Array.isArray(data) ? data : [data];
        }

        if (normalizedQuery.includes("where id = ?")) {
          const response = await fetch(`${API_BASE_URL}/orders/${params[0]}`);
          if (!response.ok) throw new Error("Failed to fetch order");
          const data = await response.json();
          return type === "get" ? data : [data];
        }

        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        return type === "get" ? data[0] : data;
      } catch (error) {
        console.error("Error fetching orders:", error);
        return type === "get" ? {} : [];
      }
    }

    // Order items
    if (normalizedQuery.includes("from order_items oi")) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/order-items/${params[0]}`
        );
        if (!response.ok) throw new Error("Failed to fetch order items");
        const data = await response.json();
        return type === "get" ? data[0] : data;
      } catch (error) {
        console.error("Error fetching order items:", error);
        return type === "get" ? {} : [];
      }
    }

    // Discounts
    if (normalizedQuery.includes("from discounts")) {
      try {
        const endpoint = normalizedQuery.includes("active = 1")
          ? `${API_BASE_URL}/discounts/active`
          : `${API_BASE_URL}/discounts`;
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch discounts");
        const data = await response.json();
        return type === "get" ? data[0] : data;
      } catch (error) {
        console.error("Error fetching discounts:", error);
        return type === "get" ? {} : [];
      }
    }

    // Transactions
    if (normalizedQuery.includes("from transactions t")) {
      try {
        if (normalizedQuery.includes("daily_sales")) {
          const match = query.match(/where date\(created_at\) = \?/i);
          if (match) {
            const response = await fetch(
              `${API_BASE_URL}/transactions/daily-sales/${params[0]}`
            );
            if (!response.ok) throw new Error("Failed to fetch daily sales");
            const data = await response.json();
            return type === "get" ? data : [data];
          }
        }

        if (
          normalizedQuery.includes("monthly_sales") ||
          normalizedQuery.includes("year(created_at)")
        ) {
          const response = await fetch(
            `${API_BASE_URL}/transactions/monthly-sales/${params[0]}/${params[1]}`
          );
          if (!response.ok) throw new Error("Failed to fetch monthly sales");
          const data = await response.json();
          return type === "get" ? data : [data];
        }

        const response = await fetch(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data = await response.json();
        return type === "get" ? data[0] : data;
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return type === "get" ? {} : [];
      }
    }

    return type === "get" ? {} : [];
  }

  private async handleInsertQuery(query: string, params: any[]) {
    const normalizedQuery = query.toLowerCase();

    try {
      if (normalizedQuery.includes("into users")) {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: params[0],
            username: params[1],
            password: params[2],
            role: params[3],
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create user");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("into categories")) {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: params[0] }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create category");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("into menu_items")) {
        const response = await fetch(`${API_BASE_URL}/menu`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: params[0],
            price: params[1],
            categoryId: params[2],
            stock: params[3],
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create menu item");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("into orders")) {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableNumber: params[0],
            waiterId: params[1],
            status: params[2],
            subtotal: params[3],
            discountAmount: params[4],
            totalPrice: params[5],
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create order");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("into order_items")) {
        const response = await fetch(`${API_BASE_URL}/order-items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: params[0],
            menuItemId: params[1],
            quantity: params[2],
            price: params[3],
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add order item");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("into discounts")) {
        const response = await fetch(`${API_BASE_URL}/discounts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: params[0],
            type: params[1],
            value: params[2],
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create discount");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("into transactions")) {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: params[0],
            amount: params[1],
            paymentMethod: params[2],
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create transaction");
        }
        return await response.json();
      }

      return { lastInsertRowid: 0, changes: 0 };
    } catch (error) {
      console.error("Error in insert query:", error);
      throw error;
    }
  }

  private async handleUpdateQuery(query: string, params: any[]) {
    const normalizedQuery = query.toLowerCase();

    try {
      if (normalizedQuery.includes("update menu_items")) {
        const id = params[5]; // Last parameter is the ID
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: params[0],
            price: params[1],
            categoryId: params[2],
            stock: params[3],
            available: params[4],
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update menu item");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("update orders set status")) {
        const id = params[1]; // Status is first param, ID is second
        const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: params[0] }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update order status");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("update orders set subtotal")) {
        const id = params[3]; // subtotal, discountAmount, totalPrice, id
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subtotal: params[0],
            discountAmount: params[1],
            totalPrice: params[2],
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update order");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("update discounts")) {
        const id = params[4]; // name, type, value, active, id
        const response = await fetch(`${API_BASE_URL}/discounts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: params[0],
            type: params[1],
            value: params[2],
            active: params[3],
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update discount");
        }
        return await response.json();
      }

      return { changes: 0 };
    } catch (error) {
      console.error("Error in update query:", error);
      throw error;
    }
  }

  private async handleDeleteQuery(query: string, params: any[]) {
    const normalizedQuery = query.toLowerCase();
    const id = params[0];

    try {
      if (normalizedQuery.includes("delete from users")) {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete user");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("delete from categories")) {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete category");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("delete from menu_items")) {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete menu item");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("delete from order_items")) {
        const response = await fetch(`${API_BASE_URL}/order-items/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete order item");
        }
        return await response.json();
      }

      if (normalizedQuery.includes("delete from discounts")) {
        const response = await fetch(`${API_BASE_URL}/discounts/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete discount");
        }
        return await response.json();
      }

      return { changes: 0 };
    } catch (error) {
      console.error("Error in delete query:", error);
      throw error;
    }
  }
}

const db = new SQLiteClient();

// Initialize database (no-op for frontend - done on backend)
export const initDatabase = () => {
  console.log("Connected to SQLite backend server at localhost:3001");
};

export default db;
