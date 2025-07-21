import * as React from 'react';

const getRandomTicketNumber = () => Math.floor(100000 + Math.random() * 900000);

const TicketForm: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [ticketNumber, setTicketNumber] = React.useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = getRandomTicketNumber();
    setTicketNumber(num);
    setSubmitted(true);
  };

  if (submitted && ticketNumber) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Ticket Submitted!</h2>
        <div className="text-lg mb-2">Your ticket number is:</div>
        <div className="text-3xl font-mono font-bold text-blue-700 mb-6">#{ticketNumber}</div>
        <div className="text-gray-600">Thank you for contacting support. We will get back to you soon.</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Submit a Ticket</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            placeholder="Enter ticket subject"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            placeholder="Describe your issue..."
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow transition duration-200"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
};

export default TicketForm; 