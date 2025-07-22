import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    Send,
    Search,
    Clock,
    User,
    RefreshCw,
    Shield,
    AlertCircle,
    CheckCircle,
    Filter,
    MessageSquare,
    Reply,
    Users,
    Eye,
    Archive,
    Edit
} from 'lucide-react';

import { get_conversation, updateMessage } from '../Service/api';

const AdminSupportChatPage = () => {
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, replied, pending
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [isEditingReply, setIsEditingReply] = useState(false);

    // Mock current admin - replace with actual auth context
    useEffect(() => {
        setCurrentAdmin({
            id: 2, // Admin ID
            username: 'admin',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@example.com'
        });
    }, []);

    // Fetch all support chats
    const fetchChats = async () => {
        setIsLoading(true);
        try {
            const data = await get_conversation();
            const allChats = data.results || data;

            // Sort chats by timestamp (newest first)
            const sortedChats = allChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setChats(sortedChats);
            setFilteredChats(sortedChats);
        } catch (error) {
            console.error('Error fetching chats:', error);
            setChats([]);
            setFilteredChats([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load chats on component mount
    useEffect(() => {
        if (currentAdmin) {
            fetchChats();
        }
    }, [currentAdmin]);

    // Reset edit mode when selecting a different chat
    useEffect(() => {
        setIsEditingReply(false);
        setReplyMessage('');
    }, [selectedChat]);

    // Filter chats based on search and status
    useEffect(() => {
        let filtered = chats;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(chat =>
                chat.sender.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chat.sender.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chat.sender.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chat.message?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'replied') {
                filtered = filtered.filter(chat => chat.reply_message && chat.reply_message.trim() !== '');
            } else if (statusFilter === 'pending') {
                filtered = filtered.filter(chat => !chat.reply_message || chat.reply_message.trim() === '');
            }
        }

        setFilteredChats(filtered);
    }, [chats, searchTerm, statusFilter]);

    // Handle sending reply
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedChat || isSending) return;

        setIsSending(true);
        try {
            const updatedData = {
                id: selectedChat.id,
                reply_message: replyMessage.trim()
            };
            console.log('Sending reply:', updatedData)

            await updateMessage(updatedData);

            setChats(prev =>
                prev.map(chat =>
                    chat.id === selectedChat.id
                        ? { ...chat, reply_message: replyMessage.trim() }
                        : chat
                )
            );

            setSelectedChat(prev => ({ ...prev, reply_message: replyMessage.trim() }));
            setReplyMessage('');
            setIsEditingReply(false); // Exit edit mode after sending

            alert('Reply sent successfully!');
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Failed to send reply. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    // Handle edit reply
    const handleEditReply = () => {
        setReplyMessage(selectedChat.reply_message || '');
        setIsEditingReply(true);
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setReplyMessage('');
        setIsEditingReply(false);
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get chat status
    const getChatStatus = (chat) => {
        return chat.reply_message && chat.reply_message.trim() !== '' ? 'replied' : 'pending';
    };

    // Get status badge
    const getStatusBadge = (status) => {
        if (status === 'replied') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Replied
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pending
                </span>
            );
        }
    };

    // Get stats
    const getStats = () => {
        const total = chats.length;
        const replied = chats.filter(chat => getChatStatus(chat) === 'replied').length;
        const pending = chats.filter(chat => getChatStatus(chat) === 'pending').length;
        return { total, replied, pending };
    };

    // Check if reply exists (helper function)
    const hasReply = (chat) => {
        return chat.reply_message && chat.reply_message.trim() !== '';
    };

    const stats = getStats();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading support chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Support Chat</h1>
                                <p className="text-gray-600">Manage and reply to user support messages</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchChats}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>


                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="replied">Replied</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Messages List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Support Messages</h2>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {filteredChats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                                    <MessageCircle className="w-12 h-12 mb-4" />
                                    <p className="text-lg font-medium">No messages found</p>
                                    <p className="text-sm">No support messages match your current filters</p>
                                </div>
                            ) : (
                                filteredChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {chat.sender.first_name?.[0]?.toUpperCase() ||
                                                        chat.sender.username?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-medium text-gray-900 truncate">
                                                            {(chat.sender.first_name && chat.sender.last_name)
                                                                ? `${chat.sender.first_name} ${chat.sender.last_name}`
                                                                : chat.sender.username}
                                                        </h3>
                                                        {getStatusBadge(getChatStatus(chat))}
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate mt-1">
                                                        {chat.message.length > 50 ? `${chat.message.slice(0, 30)}...` : chat.message}
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatTime(chat.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Reply Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {selectedChat ? (
                            <>
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                                            {selectedChat.sender.first_name?.[0]?.toUpperCase() ||
                                                selectedChat.sender.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {(selectedChat.sender.first_name && selectedChat.sender.last_name)
                                                    ? `${selectedChat.sender.first_name} ${selectedChat.sender.last_name}`
                                                    : selectedChat.sender.username}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                {selectedChat.sender.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Original Message */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Original Message</h3>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-sm text-gray-800">{selectedChat.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Sent on {formatTime(selectedChat.timestamp)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Conditional Rendering based on reply_message status */}
                                    {hasReply(selectedChat) && !isEditingReply ? (
                                        // Display existing reply with edit option
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-medium text-gray-700">Admin Reply</h3>
                                                <button
                                                    onClick={handleEditReply}
                                                    className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3">
                                                <p className="text-sm text-gray-800">{selectedChat.reply_message}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        // Show reply form (either new reply or edit mode)
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-medium text-gray-700">
                                                    {isEditingReply ? 'Edit Reply' : 'Send Reply'}
                                                </h3>
                                                {isEditingReply && (
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                            <form onSubmit={handleSendReply} className="space-y-3">
                                                <textarea
                                                    value={replyMessage}
                                                    onChange={(e) => setReplyMessage(e.target.value)}
                                                    placeholder="Type your reply here..."
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    disabled={isSending}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!replyMessage.trim() || isSending}
                                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                                                >
                                                    {isSending ? (
                                                        <>
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                            <span>Sending...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Reply className="w-4 h-4" />
                                                            <span>{isEditingReply ? 'Update Reply' : 'Send Reply'}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-gray-500 h-full">
                                <Reply className="w-16 h-16 mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Message</h3>
                                <p className="text-gray-600 text-center">
                                    Choose a message from the list to view details and send a reply.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSupportChatPage;