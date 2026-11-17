import React, { useState, useEffect, useRef } from 'react';
import { 
  MessagesSquare, 
  Send, 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  Sparkles, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  Lock,
  X,
  AlertCircle
} from 'lucide-react';
import { chatService } from '../services/storageService';
import { getDefaultAvatar } from '../services/avatarService';

const PRESET_WRAPUP_MESSAGES = [
  {
    id: 'concluded',
    label: 'Show Concluded & Wrap-Up (Standard)',
    text: "Thanks everyone for joining the concert squad! The show has concluded, so this chat space is now officially closed. Hope to see you at the next London gig!"
  },
  {
    id: 'memories',
    label: 'Post-Gig Memories & Thanks',
    text: "What an incredible gig! Thank you all for making it memorable. Concert logistics are now concluded and this chat room is closed. Cheers everyone!"
  },
  {
    id: 'logistics',
    label: 'Logistics Complete',
    text: "Ticket handoffs and concert meetups are now complete. Closing this coordination space. See you around London!"
  }
];

export default function ChatPage({ 
  invites, 
  currentUser, 
  selectedInviteId, 
  onSelectInviteId, 
  onNavigate,
  onOpenAuth 
}) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('concluded');
  const [presetMessageText, setPresetMessageText] = useState(PRESET_WRAPUP_MESSAGES[0].text);
  const [isTerminating, setIsTerminating] = useState(false);
  const messagesEndRef = useRef(null);

  // Filter invites where the user is an author or has accepted AND space is NOT terminated
  // Once an event space is terminated, all users including the host shouldn't see it in concertchat section
  const userChatInvites = invites.filter((inv) => {
    if (!currentUser) return false;
    if (chatService.isChatTerminated(inv.id)) return false;
    const isAuthor = Boolean(inv.author && inv.author.id === currentUser.id);
    const isAccepted = inv.userResponses && inv.userResponses[currentUser.id] === 'accepted';
    return isAuthor || isAccepted;
  });

  const activeInvite = userChatInvites.find((inv) => inv.id === selectedInviteId) || userChatInvites[0] || null;

  useEffect(() => {
    if (activeInvite) {
      const msgs = chatService.getMessages(activeInvite.id);
      setMessages(msgs);
    } else {
      setMessages([]);
    }

    const handleChatUpdate = (e) => {
      if (activeInvite && (!e.detail || !e.detail.inviteId || e.detail.inviteId === activeInvite.id)) {
        const msgs = chatService.getMessages(activeInvite.id);
        setMessages(msgs);
      }
    };

    window.addEventListener('fic_chat_updated', handleChatUpdate);
    window.addEventListener('storage', handleChatUpdate);
    return () => {
      window.removeEventListener('fic_chat_updated', handleChatUpdate);
      window.removeEventListener('storage', handleChatUpdate);
    };
  }, [activeInvite, selectedInviteId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    const text = inputText.trim();
    if (!text || !activeInvite) return;

    setInputText('');
    const newMsg = await chatService.sendMessage(activeInvite.id, text);
    if (newMsg) {
      setMessages((prev) => {
        // Prevent duplicate appending if event already updated it
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    }
  };

  const isHost = Boolean(currentUser && activeInvite?.author && activeInvite.author.id === currentUser.id);
  const isTerminated = activeInvite ? chatService.isChatTerminated(activeInvite.id) : false;

  const isEventPassed = activeInvite?.date ? (() => {
    try {
      const eventDate = new Date(activeInvite.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate < today;
    } catch {
      return false;
    }
  })() : false;

  const handleConfirmTerminate = async () => {
    if (!activeInvite || !isHost || !presetMessageText.trim()) return;
    setIsTerminating(true);
    try {
      const terminatedId = activeInvite.id;
      const res = await chatService.terminateChatSpace(terminatedId, presetMessageText.trim());
      if (res.success) {
        setIsTerminateModalOpen(false);
        // Clear selected invite so the terminated space is immediately removed from the chat section
        if (onSelectInviteId) {
          onSelectInviteId(null);
        }
        // Dispatch updates so sidebar, navbar badges, and active spaces update across the entire app
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('fic_chat_updated', { detail: { inviteId: terminatedId } }));
          window.dispatchEvent(new CustomEvent('fic_notification_updated'));
        }
      }
    } catch (err) {
      console.error('Failed to terminate space:', err);
    } finally {
      setIsTerminating(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'var(--container-bg)',
        borderRadius: '16px',
        border: '1.5px solid var(--container-border)'
      }}>
        <Lock size={48} color="#FF9600" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Please Log In to Access Concert Chat</h2>
        <p style={{ color: '#59636e', maxWidth: '460px', margin: '0.5rem auto 1.5rem' }}>
          Exclusive concert chat rooms unlock automatically when you accept a concert invite or post your own show squad.
        </p>
        <button 
          className="btn-positive"
          onClick={() => onOpenAuth('login')}
          style={{ padding: '0.8rem 1.6rem' }}
        >
          <span>Log In / Register</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#111827', margin: 0 }}>
            Concert Chat Spaces
          </h1>
          <span className="badge badge-green">
            {userChatInvites.length} Active {userChatInvites.length === 1 ? 'Space' : 'Spaces'}
          </span>
        </div>
        <p style={{ color: '#59636e', fontSize: '0.95rem', marginTop: '0.3rem' }}>
          Exclusive coordination spaces unlocked for you and your accepted concert companions
        </p>
      </div>

      {userChatInvites.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--container-bg)',
          borderRadius: '16px',
          border: '1.5px solid var(--container-border)'
        }}>
          <MessagesSquare size={48} color="#8c959f" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>No Unlocked Chat Spaces Yet</h2>
          <p style={{ color: '#59636e', maxWidth: '480px', margin: '0.5rem auto 1.5rem', lineHeight: 1.5 }}>
            To unlock a concert chat, browse the <strong>Concert Invites</strong> feed and click the green <strong>Accept</strong> button on any concert you want to attend!
          </p>
          <button 
            className="btn-positive"
            onClick={() => onNavigate('concerts')}
            style={{ padding: '0.8rem 1.5rem' }}
          >
            <Ticket size={18} />
            <span>Browse Concert Invites to Accept</span>
          </button>
        </div>
      ) : (
        <div className="chat-layout-container">
          {/* Chat Rooms Sidebar */}
          <div className="fic-container chat-sidebar" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#1f2328', margin: 0 }}>
              Your Concert Squads
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
              {userChatInvites.map((inv) => {
                const isSelected = activeInvite && activeInvite.id === inv.id;
                const isRoomTerminated = chatService.isChatTerminated(inv.id);
                return (
                  <div
                    key={inv.id}
                    onClick={() => onSelectInviteId(inv.id)}
                    style={{
                      padding: '0.75rem 0.9rem',
                      borderRadius: '10px',
                      background: isSelected ? '#1f2328' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#1f2328',
                      border: isSelected ? '1.5px solid #1f2328' : '1.5px solid #d5d5d5',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{inv.artist}</strong>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: isSelected ? 'rgba(88,204,2,0.3)' : '#e9ecef',
                        color: isSelected ? '#58CC02' : '#495057',
                        fontWeight: 700
                      }}>
                        {inv.acceptedCount}/{inv.requiredSpots}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: isSelected ? '#cbd5e1' : '#59636e',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {inv.venue} • {inv.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          {activeInvite && (
            <div className="chat-window">
              {/* Chat Header */}
              <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '2px solid #d5d5d5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      {activeInvite.artist} Concert Crew
                    </h2>
                    {isTerminated ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid #cbd5e1'
                      }}>
                        <Lock size={12} /> Space Closed
                      </span>
                    ) : (
                      <span className="badge badge-green">
                        {activeInvite.acceptedCount} Joined
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#59636e', marginTop: '2px' }}>
                    {activeInvite.venue}, {activeInvite.city} • {activeInvite.date}
                  </div>
                </div>

                {/* Right Header: Terminate Space option for Host & Squad Avatars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isHost && !isTerminated && (
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(PRESET_WRAPUP_MESSAGES[0].id);
                        setPresetMessageText(PRESET_WRAPUP_MESSAGES[0].text);
                        setIsTerminateModalOpen(true);
                      }}
                      className="btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: isEventPassed ? '#b91c1c' : '#475569',
                        borderColor: isEventPassed ? '#fca5a5' : '#d5d5d5',
                        backgroundColor: isEventPassed ? '#fef2f2' : '#ffffff'
                      }}
                      title={isEventPassed ? 'Event has passed - notify attendees and close space' : 'Terminate concert chat space'}
                    >
                      <Lock size={13} color={isEventPassed ? '#b91c1c' : '#475569'} />
                      <span>Terminate Space {isEventPassed ? '(Event Passed)' : ''}</span>
                    </button>
                  )}

                  {/* Squad Avatars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img 
                      src={activeInvite.author?.avatar || getDefaultAvatar(activeInvite.author?.name || 'Host')} 
                      alt={activeInvite.author?.name || 'Host'}
                      title={`Host: ${activeInvite.author?.name || 'Host'}`}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #58CC02' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getDefaultAvatar(activeInvite.author?.name || 'Host');
                      }}
                    />
                    {activeInvite.acceptedUsers && activeInvite.acceptedUsers.map((u, i) => (
                      <img 
                        key={i}
                        src={u.avatar} 
                        alt={u.name}
                        title={`Attendee: ${u.name}`}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #d5d5d5' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getDefaultAvatar(u.name);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="chat-messages">
                <div className="chat-bubble system">
                  🔒 This is an exclusive space for confirmed attendees of <strong>{activeInvite.artist}</strong>. Coordinate pre-show meetup spots, ticket handoffs, and logistics here!
                </div>

                {messages.map((m) => {
                  const isMine = m.senderId === currentUser.id;
                  const isSystem = m.senderId === 'system';

                  if (isSystem) {
                    return (
                      <div key={m.id} className="chat-bubble system">
                        {m.text}
                      </div>
                    );
                  }

                  if (m.isHostFinalNotice) {
                    return (
                      <div 
                        key={m.id}
                        style={{
                          margin: '1.25rem auto',
                          maxWidth: '92%',
                          backgroundColor: '#fef2f2',
                          border: '2px solid #f87171',
                          borderRadius: '12px',
                          padding: '1rem 1.25rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <Lock size={16} color="#dc2626" />
                          <strong style={{ fontSize: '0.88rem', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Host Final Wrap-Up Notice • Space Concluded
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: '#7f1d1d', marginLeft: 'auto' }}>
                            {m.timestamp}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.92rem', color: '#1f2937', lineHeight: 1.5 }}>
                          {m.text}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>
                          <img 
                            src={m.senderAvatar} 
                            alt={m.senderName} 
                            style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getDefaultAvatar(m.senderName);
                            }}
                          />
                          <span>Posted by Host ({m.senderName})</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={m.id} 
                      style={{
                        display: 'flex',
                        flexDirection: isMine ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: '8px',
                        maxWidth: '80%',
                        alignSelf: isMine ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <img 
                        src={m.senderAvatar} 
                        alt={m.senderName}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getDefaultAvatar(m.senderName);
                        }}
                      />
                      <div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: '#8c959f',
                          marginBottom: '2px',
                          textAlign: isMine ? 'right' : 'left'
                        }}>
                          {m.senderName} • {m.timestamp}
                        </div>
                        <div className={`chat-bubble ${isMine ? 'mine' : 'other'}`}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTerminated && (
                  <div style={{
                    margin: '1.25rem 0 0.5rem',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <Lock size={14} color="#64748b" />
                    <span>This concert space has concluded. The chat is archived and read-only.</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer or Closed Banner */}
              {isTerminated ? (
                <div 
                  style={{
                    padding: '1rem 1.25rem',
                    borderTop: '2px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <Lock size={16} color="#64748b" />
                  <span>Chat space terminated by the host. No further messages can be sent.</span>
                </div>
              ) : (
                <form 
                  onSubmit={handleSendMessage}
                  style={{
                    padding: '1rem',
                    borderTop: '2px solid #d5d5d5',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center'
                  }}
                >
                  <input 
                    type="text"
                    className="form-input"
                    style={{ flex: 1, padding: '0.75rem 1rem' }}
                    placeholder={`Message your ${activeInvite.artist} crew... (e.g. Where should we meet before the gates open?)`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="btn-positive"
                    style={{ padding: '0.75rem 1.25rem' }}
                  >
                    <Send size={16} />
                    <span>Send</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Host Terminate Space Modal */}
      {isTerminateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '2px solid #1f2328',
            maxWidth: '560px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Lock size={20} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#111827' }}>
                    Terminate Concert Chat Space
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Host Control • {activeInvite?.artist} Squad
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsTerminateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.45 }}>
                <strong>Important:</strong> Terminating this space closes coordination permanently. Before termination, select and send an official preset message below to update all joined attendees.
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              1. Select Preset Information Message
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {PRESET_WRAPUP_MESSAGES.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div 
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setPresetMessageText(preset.text);
                    }}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #58CC02' : '1.5px solid #e5e7eb',
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.85rem', color: isSelected ? '#166534' : '#1f2937' }}>
                        {preset.label}
                      </strong>
                      {isSelected && <CheckCircle2 size={16} color="#58CC02" />}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
                      "{preset.text}"
                    </div>
                  </div>
                );
              })}
            </div>

            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              2. Review / Customize Announcement Text
            </label>
            <textarea
              rows={3}
              className="form-input"
              value={presetMessageText}
              onChange={(e) => setPresetMessageText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                fontSize: '0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #d1d5db',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '1.25rem'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsTerminateModalOpen(false)}
                disabled={isTerminating}
                style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-negative"
                onClick={handleConfirmTerminate}
                disabled={isTerminating || !presetMessageText.trim()}
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Lock size={15} />
                <span>{isTerminating ? 'Terminating Space...' : 'Send Preset Info & Terminate Space'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
