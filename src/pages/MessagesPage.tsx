import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Users, Search } from 'lucide-react';
import { API_URL } from '../config';

interface Batch { id: string; name: string; }
interface Message { id?: string; _id?: string; batchId: string; senderName: string; senderRole: string; text: string; createdAt: string; }

export default function MessagesPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Init socket and batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`${API_URL}/api/batches`);
        const data = await res.json();
        if (data.success) setBatches(data.data);
      } catch (error) { console.error('Error fetching batches:', error); }
    };
    fetchBatches();

    const newSocket = io(`${API_URL}`);
    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, []);

  // Fetch history and join room when batch changes
  useEffect(() => {
    if (socket && selectedBatch) {
      setMessages([]); // Clear previous messages while loading
      fetch(`${API_URL}/api/messages/batch/${selectedBatch.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setMessages(data.data);
        })
        .catch(err => console.error("Error fetching messages:", err));

      socket.emit('join_batch', selectedBatch.id);

      const messageListener = (message: Message) => {
        setMessages((prev) => [...prev, message]);
      };

      socket.on('receive_message', messageListener);
      return () => { socket.off('receive_message', messageListener); };
    }
  }, [socket, selectedBatch]);

const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedBatch || !socket) return;

    const messageData = {
      batchId: selectedBatch.id,
      senderName: "Admin",
      senderRole: "admin",
      text: newMessage
    };

    socket.emit('send_message', messageData);
    
    // ADD THIS LINE: Optimistically add the message to the screen instantly
    setMessages((prev) => [...prev, { ...messageData, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    
    setNewMessage('');
  };

  const filteredBatches = batches.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate directly with your Batches in real-time.</p>
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 min-h-0">
        
        {/* LEFT SIDEBAR */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search batches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredBatches.map(batch => (
              <button key={batch.id} onClick={() => setSelectedBatch(batch)} className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${selectedBatch?.id === batch.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-800'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedBatch?.id === batch.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}><Users size={20} /></div>
                <div className="font-medium truncate">{batch.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT CHAT AREA */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedBatch ? (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={20} /></div>
                <div><h2 className="font-bold text-gray-800">{selectedBatch.name}</h2><p className="text-xs text-gray-500">Group Chat</p></div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((msg, idx) => {
                    const isAdmin = msg.senderRole === 'admin';
                    const msgKey = msg.id || msg._id || idx;
                    return (
                      <div key={msgKey} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`text-xs text-gray-500 mb-1 flex items-center gap-1`}>
                          <span className="font-medium text-gray-700">{msg.senderName}</span>
                          {isAdmin && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Admin</span>}
                          <span>• {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl max-w-[70%] shadow-sm ${isAdmin ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
                <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 border rounded-full px-4 py-3 outline-none transition-colors" />
                <button type="submit" disabled={!newMessage.trim()} className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50">
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Users size={64} className="mb-4 text-gray-200" />
              <p className="text-lg font-medium">Select a batch to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}