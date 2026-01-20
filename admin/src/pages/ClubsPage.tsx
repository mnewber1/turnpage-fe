import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BookClub, Message } from '../types';

export function ClubsPage() {
  const [clubs, setClubs] = useState<BookClub[]>([]);
  const [selectedClub, setSelectedClub] = useState<BookClub | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const data = await api.getClubs();
        setClubs(data);
      } catch (error) {
        console.error('Failed to load clubs:', error);
      }
      setIsLoading(false);
    };
    loadClubs();
  }, []);

  const loadMessages = async (club: BookClub) => {
    setSelectedClub(club);
    setMessagesLoading(true);
    try {
      const data = await api.getClubMessages(club.id);
      setMessages(data.content);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
    setMessagesLoading(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.deleteMessage(messageId);
      setMessages(messages.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="flex gap-6">
      {/* Clubs list */}
      <div className="w-1/3">
        <h2 className="text-lg font-bold mb-4">Clubs ({clubs.length})</h2>
        <div className="bg-white rounded-lg shadow divide-y max-h-[calc(100vh-200px)] overflow-auto">
          {clubs.map((club) => (
            <div
              key={club.id}
              onClick={() => loadMessages(club)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedClub?.id === club.id ? 'bg-primary-50' : ''}`}
            >
              <p className="font-medium">{club.name}</p>
              <p className="text-sm text-gray-500 truncate">{club.description || 'No description'}</p>
              <div className="flex gap-2 mt-1">
                {club.isPrivate && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Private</span>}
                {club.isCommunity && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Community</span>}
                {!club.isActive && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Inactive</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1">
        {selectedClub ? (
          <>
            <h2 className="text-lg font-bold mb-4">Messages in {selectedClub.name}</h2>
            {messagesLoading ? (
              <div className="text-center py-8">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No messages</div>
            ) : (
              <div className="bg-white rounded-lg shadow divide-y max-h-[calc(100vh-200px)] overflow-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`p-4 ${message.isDeleted ? 'bg-gray-100' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{message.sender?.username || 'Unknown'}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                        {message.isReported && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded ml-2">Reported</span>
                        )}
                        {message.isDeleted && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2">Deleted</span>
                        )}
                      </div>
                      {!message.isDeleted && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-gray-700">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">Select a club to view messages</div>
        )}
      </div>
    </div>
  );
}
