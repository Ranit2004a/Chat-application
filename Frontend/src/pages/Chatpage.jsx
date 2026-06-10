import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const SidebarSkeleton = () => {
  return (
    <div className="space-y-3 px-2">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl animate-pulse bg-white/10">
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-surface-container-high rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-surface-container border-2 border-surface rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <div className="h-3.5 bg-surface-container-high rounded w-2/3"></div>
              <div className="h-2.5 bg-surface-container-high rounded w-10"></div>
            </div>
            <div className="h-3 bg-surface-container-low rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const MessagesSkeleton = () => {
  return (
    <div className="flex-1 p-6 space-y-6 flex flex-col justify-end bg-surface-bright/40">
      {[...Array(4)].map((_, idx) => {
        const isSentByMe = idx % 2 === 0;
        return (
          <div
            key={idx}
            className={`flex items-end gap-3 max-w-[85%] animate-pulse ${isSentByMe ? 'self-end flex-row-reverse' : ''
              }`}
          >
            {!isSentByMe && (
              <div className="w-8 h-8 bg-surface-container-high rounded-full shrink-0"></div>
            )}
            <div className="flex flex-col gap-1.5">
              <div
                className={`p-4 rounded-2xl shadow-sm ${isSentByMe
                    ? 'bg-primary-container/20 rounded-br-none w-48'
                    : 'bg-white/50 rounded-bl-none w-60'
                  }`}
              >
                <div className="h-3 bg-surface-container-high rounded w-5/6 mb-2"></div>
                <div className="h-3 bg-surface-container-high rounded w-2/3"></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
    deleteMessage,
    editMessage,
  } = useChatStore();

  const { authUser, logout, isUpdatingProfile, updateProfile } = useAuthStore();

  const [activeTab, setActiveTab] = useState('messages');
  const [activeSettingsSection, setActiveSettingsSection] = useState('profile');
  const [isMobileSettingsDetailOpen, setIsMobileSettingsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInputText, setEditInputText] = useState('');

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedUser(null);
    setIsMobileSettingsDetailOpen(false);
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error('Image size must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Pic = reader.result;
      await updateProfile({ profilePic: base64Pic });
    };
    reader.readAsDataURL(file);
  };

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditInputText(msg.text || '');
  };

  const handleSaveEdit = async (messageId) => {
    if (!editInputText.trim()) return;
    await editMessage(messageId, editInputText);
    setEditingMessageId(null);
    setEditInputText('');
  };

  const handleDeleteClick = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(messageId);
    }
  };


  useEffect(() => {
    getUsers();
    getConversations();

    const convInterval = setInterval(() => {
      getConversations(true);
    }, 6000);

    return () => clearInterval(convInterval);
  }, [getUsers, getConversations]);


  useEffect(() => {
    if (!selectedUser) return;

    getMessages(selectedUser._id);

    const msgInterval = setInterval(() => {
      getMessages(selectedUser._id, true);
    }, 4000);

    return () => clearInterval(msgInterval);
  }, [selectedUser, getMessages]);


  useEffect(() => {
    if (!messages || messages.length === 0) {
      lastMessageIdRef.current = null;
      return;
    }

    const latestMessageId = messages[messages.length - 1]?._id;

    // Scroll only if a new message has arrived or if switching conversations (lastMessageIdRef differs)
    if (latestMessageId && latestMessageId !== lastMessageIdRef.current) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      lastMessageIdRef.current = latestMessageId;
    }
  }, [messages]);

  // Handle image attachment selection
  const haleImageChange = (e) => {
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


  const formatMessageDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

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


  const filteredConversations = conversations.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="w-full h-[90vh] max-w-[1400px] mx-4 flex bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden relative border border-white/40">

      {/* 1. SideNavBar */}
      <aside className="hidden md:flex flex-col h-full py-6 px-4 bg-[#E7D7CC] border-r border-outline-variant w-64 select-none">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-black text-primary tracking-tight">FlashChat</h1>
          <p className="text-xs text-on-surface-variant font-medium">Active Now</p>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => handleTabChange('contacts')}
          className="mb-8 w-full py-3.5 px-6 bg-primary-container text-on-primary-container rounded-full font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Chat
        </button>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => handleTabChange('messages')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${activeTab === 'messages'
              ? 'text-primary font-bold border-r-4 border-primary bg-[#FFF1E8]'
              : 'text-on-surface-variant hover:bg-[#FFF1E8]/50'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'messages' ? "'FILL' 1" : "'FILL' 0" }}>chat</span>
            <span className="font-semibold text-xs tracking-wider uppercase">Messages</span>
          </button>

          <button
            onClick={() => handleTabChange('contacts')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${activeTab === 'contacts'
              ? 'text-primary font-bold border-r-4 border-primary bg-[#FFF1E8]'
              : 'text-on-surface-variant hover:bg-[#FFF1E8]/50'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'contacts' ? "'FILL' 1" : "'FILL' 0" }}>contacts</span>
            <span className="font-semibold text-xs tracking-wider uppercase">Contacts</span>
          </button>

          <button
            onClick={() => handleTabChange('groups')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${activeTab === 'groups'
              ? 'text-primary font-bold border-r-4 border-primary bg-[#FFF1E8]'
              : 'text-on-surface-variant hover:bg-[#FFF1E8]/50'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'groups' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
            <span className="font-semibold text-xs tracking-wider uppercase">Groups</span>
          </button>

          <button
            onClick={() => handleTabChange('settings')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${activeTab === 'settings'
              ? 'text-primary font-bold border-r-4 border-primary bg-[#FFF1E8]'
              : 'text-on-surface-variant hover:bg-[#FFF1E8]/50'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
            <span className="font-semibold text-xs tracking-wider uppercase">Settings</span>
          </button>
        </nav>

        {/* Current User Info & Logout */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-outline-variant">
          <div
            onClick={() => {
              setActiveTab('settings');
              setActiveSettingsSection('profile');
              setSelectedUser(null);
              setIsMobileSettingsDetailOpen(true);
            }}
            className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            title="View Profile Settings"
          >
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
      <section className={`${selectedUser || (activeTab === 'settings' && isMobileSettingsDetailOpen) ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col bg-white/20 backdrop-blur-2xl border-r border-outline-variant`}>

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

        {/* Search - only for search-eligible tabs */}
        {activeTab !== 'settings' && activeTab !== 'groups' && (
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
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar select-none">
          {activeTab === 'messages' && (
            <div className="px-4 space-y-1.5">
              {isConversationsLoading ? (
                <SidebarSkeleton />
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-xs text-outline font-bold">No active conversations</p>
                  <button
                    onClick={() => handleTabChange('contacts')}
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
                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-l-4 ${selectedUser?._id === user._id
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
                <SidebarSkeleton />
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
                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-l-4 ${selectedUser?._id === user._id
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

          {activeTab === 'groups' && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center select-none">
              <span className="material-symbols-outlined text-[48px] text-outline mb-4">construction</span>
              <h3 className="font-bold text-sm text-on-surface mb-1">Feature Coming Soon</h3>
              <p className="text-xs text-on-surface-variant">We're building something amazing here. Stay tuned!</p>
              <button
                onClick={() => handleTabChange('messages')}
                className="mt-6 py-2 px-6 bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-xs rounded-xl transition-all active:scale-[0.98]"
              >
                Go to Messages
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="px-4 space-y-1.5 py-4">
              <div className="mb-6 px-2">
                <h2 className="text-lg font-black text-primary tracking-tight">Settings</h2>
                <p className="text-xs text-on-surface-variant font-medium">Manage your experience</p>
              </div>

              <button
                onClick={() => {
                  setActiveSettingsSection('profile');
                  setIsMobileSettingsDetailOpen(true);
                }}
                className={`w-full flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all ${activeSettingsSection === 'profile'
                  ? 'text-primary font-bold bg-[#FFF1E8] border-l-4 border-primary'
                  : 'text-on-surface-variant hover:bg-[#FFF1E8]/30'
                  }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: activeSettingsSection === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>account_circle</span>
                <span className="font-semibold text-xs tracking-wider uppercase text-left">My Profile</span>
              </button>

              <button
                onClick={() => {
                  setActiveSettingsSection('theme');
                  setIsMobileSettingsDetailOpen(true);
                }}
                className={`w-full flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all ${activeSettingsSection === 'theme'
                  ? 'text-primary font-bold bg-[#FFF1E8] border-l-4 border-primary'
                  : 'text-on-surface-variant hover:bg-[#FFF1E8]/30'
                  }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: activeSettingsSection === 'theme' ? "'FILL' 1" : "'FILL' 0" }}>palette</span>
                <span className="font-semibold text-xs tracking-wider uppercase text-left">Appearance</span>
              </button>

              <button
                onClick={() => {
                  setActiveSettingsSection('about');
                  setIsMobileSettingsDetailOpen(true);
                }}
                className={`w-full flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all ${activeSettingsSection === 'about'
                  ? 'text-primary font-bold bg-[#FFF1E8] border-l-4 border-primary'
                  : 'text-on-surface-variant hover:bg-[#FFF1E8]/30'
                  }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: activeSettingsSection === 'about' ? "'FILL' 1" : "'FILL' 0" }}>info</span>
                <span className="font-semibold text-xs tracking-wider uppercase text-left">About FlashChat</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Sidebar Footer Tabs */}
        <div className="md:hidden flex border-t border-outline-variant bg-white/35 backdrop-blur-md px-2 py-1 select-none">
          <button
            onClick={() => handleTabChange('messages')}
            className={`flex-1 flex flex-col items-center py-2 text-center rounded-xl ${activeTab === 'messages' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
          >
            <span className="material-symbols-outlined">chat</span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Chats</span>
          </button>
          <button
            onClick={() => handleTabChange('contacts')}
            className={`flex-1 flex flex-col items-center py-2 text-center rounded-xl ${activeTab === 'contacts' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
          >
            <span className="material-symbols-outlined">contacts</span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Contacts</span>
          </button>
          <button
            onClick={() => handleTabChange('groups')}
            className={`flex-1 flex flex-col items-center py-2 text-center rounded-xl ${activeTab === 'groups' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Groups</span>
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`flex-1 flex flex-col items-center py-2 text-center rounded-xl ${activeTab === 'settings' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Config</span>
          </button>
        </div>
      </section>

      {/* 3. Main Chat Window */}
      <section className={`${(!selectedUser && !(activeTab === 'settings' && isMobileSettingsDetailOpen)) ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white/10 backdrop-blur-2xl relative`}>
        {activeTab === 'settings' ? (
          /* Settings Panel Detail View */
          <div className="flex-1 flex flex-col h-full bg-surface-bright/40 overflow-y-auto">
            {/* Header */}
            <header className="flex items-center gap-3 w-full px-6 h-16 bg-white/30 backdrop-blur-md border-b border-outline-variant z-10 select-none shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileSettingsDetailOpen(false)}
                className="md:hidden p-1.5 text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-variant/50 mr-1 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <span className="material-symbols-outlined text-primary text-[24px]">
                {activeSettingsSection === 'profile' ? 'account_circle' : activeSettingsSection === 'theme' ? 'palette' : 'info'}
              </span>
              <div>
                <h2 className="font-extrabold text-sm text-primary leading-tight">
                  {activeSettingsSection === 'profile' ? 'My Profile' : activeSettingsSection === 'theme' ? 'Appearance' : 'About FlashChat'}
                </h2>
                <p className="text-[10px] text-on-surface-variant font-medium">
                  {activeSettingsSection === 'profile' ? 'Manage your account details' : activeSettingsSection === 'theme' ? 'Customize app interface' : 'FlashChat Version 1.0'}
                </p>
              </div>
            </header>

            {/* Content Body */}
            <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-start animate-card-entrance max-w-2xl mx-auto w-full">
              {activeSettingsSection === 'profile' && (
                <div className="w-full space-y-6">
                  {/* Profile Pic Upload Section */}
                  <div className="flex flex-col items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-sm relative overflow-hidden w-full">
                    <div className="relative group">
                      {/* Avatar Image */}
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-md">
                        {isUpdatingProfile ? (
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10">
                            <span className="loading loading-spinner loading-md mb-1"></span>
                            <span className="text-[10px] font-bold tracking-wider uppercase">Uploading</span>
                          </div>
                        ) : null}
                        {renderAvatar(authUser, "w-full h-full")}
                      </div>

                      {/* Camera upload overlay trigger */}
                      {!isUpdatingProfile && (
                        <label className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full cursor-pointer hover:scale-110 hover:shadow-lg active:scale-95 transition-all duration-300 shadow-md flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicUpload}
                            className="hidden"
                            disabled={isUpdatingProfile}
                          />
                        </label>
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-on-surface-variant font-medium mt-1">
                        Click the camera icon to upload a profile photo
                      </p>
                      <p className="text-[10px] text-outline mt-0.5">
                        Supports JPG, PNG, or GIF. Max size 1MB.
                      </p>
                    </div>
                  </div>

                  {/* User details form card */}
                  <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-sm space-y-4 w-full">
                    <div className="border-b border-outline-variant pb-2">
                      <h3 className="font-bold text-xs text-primary uppercase tracking-wider">Account Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                        <div className="px-4 py-3 bg-surface-container/50 rounded-xl text-xs font-semibold text-on-surface border border-outline-variant/30 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-outline">person</span>
                          {authUser?.fullName || 'N/A'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                        <div className="px-4 py-3 bg-surface-container/50 rounded-xl text-xs font-semibold text-on-surface border border-outline-variant/30 flex items-center gap-2 overflow-hidden">
                          <span className="material-symbols-outlined text-[16px] text-outline">mail</span>
                          <span className="truncate">{authUser?.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Account Status</label>
                        <div className="px-4 py-3 bg-surface-container/50 rounded-xl text-xs font-semibold text-green-600 border border-outline-variant/30 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
                          Active
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Member Since</label>
                        <div className="px-4 py-3 bg-surface-container/50 rounded-xl text-xs font-semibold text-on-surface border border-outline-variant/30 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
                          {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsSection === 'theme' && (
                <div className="w-full space-y-6">
                  <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-sm space-y-4 w-full">
                    <div className="border-b border-outline-variant pb-2">
                      <h3 className="font-bold text-xs text-primary uppercase tracking-wider">Appearance Configuration</h3>
                    </div>
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <span className="material-symbols-outlined text-[48px] text-outline mb-4">palette</span>
                      <p className="text-xs text-on-surface font-semibold mb-1">Theme customization is coming soon</p>
                      <p className="text-[10px] text-on-surface-variant max-w-xs">
                        Soon you'll be able to toggle light/dark modes and pick custom brand colors. Currently, FlashChat features our default vibrant sunset style.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsSection === 'about' && (
                <div className="w-full space-y-6">
                  <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-sm space-y-4 w-full">
                    <div className="border-b border-outline-variant pb-2 flex items-center justify-between">
                      <h3 className="font-bold text-xs text-primary uppercase tracking-wider">About the App</h3>
                      <span className="px-2.5 py-0.5 bg-primary-container text-primary text-[10px] font-bold rounded-full">v1.0.0</span>
                    </div>

                    <div className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                      <p>
                        <strong>FlashChat</strong> is a real-time messaging application designed with speed, modern aesthetics, and fluid interactions in mind.
                      </p>
                      <p>
                        Powered by React, Tailwind CSS, Zustand, Node.js, Express, MongoDB, and Cloudinary.
                      </p>
                      <div className="pt-2 flex items-center gap-1 text-[11px] text-outline font-semibold">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Secure end-to-end user state protection with Arcjet & JWT.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : selectedUser ? (
          <>
            {/* Header */}
            <header className="flex justify-between items-center w-full px-6 h-16 bg-white/30 backdrop-blur-md border-b border-outline-variant z-10 select-none border-t border-t-white/10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-1.5 text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-variant/50 mr-1 flex items-center justify-center"
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

              {isMessagesLoading ? (
                <MessagesSkeleton />
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none">
                  <span className="material-symbols-outlined text-[48px] text-outline/50 mb-3">chat_bubble</span>
                  <p className="text-xs text-outline font-bold">Say hello to {selectedUser.fullName}!</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Send a text or attachment to get started.</p>
                </div>
              ) : (
                (() => {
                  let lastDateString = null;
                  return messages.map((msg) => {
                    const isSentByMe = msg.senderId === authUser?._id;
                    const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const msgDateString = new Date(msg.createdAt).toDateString();
                    const showDateSeparator = msgDateString !== lastDateString;
                    lastDateString = msgDateString;

                    return (
                      <React.Fragment key={msg._id}>
                        {showDateSeparator && (
                          <div className="flex justify-center select-none my-4">
                            <span className="px-4 py-1.5 bg-surface-container rounded-full text-[10px] font-bold text-outline uppercase tracking-wider">
                              {formatMessageDate(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`group relative flex items-end gap-3 max-w-[85%] transition-all duration-300 ${isSentByMe ? 'self-end flex-row-reverse' : ''
                            }`}
                        >
                          {!isSentByMe && renderAvatar(selectedUser, "w-8 h-8")}

                          {/* Message actions menu (Edit / Delete) - Sentinel on hover */}
                          {isSentByMe && editingMessageId !== msg._id && (
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-outline-variant/30 py-1 px-1.5 rounded-full shadow-md select-none z-10 self-center">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(msg)}
                                title="Edit message"
                                className="p-1.5 hover:bg-primary-container/20 text-on-surface-variant hover:text-primary rounded-full transition-all flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(msg._id)}
                                title="Delete message"
                                className="p-1.5 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-full transition-all flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5">
                            {/* Text / Image Container */}
                            {editingMessageId === msg._id ? (
                              /* Inline Editor */
                              <div className="flex flex-col gap-2 min-w-[220px] bg-white/90 p-3.5 rounded-2xl rounded-br-none border border-outline-variant/40 shadow-md">
                                <textarea
                                  value={editInputText}
                                  onChange={(e) => setEditInputText(e.target.value)}
                                  className="w-full text-xs p-2.5 bg-surface-container border border-outline-variant focus:ring-1 focus:ring-primary focus:border-primary rounded-xl text-on-surface font-semibold font-sans outline-none resize-none"
                                  rows={2}
                                />
                                <div className="flex items-center justify-end gap-1.5 select-none">
                                  <button
                                    type="button"
                                    onClick={() => setEditingMessageId(null)}
                                    className="px-2.5 py-1 text-[10px] font-bold text-on-surface-variant hover:bg-outline-variant/30 rounded-lg transition-all"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(msg._id)}
                                    className="px-2.5 py-1 text-[10px] font-bold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all shadow-sm"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Standard Message bubble */
                              <div
                                className={`p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ${isSentByMe
                                  ? 'bg-gradient-to-tr from-primary to-[#ff9124] text-white rounded-br-none border border-primary/20'
                                  : 'bg-white/80 backdrop-blur-md text-on-surface rounded-bl-none border border-outline-variant/30'
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
                                    <span className="material-symbols-outlined text-[14px] text-white/80">done_all</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Bar */}
            <footer className="p-6 bg-white/35 backdrop-blur-md border-t border-outline-variant">
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

                <div className="flex items-center gap-4 bg-surface-container-low p-2 border border-primary rounded-full focus-within:ring-1 focus-within:ring-primary transition-all">

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
                    className="flex-1 bg-transparent border border-on-surface/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary font-body-lg text-body-lg text-on-surface py-2 px-3 outline-none"
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
                      className="w-12 h-12 bg-gradient-to-tr from-primary to-secondary-container hover:shadow-[0_8px_20px_rgba(176,100,5,0.3)] shadow-md text-white hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl flex items-center justify-center relative overflow-hidden group disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
                    >
                      <span className="material-symbols-outlined text-[20px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>
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