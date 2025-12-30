'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { Mail, MailOpen, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Message {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  service_interest?: string;
  is_read: boolean;
  is_processed: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/contact-messages');
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.messages || []);
      } else {
        setError(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateMessageStatus = async (
    id: number, 
    updates: { is_read?: boolean; is_processed?: boolean }
  ) => {
    try {
      const response = await fetch('/api/admin/contact-messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === id ? { ...msg, ...updates } : msg
          )
        );
      } else {
        alert(data.error || 'Failed to update message');
      }
    } catch (err) {
      console.error('Error updating message:', err);
      alert('Failed to update message');
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !msg.is_read;
    if (filter === 'read') return msg.is_read;
    if (filter === 'processed') return msg.is_processed;
    return true;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.is_read).length,
    processed: messages.filter(m => m.is_processed).length,
    pending: messages.filter(m => !m.is_processed).length
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <AdminLayout title="Messages">
      <div className="space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && messages.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw size={48} className="mx-auto mb-4 opacity-30 animate-spin" />
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Messages</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Mail size={32} className="text-blue-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Unread</p>
                <p className="text-3xl font-bold text-orange-600">{stats.unread}</p>
              </div>
              <MailOpen size={32} className="text-orange-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock size={32} className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Processed</p>
                <p className="text-3xl font-bold text-green-600">{stats.processed}</p>
              </div>
              <CheckCircle size={32} className="text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {['all', 'unread', 'read', 'processed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Messages ({filteredMessages.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Mail size={48} className="mx-auto mb-4 opacity-30" />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !msg.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{msg.name}</h3>
                        {!msg.is_read && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                            New
                          </span>
                        )}
                        {msg.is_processed && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-full">
                            Processed
                          </span>
                        )}
                        {msg.service_interest && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                            {msg.service_interest}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Email:</span>{' '}
                        <a href={`mailto:${msg.email}`} className="text-blue-600 hover:underline">
                          {msg.email}
                        </a>
                        {msg.phone && (
                          <span className="ml-4">
                            <span className="font-medium">Phone:</span>{' '}
                            <a href={`tel:${msg.phone}`} className="text-blue-600 hover:underline">
                              {msg.phone}
                            </a>
                          </span>
                        )}
                        {msg.company && (
                          <span className="ml-4">
                            <span className="font-medium">Company:</span> {msg.company}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                    
                    <div className="ml-6 text-right shrink-0">
                      <p className="text-xs text-gray-500 mb-3">
                        {formatDate(msg.created_at)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateMessageStatus(msg.id, { is_read: !msg.is_read })}
                          className={`p-2 rounded-lg transition-colors ${
                            msg.is_read
                              ? 'text-gray-400 hover:bg-gray-100'
                              : 'text-blue-600 hover:bg-blue-100'
                          }`}
                          title={msg.is_read ? 'Mark as unread' : 'Mark as read'}
                        >
                          <MailOpen size={18} />
                        </button>
                        <button
                          onClick={() => updateMessageStatus(msg.id, { is_processed: !msg.is_processed })}
                          className={`p-2 rounded-lg transition-colors ${
                            msg.is_processed
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={msg.is_processed ? 'Mark as not processed' : 'Mark as processed'}
                        >
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
