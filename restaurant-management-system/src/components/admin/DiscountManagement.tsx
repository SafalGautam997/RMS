import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Discount } from "../../types";
import { discountQueries } from "../../db/queries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPercent,
  faPenToSquare,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const DiscountManagement = () => {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Percentage" as "Percentage" | "Fixed",
    value: "",
    active: 1,
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", showModal);
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showModal]);

  const loadDiscounts = async () => {
    try {
      const allDiscounts = await discountQueries.getAll();
      setDiscounts(allDiscounts);
    } catch (error) {
      console.error("Error loading discounts:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDiscount) {
        discountQueries.update(
          editingDiscount.id,
          formData.name,
          formData.type,
          parseFloat(formData.value),
          formData.active
        );
      } else {
        discountQueries.create(
          formData.name,
          formData.type,
          parseFloat(formData.value)
        );
      }
      resetForm();
      loadDiscounts();
    } catch (error) {
      console.error("Error saving discount:", error);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      type: discount.type,
      value: discount.value.toString(),
      active: discount.active,
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      try {
        discountQueries.delete(id);
        loadDiscounts();
      } catch (error) {
        console.error("Error deleting discount:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Percentage",
      value: "",
      active: 1,
    });
    setEditingDiscount(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen">
      <header className="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/admin")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl transition font-semibold flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white">
              <span className="mr-2">
                <FontAwesomeIcon icon={faPercent} />
              </span>
              Discount Management
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-6 py-2.5 rounded-xl transition font-semibold flex items-center gap-2 w-full sm:w-auto"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Discount</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="table-container overflow-x-auto">
          <table className="table-modern min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discounts.map((discount) => (
                <tr key={discount.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {discount.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {discount.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {discount.type === "Percentage"
                      ? `${discount.value}%`
                      : `$${discount.value}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        discount.active ? "badge-success" : "badge-warning"
                      } px-3 py-1 rounded-full text-xs inline-flex`}
                    >
                      {discount.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(discount)}
                      className="text-blue-700 hover:text-blue-900 inline-flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Delete</span>
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
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="modal-box rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingDiscount ? "Edit Discount" : "Add Discount"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input w-full px-3 py-2 rounded-lg outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "Percentage" | "Fixed",
                    })
                  }
                  className="form-select w-full px-3 py-2 rounded-lg outline-none"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value {formData.type === "Percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="form-input w-full px-3 py-2 rounded-lg outline-none"
                  required
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active === 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active: e.target.checked ? 1 : 0,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 rounded-lg transition"
                >
                  {editingDiscount ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 btn-secondary py-2.5 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountManagement;
