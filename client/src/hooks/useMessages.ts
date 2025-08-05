import { useState, useEffect } from 'react';

export type MessageType = 'client' | 'admin' | 'system';

export interface Message {
  id: number;
  ticketId: number;
  senderId: number | null;
  sender?: {
    id: number;
    username: string;
  };
  type: MessageType;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

const API_BASE_URL =  import.meta.env.VITE_API_URL;

export const useMessages = (ticketId?: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async (ticketId: number, includeInternal: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/ticket/${ticketId}?includeInternal=${includeInternal}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    ticketId: number,
    senderId: number,
    content: string,
    type: MessageType,
    isInternal: boolean = false
  ): Promise<Message | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          senderId,
          content,
          type,
          isInternal,
        }),
        credentials: 'include',
        
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    }
  };

  const updateMessage = async (messageId: number, content: string): Promise<Message | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      const updatedMessage = await response.json();
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? updatedMessage : msg)
      );
      return updatedMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
      return null;
    }
  };

  const deleteMessage = async (messageId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      return false;
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchMessages(ticketId);
    }
  }, [ticketId]);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
}; 