import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Message } from '../types';

export function ReportedPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReportedMessages(page);
      setMessages(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load reported messages:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [page]);

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.deleteMessage(messageId);
      loadMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleDismiss = async (messageId: string) => {
    try {
      await api.dismissReport(messageId);
      loadMessages();
    } catch (error) {
      console.error('Failed to dismiss report:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reported Messages</h1>

      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
          No reported messages
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow divide-y">
            {messages.map((message) => (
              <div key={message.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{message.sender?.username || 'Unknown'}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded ml-2">
                      Reported {message.reportedAt ? new Date(message.reportedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDismiss(message.id)}
                      className="text-gray-600 hover:text-gray-800 text-sm px-3 py-1 border rounded"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-gray-700 bg-gray-50 p-3 rounded">{message.content}</p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
