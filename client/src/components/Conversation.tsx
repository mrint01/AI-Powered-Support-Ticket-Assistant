import React, { useState, useRef, useEffect } from 'react';
import { useMessages } from '../hooks/useMessages';
import type { Message, MessageType } from '../hooks/useMessages';
import { useAuth } from '../AuthContext';
import { HiPaperAirplane, HiTrash, HiPencil } from 'react-icons/hi';
import FormatDate from '../utils/fct';

interface ConversationProps {
  ticketId: number;
  isAdmin?: boolean;
  onClose?: () => void;
}

const Conversation: React.FC<ConversationProps> = ({ ticketId, isAdmin = false, onClose }) => {
  const { messages, loading, error, sendMessage, updateMessage, deleteMessage } = useMessages(ticketId);
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageType: MessageType = isAdmin ? 'admin' : 'client';
    const success = await sendMessage(ticketId, user?.id || 0, newMessage.trim(), messageType);
    
    if (success) {
      setNewMessage('');
    }
  };

  const handleEditMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage || !editContent.trim()) return;

    const success = await updateMessage(editingMessage.id, editContent.trim());
    
    if (success) {
      setEditingMessage(null);
      setEditContent('');
    }
  };

  const startEditing = (message: Message) => {
    setEditingMessage(message);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  const canEditMessage = (message: Message) => {
    if (isAdmin) return true; // Admins can edit any message
    return message.senderId === user?.id; // Users can only edit their own messages
  };

  const canDeleteMessage = (message: Message) => {
    if (isAdmin) return true; // Admins can delete any message
    return message.senderId === user?.id; // Users can only delete their own messages
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading conversation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading conversation: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold">Conversation</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'admin'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'system'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {editingMessage?.id === message.id ? (
                  <form onSubmit={handleEditMessage} className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border rounded text-gray-800"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="text-sm opacity-75 mb-1">
                      {message.sender?.username || 'System'}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-75 mt-1">
                      <FormatDate dateString={message.createdAt} />
                    </div>
                    {(canEditMessage(message) || canDeleteMessage(message)) && (
                      <div className="flex gap-2 mt-2">
                        {canEditMessage(message) && (
                          <button
                            onClick={() => startEditing(message)}
                            className="text-xs opacity-75 hover:opacity-100"
                          >
                            <HiPencil size={12} />
                          </button>
                        )}
                        {canDeleteMessage(message) && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-xs opacity-75 hover:opacity-100"
                          >
                            <HiTrash size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={2}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiPaperAirplane size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Conversation; 