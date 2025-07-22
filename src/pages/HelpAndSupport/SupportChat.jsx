import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    Send,
    Clock,
    User,
    RefreshCw,
    HelpCircle,
    Shield
} from 'lucide-react';

import { getAllChats, sendquely } from '../Service/api';

const SupportChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    // Mock current user - replace with actual auth context
    useEffect(() => {
        setCurrentUser({
            id: 1,
            username: 'current_user',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
        });
    }, []);

    // Fetch all messages
    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const data = await getAllChats();
            const allMessages = data.results || data;

            // Sort messages by timestamp
            const sortedMessages = allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(sortedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load messages on component mount
    useEffect(() => {
        if (currentUser) {
            fetchMessages();
        }
    }, [currentUser]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle sending new message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            // For now, we'll send to admin (you can modify this to get admin ID)
            const messageData = {
                receiver: 2, // Assuming admin has ID 2, modify as needed
                message: newMessage.trim()
            };

            const sentMessage = await sendquely(messageData);

            // Add the new message to the list
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
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

    // Check if message is from current user
    const isMyMessage = (message) => {
        return message.sender.id === currentUser?.id;
    };

    // Check if message has a reply
    const hasReply = (message) => {
        return message.reply_message && message.reply_message.trim() !== '';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
                {/* Header */}
                <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Support Chat</h1>
                            <p className="text-gray-600">Send us a message and we'll get back to you</p>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="bg-white shadow-sm">
                    <div className="h-96 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                                <p className="text-gray-600 text-center">
                                    Start a conversation by sending a message below.<br />
                                    Our support team will respond as soon as possible.
                                </p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <div key={message.id} className="space-y-3">
                                        {/* Original Message */}
                                        <div className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-md px-4 py-3 rounded-lg ${isMyMessage(message)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                                }`}>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <User className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        {isMyMessage(message)
                                                            ? 'You'
                                                            : `${message.sender.first_name} ${message.sender.last_name}` || message.sender.username
                                                        }
                                                    </span>
                                                    {!isMyMessage(message) && (
                                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                            Support
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm leading-relaxed">{message.message}</p>
                                                <div className={`flex items-center justify-end mt-2 text-xs ${isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                                                    }`}>
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {formatTime(message.timestamp)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Admin Reply - Only show if reply exists */}
                                        {hasReply(message) && (
                                            <div className="flex justify-start ml-8">
                                                <div className="max-w-md px-4 py-3 rounded-lg bg-green-50 border-l-4 border-green-400 text-gray-900">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <Shield className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm font-medium text-green-800">
                                                            Support Team Reply
                                                        </span>
                                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                            Admin
                                                        </span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-gray-800">
                                                        {message.reply_message}
                                                    </p>
                                                    <div className="flex items-center justify-end mt-2 text-xs text-gray-500">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Reply sent
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                </div>

                {/* Message Input */}
                <div className="bg-white rounded-b-lg shadow-sm border-t border-gray-200 p-6">
                    <form onSubmit={handleSendMessage} className="space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-3">
                                Your Message
                            </label>

                            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                                <textarea
                                    id="message"
                                    rows={5}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-1 resize-none px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                    disabled={isSending}
                                />

                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                >
                                    {isSending ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Send</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            <p>💡 <strong>Tip:</strong> Be as detailed as possible to help us assist you better.</p>
                        </div>
                    </form>
                </div>

                {/* Status/Info Section */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-blue-900">Response Time</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Our support team typically responds within 2-4 hours during business hours (9 AM - 6 PM, Monday - Friday).
                                For urgent issues, please call our support hotline.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SupportChatPage;