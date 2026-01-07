import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { publicQueries } from "../../db/queries";
import type { MenuItem } from "../../types";
import ThemeSwitcher from "../ThemeSwitcher";

type CartLine = {
  menuItemId: number;
  quantity: number;
};

const CUSTOMER_NAME_KEY = "customerName";
const CUSTOMER_TABLE_KEY = "customerTableNumber";

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();

  const [customerName, setCustomerName] = useState<string>(() => {
    return (localStorage.getItem(CUSTOMER_NAME_KEY) || "").trim();
  });

  const [tableNumber, setTableNumber] = useState<number | null>(() => {
    const fromStorage = parsePositiveInt(
      localStorage.getItem(CUSTOMER_TABLE_KEY)
    );
    const fromQuery =
      parsePositiveInt(searchParams.get("table")) ??
      parsePositiveInt(searchParams.get("t"));

    return fromQuery ?? fromStorage;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Map<number, number>>(() => new Map());
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    const fromQuery =
      parsePositiveInt(searchParams.get("table")) ??
      parsePositiveInt(searchParams.get("t"));

    if (fromQuery && fromQuery !== tableNumber) {
      setTableNumber(fromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem(CUSTOMER_NAME_KEY, customerName);
  }, [customerName]);

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem(CUSTOMER_TABLE_KEY, String(tableNumber));
    }
  }, [tableNumber]);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    setError("");
    try {
      const items = await publicQueries.getMenu();
      setMenuItems(items);
    } catch (e) {
      console.error(e);
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const categoryNames = useMemo(() => {
    const categories = menuItems
      .map((m) => m.category_name || "Other")
      .filter(Boolean);
    return Array.from(new Set(categories));
  }, [menuItems]);

  const cartCount = useMemo(() => {
    let count = 0;
    for (const qty of cart.values()) count += qty;
    return count;
  }, [cart]);

  const cartLines = useMemo((): CartLine[] => {
    return Array.from(cart.entries())
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }))
      .filter((l) => l.quantity > 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    const byId = new Map(menuItems.map((m) => [m.id, m] as const));
    return cartLines.reduce((sum, line) => {
      const item = byId.get(line.menuItemId);
      if (!item) return sum;
      return sum + item.price * line.quantity;
    }, 0);
  }, [cartLines, menuItems]);

  const setQty = (menuItemId: number, quantity: number) => {
    setSuccess("");
    setError("");
    setCart((prev) => {
      const next = new Map(prev);
      if (quantity <= 0) next.delete(menuItemId);
      else next.set(menuItemId, quantity);
      return next;
    });
  };

  const handleSaveName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomerName(trimmed);
  };

  const handleSetTable = (value: string) => {
    const parsed = parsePositiveInt(value);
    if (!parsed) return;
    setTableNumber(parsed);
  };

  const placeOrder = async () => {
    setError("");
    setSuccess("");

    if (!customerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!tableNumber) {
      setError("Please select your table number");
      return;
    }
    if (cartLines.length === 0) {
      setError("Please add at least one item");
      return;
    }

    setPlacing(true);
    try {
      const result = await publicQueries.createOrder({
        customerName,
        tableNumber,
        items: cartLines,
      });

      setCart(new Map());
      setSuccess(`Order placed! Order #${result.orderId}`);
    } catch (e: any) {
      const msg = e?.message || "Failed to place order";
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };

  // Step 1: name
  if (!customerName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-6">
          <h1 className="text-2xl font-bold gradient-text mb-2">Welcome</h1>
          <p className="text-gray-600 mb-4">
            Enter your name to start ordering.
          </p>
          <input
            type="text"
            className="form-input w-full"
            placeholder="Your name"
            defaultValue=""
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const target = e.target as HTMLInputElement;
                handleSaveName(target.value);
              }
            }}
          />
          <button
            className="btn-primary w-full mt-4 py-3 rounded-xl"
            onClick={() => {
              const input = document.querySelector(
                "input[placeholder='Your name']"
              ) as HTMLInputElement | null;
              handleSaveName(input?.value || "");
            }}
          >
            Continue
          </button>
          <p className="text-xs text-gray-500 mt-3">No password required.</p>
        </div>
      </div>
    );
  }

  // Step 2: table
  if (!tableNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-6">
          <h1 className="text-2xl font-bold gradient-text mb-2">
            Hi, {customerName}
          </h1>
          <p className="text-gray-600 mb-4">Select your table number.</p>

          <div className="flex gap-2">
            <input
              type="number"
              className="form-input w-full"
              placeholder="Table number"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const target = e.target as HTMLInputElement;
                  handleSetTable(target.value);
                }
              }}
            />
            <button
              className="btn-primary px-4 rounded-xl"
              onClick={() => {
                const input = document.querySelector(
                  "input[placeholder='Table number']"
                ) as HTMLInputElement | null;
                handleSetTable(input?.value || "");
              }}
            >
              Set
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 mt-5">
            {Array.from({ length: 20 }).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  className="btn-secondary py-2 rounded-lg text-sm"
                  onClick={() => setTableNumber(n)}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <button
            className="w-full mt-5 text-sm text-gray-600 hover:text-gray-900"
            onClick={() => {
              localStorage.removeItem(CUSTOMER_NAME_KEY);
              setCustomerName("");
            }}
          >
            Change name
          </button>
        </div>
      </div>
    );
  }

  // Step 3: menu + cart
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="header-main sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-white font-bold text-lg">Menu</div>
            <div className="text-white text-opacity-80 text-sm">
              {customerName} • Table {tableNumber}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-white">
              <ThemeSwitcher />
            </div>
            <button
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-xl text-sm font-semibold"
              onClick={() => {
                localStorage.removeItem(CUSTOMER_TABLE_KEY);
                setTableNumber(null);
              }}
            >
              Table
            </button>
            <button
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-xl text-sm font-semibold"
              onClick={() => {
                localStorage.removeItem(CUSTOMER_NAME_KEY);
                localStorage.removeItem(CUSTOMER_TABLE_KEY);
                setCustomerName("");
                setTableNumber(null);
                setCart(new Map());
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 pb-28">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading menu...</div>
        ) : (
          <div className="space-y-6">
            {categoryNames.map((category) => {
              const items = menuItems.filter(
                (m) => (m.category_name || "Other") === category
              );
              if (items.length === 0) return null;

              return (
                <section key={category}>
                  <h2 className="text-lg font-bold text-gray-800 mb-3">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((item) => {
                      const qty = cart.get(item.id) || 0;
                      return (
                        <div key={item.id} className="card p-4 flex gap-3">
                          {item.images ? (
                            <img
                              src={item.images}
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                              🍽
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-bold text-gray-800 truncate">
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  ₹{item.price.toFixed(2)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  className="btn-secondary w-9 h-9 rounded-xl inline-flex items-center justify-center leading-none text-lg"
                                  onClick={() => setQty(item.id, qty - 1)}
                                  disabled={qty <= 0}
                                >
                                  -
                                </button>
                                <div className="w-6 text-center font-semibold">
                                  {qty}
                                </div>
                                <button
                                  className="btn-primary w-9 h-9 rounded-xl inline-flex items-center justify-center leading-none text-lg"
                                  onClick={() => setQty(item.id, qty + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Stock: {item.stock}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {menuItems.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                No items available.
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-gray-600">Items: {cartCount}</div>
            <div className="text-lg font-bold text-gray-900">
              Total: ₹{subtotal.toFixed(2)}
            </div>
          </div>
          <button
            className="btn-primary px-5 py-3 rounded-xl font-semibold"
            disabled={placing || cartCount === 0}
            onClick={placeOrder}
          >
            {placing ? "Placing..." : "Place Order"}
          </button>
        </div>
      </footer>
    </div>
  );
}
