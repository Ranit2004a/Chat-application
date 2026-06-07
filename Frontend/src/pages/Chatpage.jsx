import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

function Chatpage() {
  const {
    users,
    conversations,
    messages,
    selectedUser,
    isUsersLoading,
    isConversationsLoading,
    isMessagesLoading,
    isSending,
    getUsers,
    getConversations,
    getMessages,
    sendMessage,
    setSelectedUser,
  } = useChatStore();

  const { authUser, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'contacts' | 'groups' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch users & conversations on mount and poll conversations
  useEffect(() => {
    getUsers();
    getConversations();

    const convInterval = setInterval(() => {
      getConversations();
    }, 6000);

    return () => clearInterval(convInterval);
  }, [getUsers, getConversations]);

  // Poll messages for the active conversation
  useEffect(() => {
    if (!selectedUser) return;
    
    getMessages(selectedUser._id);

    const msgInterval = setInterval(() => {
      getMessages(selectedUser._id);
    }, 4000);

    return () => clearInterval(msgInterval);
  }, [selectedUser, getMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMessagesLoading]);

  // Handle image attachment selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    // Limit to 1MB to prevent large uploads from stalling
    if (file.size > 1024 * 1024) {
      toast.error('Image size must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle message submit
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !imagePreview) return;

    const messageData = {
      text: inputText.trim(),
      image: imagePreview || undefined,
    };

    setInputText('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    await sendMessage(messageData);
  };

  // Helper to render user avatars
  const renderAvatar = (user, size = "w-10 h-10") => {
    if (user?.profilePic) {
      return (
        <img
          src={user.profilePic}
          alt={user.fullName}
          className={`${size} rounded-full object-cover border border-outline-variant`}
        />
      );
    }
    const initials = user?.fullName
      ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'U';
    return (
      <div className={`${size} rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm border border-outline-variant`}>
        {initials}
      </div>
    );
  };

  // Filter conversations & contacts
  const filteredConversations = conversations.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="w-full h-[90vh] max-w-[1400px] mx-4 flex bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden relative border border-outline-variant">
      
      {/* 1. SideNavBar */}
      <aside className="hidden md:flex flex-col h-full py-6 px-4 bg-surface-container border-r border-outline-variant w-64 select-none">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-black text-primary tracking-tight">FlashChat</h1>
          <p className="text-xs text-on-surface-variant font-medium">Active Portal</p>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            setActiveTab('contacts');
            setSelectedUser(null);
          }}
          className="mb-8 w-full py-3.5 px-6 bg-primary-container text-on-primary-container rounded-full font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Chat
        </button>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
              activeTab === 'messages'
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-variant'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'messages' ? "'FILL' 1" : "'FILL' 0" }}>chat</span>
            <span className="font-semibold text-xs tracking-wider uppercase">Messages</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
              activeTab === 'contacts'
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-variant'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'contacts' ? "'FILL' 1" : "'FILL' 0" }}>contacts</span>
            <span className="font-semibold text-xs tracking-wider uppercase">Contacts</span>
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
              activeTab === 'groups'
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-variant'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'groups' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
            <span className="font-semibold text-xs tracking-wider uppercase">Groups</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-variant'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
            <span className="font-semibold text-xs tracking-wider uppercase">Settings</span>
          </button>
        </nav>

        {/* Current User Info & Logout */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-outline-variant">
          <div className="flex items-center gap-3 overflow-hidden">
            {renderAvatar(authUser, "w-10 h-10")}
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-on-surface truncate">{authUser?.fullName || 'User'}</p>
              <p className="text-[10px] text-primary font-semibold">Online</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-xl transition-all flex items-center justify-center active:scale-90"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Conversations / Contacts Pane */}
      <section className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col bg-surface border-r border-outline-variant`}>
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-6 pt-6 pb-2 border-b border-outline-variant">
          <div>
            <h1 className="text-xl font-black text-primary tracking-tight">FlashChat</h1>
            <p className="text-[10px] text-on-surface-variant font-semibold capitalize">{activeTab}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-error-container/20 hover:bg-error-container text-error rounded-xl text-xs font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Logout
          </button>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative flex items-center">
            <span className="absolute left-3.5 material-symbols-outlined text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary transition-all text-xs font-semibold placeholder:text-outline/70"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar select-none">
          {activeTab === 'messages' && (
            <div className="px-4 space-y-1.5">
              {isConversationsLoading ? (
                <div className="text-center py-8 text-xs text-outline font-semibold">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-xs text-outline font-bold">No active conversations</p>
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="mt-3 text-xs text-primary font-bold hover:underline"
                  >
                    Find a contact
                  </button>
                </div>
              ) : (
                filteredConversations.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-l-4 ${
                      selectedUser?._id === user._id
                        ? 'bg-surface-container-high border-primary shadow-sm'
                        : 'border-transparent hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="relative">
                      {renderAvatar(user, "w-12 h-12")}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full"></span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-bold text-sm text-on-surface truncate">{user.fullName}</h3>
                        <span className="text-[10px] text-outline">Active</span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">Click to open chat thread</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="px-4 space-y-1.5">
              {isUsersLoading ? (
                <div className="text-center py-8 text-xs text-outline font-semibold">Loading contacts...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-xs text-outline font-bold">No contacts found</div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {
                      setSelectedUser(user);
                      // Move to messages tab automatically on selection
                      setActiveTab('messages');
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-l-4 ${
                      selectedUser?._id === user._id
                        ? 'bg-surface-container-high border-primary shadow-sm'
                        : 'border-transparent hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="relative">
                      {renderAvatar(user, "w-12 h-12")}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full"></span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-bold text-sm text-on-surface truncate">{user.fullName}</h3>
                      <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {(activeTab === 'groups' || activeTab === 'settings') && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center select-none">
              <span className="material-symbols-outlined text-[48px] text-outline mb-4">construction</span>
              <h3 className="font-bold text-sm text-on-surface mb-1">Feature Coming Soon</h3>
              <p className="text-xs text-on-surface-variant">We're building something amazing here. Stay tuned!</p>
              <button
                onClick={() => setActiveTab('messages')}
                className="mt-6 py-2 px-6 bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-xs rounded-xl transition-all active:scale-[0.98]"
              >
                Go to Messages
              </button>
            </div>
          )}
        </div>

        {/* Mobile Sidebar Footer Tabs */}
        <div className="md:hidden flex border-t border-outline-variant bg-surface-container px-2 py-1 select-none">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 flex flex-col items-center py-2 text-center rounded-xl ${
              activeTab === 'messages' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">chat</span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Chats</span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 flex flex-col items-center py-2 text-center rounded-xl ${
              activeTab === 'contacts' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">contacts</span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Contacts</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 flex flex-col items-center py-2 text-center rounded-xl ${
              activeTab === 'groups' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Groups</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex flex-col items-center py-2 text-center rounded-xl ${
              activeTab === 'settings' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Config</span>
          </button>
        </div>
      </section>

      {/* 3. Main Chat Window */}
      <section className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-surface-bright relative`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <header className="flex justify-between items-center w-full px-6 h-16 bg-surface border-b border-outline-variant z-10 select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-1.5 text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-variant/50 mr-1"
                >
                  <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                </button>
                <div className="relative">
                  {renderAvatar(selectedUser, "w-10 h-10")}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-surface rounded-full"></span>
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-primary leading-tight">{selectedUser.fullName}</h2>
                  <p className="text-[10px] text-on-surface-variant font-medium">Online now</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all">
                  <span className="material-symbols-outlined text-[20px]">videocam</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all">
                  <span className="material-symbols-outlined text-[20px]">call</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </div>
            </header>

            {/* Chat Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar flex flex-col bg-surface-bright/40">
              
              {/* Date Separator */}
              <div className="flex justify-center select-none">
                <span className="px-4 py-1.5 bg-surface-container rounded-full text-[10px] font-bold text-outline uppercase tracking-wider">
                  Conversation Thread
                </span>
              </div>

              {isMessagesLoading ? (
                <div className="flex-1 flex items-center justify-center text-xs text-outline font-semibold">
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none">
                  <span className="material-symbols-outlined text-[48px] text-outline/50 mb-3">chat_bubble</span>
                  <p className="text-xs text-outline font-bold">Say hello to {selectedUser.fullName}!</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Send a text or attachment to get started.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSentByMe = msg.senderId === authUser?._id;
                  const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-3 max-w-[80%] ${
                        isSentByMe ? 'self-end flex-row-reverse' : ''
                      }`}
                    >
                      {!isSentByMe && renderAvatar(selectedUser, "w-8 h-8")}
                      
                      <div className="flex flex-col gap-1.5">
                        {/* Text / Image Container */}
                        <div
                          className={`p-4 rounded-2xl shadow-sm ${
                            isSentByMe
                              ? 'bg-secondary-container text-on-secondary-container rounded-br-none'
                              : 'bg-surface-container-high text-on-surface rounded-bl-none'
                          }`}
                        >
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Attachment"
                              className="max-w-xs max-h-48 rounded-xl object-cover mb-2 border border-outline-variant shadow-sm"
                            />
                          )}
                          {msg.text && (
                            <p className="text-sm font-medium leading-relaxed break-words whitespace-pre-line">
                              {msg.text}
                            </p>
                          )}
                          
                          {/* Time & Read Status */}
                          <div className={`flex items-center justify-end gap-1 mt-1.5 opacity-75`}>
                            <span className="text-[9px] font-bold">{formattedTime}</span>
                            {isSentByMe && (
                              <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Bar */}
            <footer className="p-6 bg-surface border-t border-outline-variant">
              <form onSubmit={handleSend} className="space-y-4">
                
                {/* Image Preview attachment panel */}
                {imagePreview && (
                  <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-2xl border border-outline-variant max-w-xs animate-card-entrance select-none">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className="w-16 h-16 object-cover rounded-xl border border-outline-variant"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-on-surface truncate">Selected Attachment</p>
                      <p className="text-[10px] text-outline">Ready to upload</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 hover:bg-outline-variant/30 text-on-surface-variant hover:text-error rounded-full transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary transition-all">
                  
                  {/* File selectors */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    title="Add file"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all flex items-center justify-center active:scale-95"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                  </button>

                  <button
                    type="button"
                    title="Attach Image"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all flex items-center justify-center active:scale-95"
                  >
                    <span className="material-symbols-outlined">image</span>
                  </button>

                  {/* Main Input Text */}
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold text-on-surface py-3 px-1"
                  />

                  {/* Emoji Placeholder & Send button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Emojis"
                      onClick={() => toast('Emoji picker feature coming soon!', { icon: '😃' })}
                      className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all flex items-center justify-center active:scale-95"
                    >
                      <span className="material-symbols-outlined">mood</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSending || (!inputText.trim() && !imagePreview)}
                      className="w-12 h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center glow-shadow hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        send
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </footer>
          </>
        ) : (
          /* Empty Chat Page welcome view */
          <div className="flex-1 flex flex-col items-center justify-center p-8 select-none text-center">
            
            {/* Ambient background decoration blobs */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-primary-container opacity-5 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-40 left-10 w-48 h-48 bg-tertiary-container opacity-5 rounded-full blur-3xl -z-10 animate-pulse"></div>
            
            {/* Logo branding display */}
            <div className="mb-6 flex justify-center items-center gap-2 bg-primary-container/20 px-5 py-2.5 rounded-full border border-primary/10">
              <span className="material-symbols-outlined text-primary text-[24px]">chat</span>
              <h2 className="text-lg font-black text-primary tracking-tight">FlashChat</h2>
            </div>
            
            <h3 className="text-2xl font-black text-on-surface mb-2 font-sans tracking-tight">Welcome, {authUser?.fullName || 'User'}!</h3>
            <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed mb-8">
              Select a conversation from the active thread list on the left to review message history, or find a new contact to start sharing ideas.
            </p>

            {/* Abstract visual frame */}
            <div className="w-64 h-64 border-2 border-outline-variant/30 rounded-full flex items-center justify-center relative select-none opacity-40">
              <div className="w-48 h-48 border border-outline-variant/20 rounded-full flex items-center justify-center">
                <div className="w-32 h-32 border border-outline-variant/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline/50 text-[36px] animate-[bounce_3s_infinite]">forum</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Chatpage;