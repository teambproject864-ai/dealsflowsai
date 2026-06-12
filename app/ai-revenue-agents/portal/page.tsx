'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase-client';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { AGENT_FULL_NAMES } from '@/lib/types';
import type { AgentSession } from '@/lib/types';

export default function AIRevenueAgentPortal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AgentSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Authorized agents emails
  const authorizedAgentEmails = useMemo(() => [
    'praneeth@growstack.ai',
    'praneethburada@gmail.com',
    'teambproject864@gmail.com'
    // Add more agent emails here as needed
  ], []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        if (authorizedAgentEmails.includes(authUser.email || '')) {
          setUser(authUser);
        } else {
          // Not an authorized agent, redirect home
          router.push('/');
        }
      } else {
        // Not logged in, redirect home or to sign in
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [router, authorizedAgentEmails]);

  // Listen to agent sessions
  useEffect(() => {
    if (!user) return;

    // Find agent key based on email (simplified)
    const agentKeyFromEmail = () => {
      if (user.email?.includes('praneeth')) return 'praneeth_burada';
      // Add mappings for other agents as needed
      return 'praneeth_burada'; // Default
    };

    const q = query(
      collection(db, 'agentSessions'),
      where('agentKey', '==', agentKeyFromEmail()),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeSessions = onSnapshot(q, (snapshot) => {
      const fetchedSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AgentSession));
      setSessions(fetchedSessions);
    });

    return () => unsubscribeSessions();
  }, [user]);

  // Listen to messages for selected session
  useEffect(() => {
    if (!selectedSession?.id) return;

    const q = query(
      collection(db, 'agentSessions', selectedSession.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribeMessages();
  }, [selectedSession?.id]);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession?.id || !user) return;

    try {
      await addDoc(collection(db, 'agentSessions', selectedSession.id, 'messages'), {
        text: newMessage.trim(),
        sender: 'agent',
        senderName: user.displayName || 'Agent',
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, 'agentSessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'ended',
        endedAt: new Date().toISOString()
      });
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  const startVoiceCall = () => {
    alert('Voice call feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">AI Revenue Agent Portal</h1>
          <p className="text-slate-300 mb-6">Only authorized agents can access this portal</p>
          <button
            onClick={handleSignIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Revenue Agent Portal
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">
              Welcome, {user.displayName || user.email}
            </span>
            <button
              onClick={() => auth.signOut()}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-white mb-4">Active Sessions</h2>
          <div className="space-y-3">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedSession?.id === session.id
                    ? 'bg-blue-900/50 border-blue-500'
                    : session.status === 'active'
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white">{session.companyName}</h3>
                    <p className="text-sm text-slate-400">
                      {AGENT_FULL_NAMES[session.agentKey] || session.agentKey}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    session.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-600/20 text-slate-400'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Started: {new Date(session.startedAt || '').toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat/Call Interface */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedSession.companyName}
                  </h2>
                  <p className="text-sm text-slate-400">Session ID: {selectedSession.id}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={startVoiceCall}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    🔊 Voice Call
                  </button>
                  {selectedSession?.id && selectedSession.status === 'active' && (
                    <button
                      onClick={() => selectedSession.id && endSession(selectedSession.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      End Session
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-12">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === 'agent'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}>
                        <div className="text-xs opacity-75 mb-1">
                          {msg.senderName}
                        </div>
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Select a Session</h3>
              <p className="text-slate-400">Choose an active session to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
