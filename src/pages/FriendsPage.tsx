import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Check, X, Trash2, Clock, Send } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';

export function FriendsPage() {
  const navigate = useNavigate();
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriends();

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      await sendRequest(email.trim());
      setSuccess(`Friend request sent to ${email.trim()}`);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (request: typeof incomingRequests[0]) => {
    try {
      await acceptRequest(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineRequest(requestId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline request');
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await removeFriend(friendshipId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove friend');
    }
  };

  const handleViewFriend = (friendUid: string) => {
    navigate(`/expenses?friend=${friendUid}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-8">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-semibold text-gray-100">Friends</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Add Friend */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Friend
          </h2>
          <form onSubmit={handleSendRequest} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-sm"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
          {success && (
            <p className="mt-2 text-sm text-green-400">{success}</p>
          )}
        </div>

        {/* Incoming Requests */}
        {incomingRequests.length > 0 && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
              <h2 className="font-medium text-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                Pending Requests ({incomingRequests.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {request.fromPhotoURL ? (
                      <img
                        src={request.fromPhotoURL}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 text-sm font-medium">
                        {request.fromDisplayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-100">
                        {request.fromDisplayName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {request.fromEmail}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request)}
                      className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Accept"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDecline(request.id)}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Decline"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outgoing Requests */}
        {outgoingRequests.length > 0 && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
              <h2 className="font-medium text-gray-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Sent Requests ({outgoingRequests.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {outgoingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="text-sm text-gray-300">
                    Waiting for <span className="font-medium text-gray-100">{request.toEmail}</span>
                  </div>
                  <span className="text-xs text-yellow-400 px-2 py-1 bg-yellow-900/30 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
            <h2 className="font-medium text-gray-100">
              Friends ({friends.length})
            </h2>
          </div>
          {loading ? (
            <div className="py-8 text-center text-gray-400">Loading...</div>
          ) : friends.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              No friends yet. Add someone by email above!
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {friends.map((friend) => (
                <div
                  key={friend.uid}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-700/50 transition-colors"
                >
                  <button
                    onClick={() => handleViewFriend(friend.uid)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {friend.photoURL ? (
                      <img
                        src={friend.photoURL}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-medium">
                        {friend.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-100">
                        {friend.displayName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {friend.email}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(friend.friendshipId)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Remove friend"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
