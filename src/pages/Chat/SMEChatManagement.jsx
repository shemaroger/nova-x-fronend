import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    Send,
    Search,
    User,
    Building,
    Clock,
    CheckCircle,
    Check,
    CheckCheck,
    X,
    Loader,
    RefreshCw,
    ArrowLeft,
    DollarSign,
    Mail,
    Phone
} from 'lucide-react';
import {
    getChatRooms,
    getChatMessages,
    sendMessage,
    markMessagesAsRead,
    getInvestorUserDetail
} from '../Service/api';

const SMEChatManagement = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedInvestor, setSelectedInvestor] = useState(null);
    const [loadingInvestor, setLoadingInvestor] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize
    useEffect(() => {
        loadChatRooms();
        getCurrentUser();
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Poll for new messages every 3 seconds
    useEffect(() => {
        let interval;
        if (selectedChatRoom) {
            interval = setInterval(() => {
                loadMessages(selectedChatRoom.id);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedChatRoom]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getCurrentUser = () => {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        setCurrentUser(userData);
    };

    const loadChatRooms = async () => {
        try {
            const response = await getChatRooms();
            // Filter to only show chats where current user is SME
            const smeChats = (response.results || response || []).filter(room => {
                const currentUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
                return currentUserData.user_type === 'sme' &&
                    (room.user1?.id === currentUserData.id || room.user2?.id === currentUserData.id);
            });
            setChatRooms(smeChats);
        } catch (error) {
            console.error('Error loading chat rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (chatRoomId) => {
        try {
            const response = await getChatMessages(chatRoomId);
            setMessages(response || []);
            // Mark messages as read
            await markMessagesAsRead(chatRoomId);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const loadInvestorDetails = async (investorId) => {
        try {
            setLoadingInvestor(true);
            const investorData = await getInvestorUserDetail(investorId);
            setSelectedInvestor(investorData);
        } catch (error) {
            console.error('Error loading investor details:', error);
            setSelectedInvestor(null);
        } finally {
            setLoadingInvestor(false);
        }
    };

    const handleChatRoomSelect = async (chatRoom) => {
        setSelectedChatRoom(chatRoom);
        loadMessages(chatRoom.id);

        // Load investor details
        const investorUser = chatRoom.other_user?.user_type === 'investor'
            ? chatRoom.other_user
            : chatRoom.user1?.user_type === 'investor'
                ? chatRoom.user1
                : chatRoom.user2;

        if (investorUser) {
            loadInvestorDetails(investorUser.id);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChatRoom || sendingMessage) return;

        setSendingMessage(true);
        try {
            const message = await sendMessage(selectedChatRoom.id, newMessage.trim());
            setMessages(prev => [...prev, message]);
            setNewMessage('');

            // Update chat room list to show new message
            loadChatRooms();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    };

    const filteredChatRooms = chatRooms.filter(room => {
        const otherUser = room.other_user;
        const searchLower = searchTerm.toLowerCase();
        return (
            (otherUser?.business_name?.toLowerCase().includes(searchLower)) ||
            (otherUser?.email?.toLowerCase().includes(searchLower)) ||
            (otherUser?.display_name?.toLowerCase().includes(searchLower)) ||
            (room.last_message?.content?.toLowerCase().includes(searchLower))
        );
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600">Loading your chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className=" bg-gray-50">
            {/* Header */}
            <div className="">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <MessageCircle className="text-blue-600" size={32} />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">SME Chat Management</h1>
                                <p className="text-gray-600">Manage conversations with investors</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={loadChatRooms}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <RefreshCw size={16} className="mr-2" />
                                Refresh
                            </button>
                            <div className="text-sm text-gray-500">
                                {filteredChatRooms.length} conversation{filteredChatRooms.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex h-[calc(93vh-200px)] bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Chat List Sidebar */}
                    <div className="w-1/3 border-r border-gray-200 flex flex-col">
                        {/* Search */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search investors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Chat Room List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredChatRooms.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <MessageCircle className="mx-auto mb-3" size={48} />
                                    <p className="text-sm">No investor conversations yet</p>
                                    <p className="text-xs mt-1">Investors will appear here when they start conversations</p>
                                </div>
                            ) : (
                                filteredChatRooms.map((room) => (
                                    <div
                                        key={room.id}
                                        onClick={() => handleChatRoomSelect(room)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChatRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {/* Investor Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <User className="text-blue-600" size={20} />
                                            </div>

                                            {/* Chat Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {room.other_user?.business_name ||
                                                            room.other_user?.display_name ||
                                                            room.other_user?.email ||
                                                            'Unknown Investor'}
                                                    </p>
                                                    {room.last_message && (
                                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                                            {formatTimestamp(room.last_message.timestamp)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-1">
                                                    {room.last_message ? (
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {room.last_message.sender === currentUser?.email ? 'You: ' : ''}
                                                            {room.last_message.content}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-gray-400 italic">No messages yet</p>
                                                    )}

                                                    {room.unread_count > 0 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            {room.unread_count}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center mt-2 text-xs text-gray-400">
                                                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                                                        Investor
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedChatRoom ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="text-blue-600" size={18} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {selectedChatRoom.other_user?.business_name ||
                                                        selectedChatRoom.other_user?.display_name ||
                                                        selectedChatRoom.other_user?.email ||
                                                        'Unknown Investor'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Investor • {selectedChatRoom.other_user?.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Investor Details Button */}

                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                                            <p className="text-gray-500">No messages yet</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Start the conversation with this investor
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender.id === currentUser?.id ? 'justify-end' : 'justify-start'
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender.id === currentUser?.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-900'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs opacity-75">
                                                            {formatTimestamp(message.timestamp)}
                                                        </span>
                                                        {message.sender.id === currentUser?.id && (
                                                            <span className="text-xs opacity-75">
                                                                {message.is_read ? <CheckCheck size={12} /> : <Check size={12} />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                                            placeholder="Type your reply..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={sendingMessage}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={sendingMessage || !newMessage.trim()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {sendingMessage ? (
                                                <Loader className="animate-spin" size={16} />
                                            ) : (
                                                <Send size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* No Chat Selected */
                            <div className="flex-1 flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <MessageCircle className="mx-auto mb-4 text-gray-400" size={64} />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Select a conversation
                                    </h3>
                                    <p className="text-gray-500">
                                        Choose an investor conversation from the sidebar to start messaging
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </div>
    );
};

export default SMEChatManagement;