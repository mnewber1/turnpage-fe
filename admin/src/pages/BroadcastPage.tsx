import { useState } from 'react';
import { api } from '../services/api';

export function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to send this notification to ALL users?')) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await api.sendBroadcast(title, body);
      setResult({
        success: true,
        message: `Notification sent to ${response.sentCount} devices`,
      });
      setTitle('');
      setBody('');
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to send notification',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Broadcast Notification</h1>

      <div className="bg-white rounded-lg shadow p-6">
        {result && (
          <div className={`mb-4 p-3 rounded-lg ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Notification title"
              required
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Notification message"
              required
            />
            <p className="text-xs text-gray-400 mt-1">{body.length}/500</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This will send a push notification to ALL users with active device tokens.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !title || !body}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Broadcast'}
          </button>
        </form>
      </div>
    </div>
  );
}
