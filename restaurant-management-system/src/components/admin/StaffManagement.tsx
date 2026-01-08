import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types";
import { userQueries } from "../../db/queries";
import { formatNepaliDate } from "../../utils/timeUtils";
import { useAppSelector } from "../../store/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faTrash,
  faUserShield,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const StaffManagement = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [staff, setStaff] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "Waiter",
  });

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", showModal);
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showModal]);

  const loadStaff = async () => {
    try {
      const users = await userQueries.getAll();
      setStaff(users);
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userQueries.create(
        formData.name,
        formData.username,
        formData.password,
        formData.role,
        user?.party || "cafe and restaurents"
      );
      resetForm();
      await loadStaff();
    } catch (error) {
      console.error("Error creating staff:", error);
      alert("Error: Username may already exist");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await userQueries.delete(id);
        await loadStaff();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      password: "",
      role: "Waiter",
    });
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
                <FontAwesomeIcon icon={faUsers} />
              </span>
              Staff Management
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-6 py-2.5 rounded-xl transition font-semibold flex items-center gap-2 w-full sm:w-auto"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Staff</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="table-container overflow-x-auto">
          <table className="table-modern min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Username
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Role
                </th>
                <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.username}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        user.role === "Admin"
                          ? "badge-primary"
                          : "badge-success"
                      } px-3 py-1 rounded-full text-xs inline-flex items-center gap-2`}
                    >
                      {user.role === "Admin" && (
                        <FontAwesomeIcon icon={faUserShield} />
                      )}
                      <span>{user.role}</span>
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNepaliDate(new Date(user.created_at))}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center gap-2"
                      disabled={user.role === "Admin"}
                    >
                      {user.role === "Admin" ? (
                        "Protected"
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faTrash} />
                          <span>Delete</span>
                        </>
                      )}
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
              Add New Staff
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
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="form-input w-full px-3 py-2 rounded-lg outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="form-input w-full px-3 py-2 rounded-lg outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="form-select w-full px-3 py-2 rounded-lg outline-none"
                >
                  <option value="Waiter">Waiter</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 rounded-lg transition"
                >
                  Add Staff
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

export default StaffManagement;
