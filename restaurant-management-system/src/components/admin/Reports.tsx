import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { transactionQueries } from "../../db/queries";
import { formatNepaliDateTime } from "../../utils/timeUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChartLine,
  faList,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";

const Reports = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [totalSales, setTotalSales] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [reportType, selectedDate, selectedMonth, selectedYear]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      let startDate = selectedDate;
      let endDate = selectedDate;

      switch (reportType) {
        case "daily":
          data = await transactionQueries.getDailyReport(selectedDate);
          break;
        case "weekly":
          const date = new Date(selectedDate);
          const weekStart = new Date(
            date.setDate(date.getDate() - date.getDay())
          );
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          startDate = weekStart.toISOString().split("T")[0];
          endDate = weekEnd.toISOString().split("T")[0];
          data = await transactionQueries.getWeeklyReport(startDate, endDate);
          break;
        case "monthly":
          data = await transactionQueries.getMonthlyReport(
            selectedYear,
            selectedMonth.padStart(2, "0")
          );
          startDate = `${selectedYear}-${selectedMonth}-01`;
          endDate = `${selectedYear}-${selectedMonth}-31`;
          break;
        case "yearly":
          data = await transactionQueries.getYearlyReport(selectedYear);
          startDate = `${selectedYear}-01-01`;
          endDate = `${selectedYear}-12-31`;
          break;
      }

      setTransactions(data);
      const total = data.reduce((sum: number, t: any) => sum + t.amount, 0);
      setTotalSales(total);
      setTransactionCount(data.length);

      // Get most sold products
      const products = await transactionQueries.getMostSoldProducts(
        startDate,
        endDate
      );
      setTopProducts(products);
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen">
      <header className="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate("/admin")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl transition font-semibold flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white">
              <span className="mr-2">
                <FontAwesomeIcon icon={faChartLine} />
              </span>
              Reports & Analytics
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Type Selector */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {(["daily", "weekly", "monthly", "yearly"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`py-3 px-4 rounded-lg font-semibold transition capitalize ${
                  reportType === type ? "btn-primary" : "btn-secondary"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportType === "daily" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input w-full px-4 py-2 rounded-lg"
                />
              </div>
            )}

            {reportType === "weekly" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Week Starting Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input w-full px-4 py-2 rounded-lg"
                />
              </div>
            )}

            {reportType === "monthly" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="form-select w-full px-4 py-2 rounded-lg"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option
                        key={i + 1}
                        value={(i + 1).toString().padStart(2, "0")}
                      >
                        {new Date(2024, i).toLocaleString("en-US", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="form-select w-full px-4 py-2 rounded-lg"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {reportType === "yearly" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="form-select w-full px-4 py-2 rounded-lg"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card stats-card p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">
              Total Sales
            </p>
            <p className="text-4xl font-bold gradient-text">
              ₹{totalSales.toFixed(2)}
            </p>
          </div>
          <div className="card stats-card p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">
              Total Transactions
            </p>
            <p className="text-4xl font-bold gradient-text">
              {transactionCount}
            </p>
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            <span className="mr-2">
              <FontAwesomeIcon icon={faTrophy} />
            </span>
            Top Selling Products
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="table-container">
                <table className="table-modern min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Quantity Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Total Sales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Orders
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topProducts.map((product: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.total_quantity} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ₹
                          {product.total_revenue
                            ? product.total_revenue.toFixed(2)
                            : "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          N/A
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No products sold in this period
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            <span className="mr-2">
              <FontAwesomeIcon icon={faList} />
            </span>
            Transactions
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="table-container">
                <table className="table-modern min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Table
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{transaction.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Table {transaction.table_number || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ₹{transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.payment_method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNepaliDateTime(
                            new Date(transaction.created_at)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions in this period
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
