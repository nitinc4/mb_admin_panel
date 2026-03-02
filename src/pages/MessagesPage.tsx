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

  useEffect(() => {
    if (socket && selectedBatch) {
      setMessages([]); 
      fetch(`${API_URL}/api/messages/batch/${selectedBatch.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setMessages(data.data); })
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
    
    // FIX: Removed the optimistic UI update that was causing the duplicate message.
    // The message will now render once the socket server bounces it back via 'receive_message'.
    
    setNewMessage('');
  };

  const filteredBatches = batches.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col bg-cream">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate directly with your Batches in real-time.</p>
      </div>

      <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 min-h-0">
        
        {/* LEFT SIDEBAR */}
        <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search batches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredBatches.map(batch => (
              <button key={batch.id} onClick={() => setSelectedBatch(batch)} className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${selectedBatch?.id === batch.id ? 'bg-primary text-white shadow-md' : 'hover:bg-orange-50/50 text-gray-700'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedBatch?.id === batch.id ? 'bg-white/20' : 'bg-orange-100 text-primary'}`}><Users size={20} /></div>
                <div className="font-bold truncate">{batch.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT CHAT AREA */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedBatch ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-primary flex items-center justify-center"><Users size={20} /></div>
                <div><h2 className="font-bold text-gray-800 text-lg">{selectedBatch.name}</h2><p className="text-xs font-semibold text-gray-500">Group Chat</p></div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-[#FFFDF5] space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((msg, idx) => {
                    const isAdmin = msg.senderRole === 'admin';
                    const msgKey = msg.id || msg._id || idx;
                    return (
                      <div key={msgKey} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`text-xs text-gray-500 mb-1 flex items-center gap-1.5`}>
                          <span className="font-bold text-gray-700">{msg.senderName}</span>
                          {isAdmin && <span className="bg-orange-100 text-primary text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>}
                          <span className="font-medium">• {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl max-w-[70%] shadow-sm text-sm font-medium ${isAdmin ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 bg-gray-50 border-gray-200 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary border rounded-full px-5 py-3 outline-none transition-all font-medium" />
                <button type="submit" disabled={!newMessage.trim()} className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:shadow-none">
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Users size={64} className="mb-4 text-gray-200" />
              <p className="text-lg font-bold text-gray-400">Select a batch to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}