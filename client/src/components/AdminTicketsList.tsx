import * as React from "react";
import {
  HiEye,
  HiReply,
  HiTrash,
  HiX,
  HiCheck,
  HiFilter,
  HiSortAscending,
} from "react-icons/hi";
import { useTickets } from "../hooks/useTickets";
import { useAuth } from "../AuthContext";
import Conversation from "./Conversation";

type Priority = "high" | "medium" | "low";

type Ticket = {
  id: number;
  subject: string;
  status: string;
  created: string;
  priority: Priority;
  message: string;
  ai_results?: { summary?: string }[];
  user: { id: number; username: string };
};

type TicketWithAIResult = Ticket & { ai_results?: { summary?: string }[] };

const statusColors: Record<string, string> = {
  Open: "bg-green-100 text-green-800",
  "In progress": "bg-blue-100 text-blue-800",
  Resolved: "bg-purple-100 text-purple-800",
  Closed: "bg-gray-100 text-gray-800",
};
const priorityColors: Record<Priority, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
};
const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const AdminTicketsList: React.FC = () => {
  const { tickets, loading, error, deleteTicket, updateTicket } = useTickets();
  const { user } = useAuth();
  const typedTickets = tickets as TicketWithAIResult[];
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(
    null
  );
  const [conversationTicket, setConversationTicket] =
    React.useState<Ticket | null>(null);
  const [deleteConfirmTicket, setDeleteConfirmTicket] =
    React.useState<Ticket | null>(null);

  // Filter and sort state
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("priority");

  // Filter tickets based on status and priority
  const filteredTickets = typedTickets.filter((ticket) => {
    const statusMatch =
      statusFilter === "all" || ticket.status.toLowerCase() === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || ticket.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // Sort filtered tickets
  const sortedTickets = React.useMemo(() => {
    const tickets = [...filteredTickets];

    switch (sortBy) {
      case "date-desc":
        return tickets.sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );
      case "date-asc":
        return tickets.sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime()
        );
      case "priority":
        return tickets.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
      case "priority-desc":
        return tickets.sort(
          (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
        );
      default:
        return tickets.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
    }
  }, [filteredTickets, sortBy]);

  const handleRespond = (ticket: Ticket) => {
    setConversationTicket(ticket);
  };

  const handleDeleteTicket = (ticketId: number) => {
    const ticketToDelete = typedTickets.find((t) => t.id === ticketId);
    if (ticketToDelete) {
      setDeleteConfirmTicket(ticketToDelete);
    }
  };

  const confirmDeleteTicket = () => {
    if (deleteConfirmTicket) {
      deleteTicket(deleteConfirmTicket.id);
      setDeleteConfirmTicket(null);
      setSelectedTicket(null);
      setConversationTicket(null);
    }
  };

  const cancelDeleteTicket = () => {
    setDeleteConfirmTicket(null);
  };

  if (!user) {
    return <div>Please login to view your tickets</div>;
  }

  // Find the latest selected ticket from state (to get updated response)
  const selectedTicketData = selectedTicket
    ? typedTickets.find((t: TicketWithAIResult) => t.id === selectedTicket.id)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Tickets List</h2>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <HiFilter className="text-gray-500" size={16} />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <HiFilter className="text-gray-500" size={16} />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <HiSortAscending className="text-gray-500" size={16} />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="priority">Priority (High to Low)</option>
              <option value="priority-desc">Priority (Low to High)</option>
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {sortedTickets.length} of {typedTickets.length} tickets
      </div>

      {loading && <div>Loading tickets...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading &&
        !error &&
        sortedTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-lg transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold">
                  #{ticket.user?.username}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    priorityColors[ticket.priority]
                  }`}
                >
                  {ticket.priority}
                </span>
                <select
                  className={`px-2 py-1 text-xs font-semibold rounded-full focus:outline-none ${
                    statusColors[
                      ticket.status.charAt(0).toUpperCase() +
                        ticket.status.slice(1)
                    ]
                  }`}
                  value={ticket.status.toLowerCase()}
                  onChange={(e) =>
                    updateTicket(ticket.id, { status: e.target.value })
                  }
                  style={{ cursor: "pointer" }}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-gray-800 font-bold text-xl mb-1">
                {ticket.ai_results?.[0]?.summary
                  ? ticket.ai_results[0].summary
                  : ticket.subject}
              </div>
              <div className="text-gray-500 text-sm">
                Created: {ticket.created}
              </div>
            </div>
            <div className="flex gap-2 self-end md:self-auto">
              <button
                aria-label="View"
                className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shadow transition"
                onClick={() => setSelectedTicket(ticket)}
              >
                <HiEye size={20} />
              </button>
              <button
                aria-label="Respond"
                className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-2 rounded shadow transition"
                onClick={() => handleRespond(ticket)}
              >
                <HiReply size={20} />
              </button>
              <button
                aria-label="Delete"
                className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow transition"
                onClick={() => handleDeleteTicket(ticket.id)}
              >
                <HiTrash size={20} />
              </button>
            </div>
          </div>
        ))}

      {/* Modal for viewing ticket */}
      {selectedTicketData && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedTicket(null)}
              aria-label="Close"
            >
              <HiX size={24} />
            </button>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg font-semibold">
                #{selectedTicketData.id}
              </span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  priorityColors[selectedTicketData.priority]
                }`}
              >
                {selectedTicketData.priority}
              </span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  statusColors[selectedTicketData.status]
                }`}
              >
                {selectedTicketData.status}
              </span>
            </div>
            <div className="text-xl font-bold mb-2">
              {selectedTicketData?.ai_results?.[0]?.summary ? (
                <>
                  <span className="block text-gray-500 text-sm mb-1">
                    AI Summary:
                  </span>
                  <span className="block text-lg text-gray-800 mb-2">
                    {selectedTicketData.ai_results[0].summary}
                  </span>
                  <span className="block text-gray-400 text-xs mb-1">
                    Subject:
                  </span>
                  <span className="block text-base text-gray-900 mb-2">
                    {selectedTicketData.subject}
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-gray-400 text-xs mb-1">
                    Subject:
                  </span>
                  <span className="block text-base text-gray-900 mb-2">
                    {selectedTicketData?.subject}
                  </span>
                </>
              )}
            </div>
            <div className="text-gray-700 mb-4 whitespace-pre-line">
              <span className="block text-gray-400 text-xs mb-1">Message:</span>
              {selectedTicketData.message}
            </div>

            <div className="text-gray-500 text-sm mb-6">
              Created: {selectedTicketData.created}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                aria-label="Respond"
                className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-2 rounded shadow transition"
                onClick={() => handleRespond(selectedTicketData)}
              >
                <HiReply size={20} />
              </button>
              <button
                aria-label="Delete"
                className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow transition"
                onClick={() => handleDeleteTicket(selectedTicketData.id)}
              >
                <HiTrash size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for responding to ticket */}
      {conversationTicket && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] relative animate-fade-in flex flex-col">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setConversationTicket(null)}
              aria-label="Close"
            ></button>
            <Conversation
              ticketId={conversationTicket.id}
              isAdmin={true}
              onClose={() => setConversationTicket(null)}
            />
          </div>
        </div>
      )}

      {/* Modal for delete confirmation */}
      {deleteConfirmTicket && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <HiTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Ticket
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete ticket #{deleteConfirmTicket.id}
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDeleteTicket}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTicket}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketsList;
