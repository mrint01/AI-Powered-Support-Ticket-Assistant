import React, { useState, useEffect } from "react";
import type { TicketStatusHistory } from "../hooks/useTickets";
import FormatDate from "../utils/fct";

interface TicketHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  getTicketHistory: (ticketId: number) => Promise<TicketStatusHistory[]>;
}

export const TicketHistoryModal: React.FC<TicketHistoryModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  getTicketHistory,
}) => {
  const [history, setHistory] = useState<TicketStatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchHistory();
    }
  }, [isOpen, ticketId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const historyData = await getTicketHistory(ticketId);
      //console.log("historyData", historyData);
      setHistory(historyData);
    } catch (err) {
      setError("Failed to load ticket history");
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    Open: "bg-green-100 text-green-800",
    "In progress": "bg-blue-100 text-blue-800",
    Resolved: "bg-purple-100 text-purple-800",
    Closed: "bg-gray-100 text-gray-800",
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ticket History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No history available for this ticket.
              </div>
            ) : (
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Old Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      New Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Changed By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        <FormatDate dateString={record.changedAt} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[
                              record.oldStatus.charAt(0).toUpperCase() +
                                record.oldStatus.slice(1)
                            ]
                          }`}
                        >
                          {formatStatus(record.oldStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[
                              record.newStatus.charAt(0).toUpperCase() +
                                record.newStatus.slice(1)
                            ]
                          }`}
                        >
                          {formatStatus(record.newStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        {record.changedBy.username}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        {record.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
