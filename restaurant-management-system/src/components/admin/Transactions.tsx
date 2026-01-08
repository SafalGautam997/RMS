import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Transaction } from "../../types";
import { transactionQueries } from "../../db/queries";
import { formatNepaliDateTime } from "../../utils/timeUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFloppyDisk,
  faPenToSquare,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    amount: 0,
    paymentMethod: "",
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", showEditModal);
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showEditModal]);

  const loadTransactions = async () => {
    try {
      const allTransactions = await transactionQueries.getAll();
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      amount: transaction.amount,
      paymentMethod: transaction.payment_method,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;

    try {
      await transactionQueries.update(
        editingTransaction.id,
        editFormData.amount,
        editFormData.paymentMethod
      );
      setShowEditModal(false);
      setEditingTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Error updating transaction");
    }
  };

  const handleDelete = async (transactionId: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionQueries.delete(transactionId);
        await loadTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Error deleting transaction");
      }
    }
  };

  return (
    <div className="min-h-screen">
      <header className="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/admin")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl transition font-semibold inline-flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="table-container overflow-x-auto">
          <table className="table-modern min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{transaction.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.table_number
                      ? `Table ${transaction.table_number}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNepaliDateTime(new Date(transaction.created_at))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FontAwesomeIcon icon={faPenToSquare} />
                        <span>Edit</span>
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition"
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
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="modal-box rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Edit Transaction #{editingTransaction.id}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className="form-input w-full px-4 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={editFormData.paymentMethod}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="form-select w-full px-4 py-2 rounded-lg"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Mobile Pay">Mobile Pay</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="btn-primary flex-1 py-2.5 rounded-lg transition font-semibold"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                  <span>Save</span>
                </span>
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary flex-1 py-2.5 rounded-lg transition font-semibold"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faXmark} />
                  <span>Cancel</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
