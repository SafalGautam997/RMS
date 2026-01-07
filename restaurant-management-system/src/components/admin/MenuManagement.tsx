import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { MenuItem, Category } from "../../types";
import { menuQueries, categoryQueries } from "../../db/queries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFolder,
  faImage,
  faPenToSquare,
  faPlus,
  faTrash,
  faUtensils,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const MenuManagement = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    stock: "1",
    available: 1,
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      console.log(
        "Submitting with imageUrl:",
        formData.imageUrl ? `${formData.imageUrl.substring(0, 50)}...` : "null"
      );
      console.log("About to call menuQueries.create/update...");
      if (editingItem) {
        console.log("Calling UPDATE");
        await menuQueries.update(
          editingItem.id,
          formData.name,
          parseFloat(formData.price),
          parseInt(formData.category_id),
          parseInt(formData.stock),
          formData.available,
          formData.imageUrl || undefined
        );
      } else {
        console.log("Calling CREATE");
        await menuQueries.create(
          formData.name,
          parseFloat(formData.price),
          parseInt(formData.category_id),
          parseInt(formData.stock),
          formData.imageUrl || undefined
        );
      }
      console.log("Query completed successfully");
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
      imageUrl: item.images || "",
    });
    setImagePreview(item.images || null);
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
      imageUrl: "",
    });
    setImagePreview(null);
    setEditingItem(null);
    setShowModal(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only JPG, JPEG, or PNG images");
        e.target.value = "";
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert("Image size should be less than 50MB");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log("Image loaded, base64 length:", base64String.length);
        setFormData({ ...formData, imageUrl: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await categoryQueries.create(newCategoryName);
      setNewCategoryName("");
      setShowCategoryModal(false);
      await loadData();
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Error adding category. Please try again.");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryQueries.delete(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Error deleting category. Please try again.");
      }
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen">
      <header className="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl transition font-semibold flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="icon-box w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
                <FontAwesomeIcon
                  icon={faUtensils}
                  className="text-xl text-white"
                />
              </div>
              <h1 className="text-2xl font-bold text-white">Menu Management</h1>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="btn-secondary px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md font-semibold flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faFolder} />
              <span>Manage Categories</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="table-container">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Image</th>
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
                  <td>
                    {item.images ? (
                      <img
                        src={item.images}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        <FontAwesomeIcon icon={faImage} />
                      </div>
                    )}
                  </td>
                  <td className="font-semibold text-gray-900">{item.name}</td>
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
                      <span className="inline-flex items-center gap-2">
                        <FontAwesomeIcon icon={faPenToSquare} />
                        <span>Edit</span>
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="table-action-btn table-action-btn-delete"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Delete</span>
                      </span>
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
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <h2 className="text-3xl font-bold gradient-text mb-6">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Name</label>
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
                <label className="form-label">
                  Upload Image (JPG, JPEG, PNG only)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleImageChange}
                  className="form-input"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, imageUrl: "" });
                        setImagePreview(null);
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
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
                <label className="form-label">Price (₹)</label>
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
                <label className="form-label">Stock</label>
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
                    Available for Order
                  </label>
                </label>
              </div>
              <div className="flex space-x-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 btn-primary text-center"
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 btn-secondary text-center py-3 rounded-lg transition font-semibold"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faXmark} />
                    <span>Cancel</span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="modal-close"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <h2 className="text-3xl font-bold gradient-text mb-6">
              Manage Categories
            </h2>

            <div className="mb-6">
              <label className="form-label">Add New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Category name"
                />
                <button
                  onClick={handleAddCategory}
                  className="btn-primary px-6 py-2 rounded-lg transition font-semibold flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              <h3 className="font-bold text-lg mb-3">Existing Categories</h3>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="font-semibold">{category.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Delete</span>
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-full btn-secondary py-3 rounded-lg transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
