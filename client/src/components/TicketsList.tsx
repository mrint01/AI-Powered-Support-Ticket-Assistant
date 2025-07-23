import * as React from 'react';
import { HiEye, HiReply, HiTrash, HiX } from 'react-icons/hi';
import { useTickets } from '../hooks/useTickets';

type Priority = 'high' | 'medium' | 'low';

type Ticket = {
  id: number;
  subject: string;
  status: string;
  created: string;
  priority: Priority;
  message: string;
  response?: string;
  ai_results?: { summary?: string }[];
};

type TicketWithAIResult = Ticket & { ai_results?: { summary?: string }[] };

const statusColors: Record<string, string> = {
  Open: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Closed: 'bg-gray-100 text-gray-800',
};
const priorityColors: Record<Priority, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
};
const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const TicketsList: React.FC = () => {
  const { tickets, loading, error, deleteTicket, updateTicket } = useTickets();
  const typedTickets = tickets as TicketWithAIResult[];
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [respondTicket, setRespondTicket] = React.useState<Ticket | null>(null);
  const [responseMsg, setResponseMsg] = React.useState('');

  const sortedTickets = [...typedTickets].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const handleRespond = (ticket: Ticket) => {
    setRespondTicket(ticket);
    setResponseMsg('');
  };

  const handleDeleteTicket = (ticketId: number) => {
    deleteTicket(ticketId);
    setSelectedTicket(null);
    setRespondTicket(null);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (respondTicket) {
      await updateTicket(respondTicket.id, { status: 'closed', response: responseMsg });
      setRespondTicket(null);
      setSelectedTicket(null);
      setResponseMsg('');
    }
  };

  // Find the latest selected ticket from state (to get updated response)
  const selectedTicketData = selectedTicket ? typedTickets.find((t: TicketWithAIResult) => t.id === selectedTicket.id) : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Tickets List</h2>
      {loading && <div>Loading tickets...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && sortedTickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-lg transition"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold">#{ticket.id}</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status]}`}>{ticket.status}</span>
            </div>
            <div className="text-gray-800 font-bold text-xl mb-1">
              {ticket.ai_results?.[0]?.summary
                ? ticket.ai_results[0].summary
                : ticket.subject}
            </div>
            <div className="text-gray-500 text-sm">Created: {ticket.created}</div>
          </div>
          <div className="flex gap-2 self-end md:self-auto">
            <button aria-label="View" className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shadow transition" onClick={() => setSelectedTicket(ticket)}>
              <HiEye size={20} />
            </button>
            <button aria-label="Respond" className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-2 rounded shadow transition" onClick={() => handleRespond(ticket)}>
              <HiReply size={20} />
            </button>
            <button aria-label="Delete" className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow transition" onClick={() => handleDeleteTicket(ticket.id)}>
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
              <span className="text-lg font-semibold">#{selectedTicketData.id}</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[selectedTicketData.priority]}`}>{selectedTicketData.priority}</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedTicketData.status]}`}>{selectedTicketData.status}</span>
            </div>
            <div className="text-xl font-bold mb-2">
              {selectedTicketData?.ai_results?.[0]?.summary ? (
                <>
                  <span className="block text-gray-500 text-sm mb-1">AI Summary:</span>
                  <span className="block text-lg text-gray-800 mb-2">{selectedTicketData.ai_results[0].summary}</span>
                  <span className="block text-gray-400 text-xs mb-1">Subject:</span>
                  <span className="block text-base text-gray-900 mb-2">{selectedTicketData.subject}</span>
                </>
              ) : (
               <>
                <span className="block text-gray-400 text-xs mb-1">Subject:</span>
                <span className="block text-base text-gray-900 mb-2">{selectedTicketData?.subject}</span>
                </>
              )}
            </div>
            <div className="text-gray-700 mb-4 whitespace-pre-line">
            <span className="block text-gray-400 text-xs mb-1">Message:</span>
            {selectedTicketData.message}</div>
            {selectedTicketData.response && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
                <div className="font-semibold text-blue-700 mb-1">Response:</div>
                <div className="text-blue-900 whitespace-pre-line">{selectedTicketData.response}</div>
              </div>
            )}
            <div className="text-gray-500 text-sm mb-6">Created: {selectedTicketData.created}</div>
            <div className="flex gap-2 justify-end">
              <button aria-label="Respond" className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-2 rounded shadow transition" onClick={() => handleRespond(selectedTicketData)}>
                <HiReply size={20} />
              </button>
              <button aria-label="Delete" className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow transition" onClick={() => handleDeleteTicket(selectedTicketData.id)}>
                <HiTrash size={20} />
              </button>
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
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[respondTicket.priority]}`}>{respondTicket.priority}</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[respondTicket.status]}`}>{respondTicket.status}</span>
            </div>
            <div className="text-xl font-bold mb-2">{respondTicket.subject}</div>
            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <textarea
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                placeholder="Type your response..."
                value={responseMsg}
                onChange={e => setResponseMsg(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow transition duration-200"
              >
                Send Response & Close Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsList; 