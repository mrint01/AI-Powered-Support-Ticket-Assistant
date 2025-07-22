import { useEffect, useState } from "react";

export type Ticket = {
  id: number;
  subject: string;
  status: string;
  created: string;
  priority: "high" | "medium" | "low";
  message: string;
  response?: string;
};

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/tickets`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tickets");
        return res.json();
      })
      .then((data) => {
        const mapped = data.map((t: any) => ({
          id: t.id,
          subject: t.title,
          status:
            t.status.charAt(0).toUpperCase() +
            t.status.slice(1).replace("_", " "),
          created: t.createdAt
            ? new Date(t.createdAt).toISOString().slice(0, 16).replace('T', ' ')
            : "",
          priority: t.priority,
          message: t.description,
          response: t.response,
        }));
        setTickets(mapped);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const deleteTicket = async (id: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/tickets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete ticket");
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateTicket = async (
    id: number,
    updates: Partial<Pick<Ticket, "status" | "response">>
  ) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update ticket");
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createTicket = async (ticketData: Partial<Ticket>) => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      // Map frontend fields to backend fields
      const backendData = {
        title: ticketData.subject,
        description: ticketData.message,
        status: ticketData.status,
        priority: ticketData.priority,
      };
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendData),
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      const newTicket = await res.json();
      setTickets((prev) => [...prev, {
        id: newTicket.id,
        subject: newTicket.title,
        status: newTicket.status.charAt(0).toUpperCase() + newTicket.status.slice(1).replace("_", " "),
        created: newTicket.createdAt ? new Date(newTicket.createdAt).toISOString().slice(0, 16).replace('T', ' ') : "",
        priority: newTicket.priority,
        message: newTicket.description,
        response: newTicket.response,
      }]);
      return newTicket;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { tickets, loading, error, deleteTicket, updateTicket, createTicket };
}
