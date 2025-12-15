import * as React from "react";
import { HiEye, HiReply, HiX } from "react-icons/hi";
import { useTickets } from "../hooks/useTickets";
import { useAuth } from "../AuthContext";
import Conversation from "./Conversation";
import FormatDate from "../utils/fct";

type Ticket = {
  id: number;
  subject: string;
  status: string;
  created: string;
  message: string;
  response?: string;
};

type TicketWithAIResult = Ticket;

const statusColors: Record<string, string> = {
  Open: "bg-green-100 text-green-800",
  "In progress": "bg-blue-100 text-blue-800",
  Resolved: "bg-purple-100 text-purple-800",
  Closed: "bg-gray-100 text-gray-800",
};

const TicketsList: React.FC = () => {
  const { tickets, loading, error, updateTicket } = useTickets();
  const { user } = useAuth();
  const typedTickets = tickets as TicketWithAIResult[];
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(
    null
  );
  const [respondTicket, setRespondTicket] = React.useState<Ticket | null>(null);
  const [responseMsg, setResponseMsg] = React.useState("");
  const [closeConfirmTicket, setCloseConfirmTicket] =
    React.useState<Ticket | null>(null);
  const [conversationTicket, setConversationTicket] =
    React.useState<Ticket | null>(null);

  const sortedTickets = [...typedTickets].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );

  const handleRespond = (ticket: Ticket) => {
    setConversationTicket(ticket);
  };

  const handleCloseTicket = async (ticketId: number) => {
    const ticketToClose = typedTickets.find((t) => t.id === ticketId);
    if (ticketToClose) {
      setCloseConfirmTicket(ticketToClose);
    }
  };

  const confirmCloseTicket = () => {
    if (closeConfirmTicket) {
      updateTicket(closeConfirmTicket.id, { status: "closed" });
      setCloseConfirmTicket(null);
      setSelectedTicket(null);
      setRespondTicket(null);
    }
  };

  const cancelCloseTicket = () => {
    setCloseConfirmTicket(null);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (respondTicket) {
      await updateTicket(respondTicket.id, {
        response: responseMsg,
      });
      setRespondTicket(null);
      setSelectedTicket(null);
      setResponseMsg("");
    }
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
      <h2 className="text-2xl font-bold mb-4">Tickets List</h2>
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
                <span className="text-lg font-semibold">#{ticket.id}</span>

                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    statusColors[ticket.status]
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
              <div className="text-gray-800 font-bold text-xl mb-1">
                {ticket.subject}
              </div>
              <div className="text-gray-500 text-sm">
                Created: <FormatDate dateString={ticket.created} />
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
              {ticket.status.toLowerCase() !== "closed" && (
                <button
                  aria-label="Respond"
                  className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-2 rounded shadow transition"
                  onClick={() => handleRespond(ticket)}
                  disabled={ticket.status.toLowerCase() === "closed"}
                  style={{
                    opacity: ticket.status.toLowerCase() === "closed" ? 0.5 : 1,
                    cursor:
                      ticket.status.toLowerCase() === "closed"
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <HiReply size={20} />
                </button>
              )}
              {ticket.status.toLowerCase() !== "closed" && (
                <button
                  aria-label="Close"
                  className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white p-2 rounded shadow transition"
                  onClick={() => handleCloseTicket(ticket.id)}
                  disabled={ticket.status.toLowerCase() === "closed"}
                  style={{
                    opacity: ticket.status.toLowerCase() === "closed" ? 0.5 : 1,
                    cursor:
                      ticket.status.toLowerCase() === "closed"
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <HiX size={20} />
                </button>
              )}
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
                  statusColors[selectedTicketData.status]
                }`}
              >
                {selectedTicketData.status}
              </span>
            </div>
            <div className="text-xl font-bold mb-2">
              <span className="block text-gray-400 text-xs mb-1">Subject:</span>
              <span className="block text-base text-gray-900 mb-2">
                {selectedTicketData?.subject}
              </span>
            </div>
            <div className="text-gray-700 mb-4 whitespace-pre-line">
              <span className="block text-gray-400 text-xs mb-1">Message:</span>
              {selectedTicketData.message}
            </div>
            {selectedTicketData.response && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
                <div className="font-semibold text-blue-700 mb-1">
                  Response:
                </div>
                <div className="text-blue-900 whitespace-pre-line">
                  {selectedTicketData.response}
                </div>
              </div>
            )}
            <div className="text-gray-500 text-sm mb-6">
              Created: <FormatDate dateString={selectedTicketData.created} />
            </div>
            <div className="flex gap-2 justify-end">
              {selectedTicketData.status.toLowerCase() !== "closed" && (
                <>
                  <button
                    aria-label="Respond"
                    className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-2 rounded shadow transition"
                    onClick={() => handleRespond(selectedTicketData)}
                    disabled={
                      selectedTicketData.status.toLowerCase() === "closed"
                    }
                    style={{
                      opacity:
                        selectedTicketData.status.toLowerCase() === "closed"
                          ? 0.5
                          : 1,
                      cursor:
                        selectedTicketData.status.toLowerCase() === "closed"
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <HiReply size={20} />
                  </button>
                  <button
                    aria-label="Close"
                    className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white p-2 rounded shadow transition"
                    onClick={() => handleCloseTicket(selectedTicketData.id)}
                    disabled={
                      selectedTicketData.status.toLowerCase() === "closed"
                    }
                    style={{
                      opacity:
                        selectedTicketData.status.toLowerCase() === "closed"
                          ? 0.5
                          : 1,
                      cursor:
                        selectedTicketData.status.toLowerCase() === "closed"
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <HiX size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for responding to ticket */}
      {respondTicket && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setRespondTicket(null)}
              aria-label="Close"
            >
              <HiX size={24} />
            </button>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg font-semibold">#{respondTicket.id}</span>

              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  statusColors[respondTicket.status]
                }`}
              >
                {respondTicket.status}
              </span>
            </div>
            <div className="text-xl font-bold mb-2">
              {respondTicket.subject}
            </div>
            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <textarea
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                placeholder="Type your response..."
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow transition duration-200"
              >
                Send Response
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for closing ticket */}
      {closeConfirmTicket && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <HiX size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Close Ticket
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to close ticket #{closeConfirmTicket.id}?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelCloseTicket}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCloseTicket}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
                >
                  Close
                </button>
              </div>
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
              isAdmin={false}
              onClose={() => setConversationTicket(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsList;
