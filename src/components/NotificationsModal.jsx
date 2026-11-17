import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Heart, 
  Trash2, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { getDefaultAvatar } from '../services/avatarService';

export default function NotificationsModal({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onClearAll, 
  onNavigate 
}) {
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  if (!isOpen) return null;

  const filteredList = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getActionBadge = (type) => {
    switch (type) {
      case 'invite_view':
        return (
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            backgroundColor: '#1CB0F6',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff'
          }}>
            <Eye size={10} color="#ffffff" />
          </div>
        );
      case 'invite_accept':
        return (
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            backgroundColor: '#58CC02',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff'
          }}>
            <CheckCircle2 size={10} color="#ffffff" />
          </div>
        );
      case 'invite_reject':
        return (
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            backgroundColor: '#FF9600',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff'
          }}>
            <XCircle size={10} color="#ffffff" />
          </div>
        );
      case 'chat_message':
        return (
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            backgroundColor: '#CE82FF',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff'
          }}>
            <MessageSquare size={10} color="#ffffff" />
          </div>
        );
      case 'review_like':
        return (
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            backgroundColor: '#FF4B4B',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff'
          }}>
            <Heart size={10} color="#ffffff" fill="#ffffff" />
          </div>
        );
      default:
        return null;
    }
  };

  const handleNotificationClick = (n) => {
    onMarkAsRead(n.id);
    if (n.type === 'chat_message') {
      onNavigate('chat', n.inviteId);
    } else if (n.inviteId) {
      onNavigate('concerts', n.inviteId);
    } else if (n.reviewId) {
      onNavigate('reviews');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      zIndex: 1100,
      padding: '1rem',
      backdropFilter: 'blur(3px)'
    }}
    onClick={onClose}
    >
      <div 
        className="fic-container"
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          padding: '1.25rem',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '4rem',
          marginRight: '1rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#eefcf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={16} color="#58CC02" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#111827' }}>
              Activity Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="badge badge-orange" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
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
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', gap: '3px' }}
                title="Mark all as read"
              >
                <CheckCheck size={13} color="#58CC02" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#6c757d'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '0.75rem 0',
          borderBottom: '1px solid #f1f3f5'
        }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              border: filter === 'all' ? '1.5px solid #58CC02' : '1.5px solid transparent',
              background: filter === 'all' ? '#eefcf0' : '#f8f9fa',
              color: filter === 'all' ? '#2e7d32' : '#6c757d',
              cursor: 'pointer'
            }}
          >
            All Activity ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              border: filter === 'unread' ? '1.5px solid #FF9600' : '1.5px solid transparent',
              background: filter === 'unread' ? '#fff7ed' : '#f8f9fa',
              color: filter === 'unread' ? '#b45309' : '#6c757d',
              cursor: 'pointer'
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {filteredList.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: '#8c959f'
            }}>
              <Bell size={36} color="#d1d5db" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#374151' }}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '4px auto 0', maxWidth: '300px' }}>
                When other gig fans view, accept, or pass on your concert invites, you will see real-time alerts here!
              </p>
            </div>
          ) : (
            filteredList.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                  border: n.read ? '1px solid #e5e7eb' : '1.5px solid #bbf7d0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {/* Sender Avatar with Action Badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={n.sender?.avatar || getDefaultAvatar(n.sender?.name)}
                    alt={n.sender?.name || 'User'}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                      backgroundColor: '#f3f4f6'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDefaultAvatar(n.sender?.name);
                    }}
                  />
                  {getActionBadge(n.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', flexShrink: 0 }}>
                      {n.createdAt}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.8rem',
                    color: '#4b5563',
                    margin: '3px 0 0',
                    lineHeight: 1.4,
                    wordBreak: 'break-word'
                  }}>
                    {n.message}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#58CC02',
                    flexShrink: 0,
                    marginTop: '6px'
                  }} />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e5e7eb',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            <span>Notifications saved locally & synced</span>
            <button
              type="button"
              onClick={onClearAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Trash2 size={13} />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
