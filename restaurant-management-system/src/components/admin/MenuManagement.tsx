import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { MenuItem, Category } from "../../types";
import { menuQueries, categoryQueries } from "../../db/queries";

const MenuManagement = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    stock: "1",
    available: 1,
  });

  useEffect(() => {
    loadData();

    // Reload menu items every 3 seconds to reflect stock changes
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const items = await menuQueries.getAll();
      const cats = await categoryQueries.getAll();
      setMenuItems(items);
      setCategories(cats);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await menuQueries.update(
          editingItem.id,
          formData.name,
          parseFloat(formData.price),
          parseInt(formData.category_id),
          parseInt(formData.stock),
          formData.available
        );
      } else {
        await menuQueries.create(
          formData.name,
          parseFloat(formData.price),
          parseInt(formData.category_id),
          parseInt(formData.stock)
        );
      }
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Error saving menu item. Please try again.");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category_id: item.category_id.toString(),
      stock: item.stock.toString(),
      available: item.available,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await menuQueries.delete(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Error deleting item. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category_id: "",
      stock: "1",
      available: 1,
    });
    setEditingItem(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin")}
              className="text-gray-600 hover:text-indigo-600 transition text-lg font-semibold"
            >
              ← Back
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl">🍽️</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text">
                Menu Management
              </h1>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            ➕ Add Item
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="table-container">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="font-semibold text-gray-900">
                    🍴 {item.name}
                  </td>
                  <td className="text-gray-600">
                    <span className="badge badge-primary">
                      {item.category_name}
                    </span>
                  </td>
                  <td className="font-bold text-gray-900">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="text-gray-900">
                    {item.stock} unit{item.stock !== 1 ? "s" : ""}
                  </td>
                  <td>
                    <span
                      className={`status-dot ${
                        item.available ? "status-completed" : "status-cancelled"
                      }`}
                    ></span>
                    {item.available ? "Available" : "Unavailable"}
                  </td>
                  <td className="space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="table-action-btn table-action-btn-edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="table-action-btn table-action-btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <button onClick={() => resetForm()} className="modal-close">
              ✕
            </button>
            <h2 className="text-3xl font-bold gradient-text mb-6">
              {editingItem ? "✏️ Edit Menu Item" : "➕ Add Menu Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label className="form-label">🍴 Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">📂 Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="form-select"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">💵 Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">📦 Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.available === 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        available: e.target.checked ? 1 : 0,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                    ✅ Available for Order
                  </label>
                </label>
              </div>
              <div className="flex space-x-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 btn-primary text-center"
                >
                  {editingItem ? "💾 Update Item" : "✨ Add Item"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition font-semibold"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
