import * as React from 'react';
import { useTickets } from '../hooks/useTickets';



interface ValidationErrors {
  subject?: string;
  description?: string;
}

const TicketForm: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [ticketNumber, setTicketNumber] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { createTicket } = useTickets();
  const [form, setForm] = React.useState({ subject: '', description: '' });
  const [errors, setErrors] = React.useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate subject (title)
    if (!form.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (form.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters long';
    } else if (form.subject.length > 200) {
      newErrors.subject = 'Subject must not exceed 200 characters';
    }

    // Validate description
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    } else if (form.description.length > 5000) {
      newErrors.description = 'Description must not exceed 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // here should call the OpenAI to process the ticket and get the priority
      const newTicket = await createTicket({
        subject: form.subject.trim(),
        message: form.description.trim(),
        // status and priority are set by the backend (status defaults to 'open', priority from OpenAI)
      });
      if (newTicket?.id) {
        setTicketNumber(newTicket.id);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
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
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 text-gray-900 ${
              errors.subject
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Enter ticket subject"
            value={form.subject}
            onChange={handleChange}
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
          {form.subject.length > 0 && !errors.subject && (
            <p className="mt-1 text-xs text-gray-500">
              {form.subject.length}/200 characters
            </p>
          )}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 text-gray-900 ${
              errors.description
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Describe your issue..."
            value={form.description}
            onChange={handleChange}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          {form.description.length > 0 && !errors.description && (
            <p className="mt-1 text-xs text-gray-500">
              {form.description.length}/5000 characters
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md shadow transition duration-200 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Submitting...</span>
            </>
          ) : (
            'Submit Ticket'
          )}
        </button>
      </form>
    </div>
  );
};

export default TicketForm; 