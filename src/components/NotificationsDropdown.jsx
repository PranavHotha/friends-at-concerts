import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Heart, 
  Trash2,
  X,
  Ticket,
  Flame,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { getDefaultAvatar } from '../services/avatarService';

export default function NotificationsDropdown({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigate
}) {
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const dropdownRef = useRef(null);

  // Close when clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredList = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const now = Date.now();
      const date = new Date(dateStr).getTime();
      if (isNaN(date)) return dateStr;
      const diffSec = Math.floor((now - date) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const getActionConfig = (n) => {
    switch (n.type) {
      case 'invite_view':
        return {
          actionIcon: <Eye size={13} strokeWidth={2.4} color="#0284c7" />,
          badgeBg: '#0284c7',
          badgeIcon: <Eye size={10} color="#ffffff" strokeWidth={2.5} />,
          color: '#0284c7',
          defaultVerb: 'viewed your concert invite for',
          actionText: n.actionText || n.message || 'viewed your concert invite'
        };
      case 'invite_accept':
        return {
          actionIcon: <Ticket size={13} strokeWidth={2.4} color="#059669" />,
          badgeBg: '#10b981',
          badgeIcon: <Ticket size={10} color="#ffffff" strokeWidth={2.5} />,
          color: '#059669',
          defaultVerb: 'accepted your concert invite for',
          actionText: n.actionText || n.message || 'accepted your concert invite'
        };
      case 'invite_reject':
        return {
          actionIcon: <XCircle size={13} strokeWidth={2.4} color="#d97706" />,
          badgeBg: '#f59e0b',
          badgeIcon: <XCircle size={10} color="#ffffff" strokeWidth={2.5} />,
          color: '#d97706',
          defaultVerb: 'passed on your concert invite for',
          actionText: n.actionText || n.message || 'passed on your concert invite'
        };
      case 'chat_message':
        return {
          actionIcon: <MessageSquare size={13} strokeWidth={2.4} color="#7c3aed" />,
          badgeBg: '#8b5cf6',
          badgeIcon: <MessageSquare size={10} color="#ffffff" strokeWidth={2.5} />,
          color: '#7c3aed',
          defaultVerb: 'sent a message on the chat group',
          actionText: n.actionText || n.message || 'sent a squad chat message'
        };
      case 'chat_reaction':
        return {
          actionIcon: <Heart size={13} strokeWidth={2.4} color="#7c3aed" fill="#7c3aed" />,
          badgeBg: '#8b5cf6',
          badgeIcon: <Heart size={10} color="#ffffff" strokeWidth={2.5} />,
          color: '#7c3aed',
          defaultVerb: 'reacted to your message in',
          actionText: n.actionText || n.message || 'reacted to your message'
        };
      case 'review_like':
        return {
          actionIcon: <Heart size={13} strokeWidth={2.4} color="#dc2626" fill="#dc2626" />,
          badgeBg: '#ef4444',
          badgeIcon: <Heart size={10} color="#ffffff" fill="#ffffff" strokeWidth={2.5} />,
          color: '#dc2626',
          defaultVerb: 'liked your review',
          actionText: n.actionText || n.message || 'liked your review'
        };
      default:
        return {
          actionIcon: <Bell size={13} strokeWidth={2.4} color="#475569" />,
          badgeBg: '#64748b',
          badgeIcon: <Bell size={10} color="#ffffff" strokeWidth={2.5} />,
          color: '#475569',
          defaultVerb: 'interacted with',
          actionText: n.actionText || n.message || 'activity update'
        };
    }
  };

  const getActionDetails = (n, config) => {
    let verb = n.actionVerb || config.defaultVerb;
    let element = n.elementName;
    if (!element) {
      if (n.inviteTitle) element = n.inviteTitle;
      else if (n.reviewTitle) element = n.reviewTitle;
      else if (n.type === 'chat_message') element = 'Squad Chat';
      else if (n.type === 'review_like') element = 'Concert Review';
      else element = 'Concert Invite';
    }
    return { verb, element };
  };

  const handleItemClick = (n) => {
    onMarkAsRead(n.id);
    if (n.type === 'chat_message' || n.type === 'chat_reaction') {
      onNavigate('chat', n.inviteId);
    } else if (n.inviteId) {
      onNavigate('concerts', n.inviteId);
    } else if (n.reviewId) {
      onNavigate('reviews');
    }
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      className="fic-notifications-dropdown"
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: '0',
        width: '390px',
        maxWidth: '92vw',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1.5px solid #d5d5d5',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.18)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '520px',
        overflow: 'hidden',
        animation: 'slideDownFade 0.18s ease-out'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Little decorative arrow on top pointing to the bell */}
      <div style={{
        position: 'absolute',
        top: '-7px',
        right: '18px',
        width: '12px',
        height: '12px',
        backgroundColor: '#ffffff',
        borderLeft: '1.5px solid #d5d5d5',
        borderTop: '1.5px solid #d5d5d5',
        transform: 'rotate(45deg)',
        zIndex: 1
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.9rem 1rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#eefcf0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={15} color="#58CC02" />
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span 
              className="badge badge-orange" 
              style={{ fontSize: '0.68rem', padding: '1px 6px', fontWeight: 800 }}
            >
              {unreadCount} new
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem', gap: '3px' }}
              title="Mark all as viewed (refreshes unread count)"
            >
              <CheckCheck size={12} color="#58CC02" />
              <span>Mark all viewed</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '3px',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: '#fafbfc'
      }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            border: filter === 'all' ? '1.5px solid #58CC02' : '1px solid transparent',
            background: filter === 'all' ? '#eefcf0' : 'transparent',
            color: filter === 'all' ? '#2e7d32' : '#6b7280',
            cursor: 'pointer'
          }}
        >
          All Activity ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          style={{
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            border: filter === 'unread' ? '1.5px solid #FF9600' : '1px solid transparent',
            background: filter === 'unread' ? '#fff7ed' : 'transparent',
            color: filter === 'unread' ? '#b45309' : '#6b7280',
            cursor: 'pointer'
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '340px',
        padding: '0.4rem 0.6rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {filteredList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            color: '#9ca3af'
          }}>
            <Bell size={32} color="#d1d5db" style={{ margin: '0 auto 0.6rem' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#374151' }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px auto 0', maxWidth: '260px' }}>
              When other London music fans view, accept, or pass on your concert invites, you will see alerts right here.
            </p>
          </div>
        ) : (
          filteredList.map((n) => {
            const config = getActionConfig(n);
            const { verb, element } = getActionDetails(n, config);
            const userName = n.senderName || n.sender?.name || 'A London concert fan';
            const userAvatar = n.senderAvatar || n.sender?.avatar || getDefaultAvatar(userName);

            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '10px',
                  backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                  border: n.read ? '1px solid #f1f3f5' : '1.5px solid #bbf7d0',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = n.read ? '#f8f9fa' : '#e6f9eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = n.read ? '#ffffff' : '#f0fdf4';
                }}
              >
                {/* Left: Avatar with action badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={userAvatar}
                    alt={userName}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                      backgroundColor: '#f3f4f6',
                      border: '1.5px solid #e5e7eb'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDefaultAvatar(userName);
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    backgroundColor: config.badgeBg,
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>
                    {config.badgeIcon}
                  </div>
                </div>

                {/* Right: Username on top, Action down with User_name action_name element_name detail */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top line: Username + Time */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px'
                  }}>
                    <span style={{
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {userName}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#9ca3af', flexShrink: 0 }}>
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>

                  {/* Down line: Action Taken on Element */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#374151',
                    marginTop: '2px',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px'
                  }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: config.color, 
                      flexShrink: 0, 
                      marginTop: '3px' 
                    }}>
                      {config.actionIcon}
                    </span>
                    <div>
                      <span style={{ color: config.color, fontWeight: 700 }}>
                        {verb}
                      </span>{' '}
                      <strong style={{ color: '#111827', fontWeight: 800 }}>
                        "{element}"
                      </strong>
                      {n.type === 'chat_message' && (
                        <span style={{ color: '#58CC02', fontWeight: 700, marginLeft: '4px' }}>
                          — check it!
                        </span>
                      )}
                      {n.type === 'invite_accept' && (
                        <span style={{ color: '#2e7d32', fontWeight: 700, marginLeft: '4px' }}>
                          (joined squad)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Unread indicator dot */}
                {!n.read && (
                  <div 
                    title="Unread"
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#58CC02',
                      flexShrink: 0,
                      marginTop: '6px'
                    }} 
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.65rem 1rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#fafbfc',
          fontSize: '0.72rem',
          color: '#6b7280'
        }}>
          <span>{notifications.length} activity {notifications.length === 1 ? 'event' : 'events'}</span>
          <button
            type="button"
            onClick={onClearAll}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <Trash2 size={12} />
            <span>Clear all</span>
          </button>
        </div>
      )}
    </div>
  );
}
