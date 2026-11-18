import React, { useState, useEffect, useRef } from 'react';
import { getDefaultAvatar } from '../services/avatarService';
import NotificationsDropdown from './NotificationsDropdown';
import BrandLogo from './BrandLogo';
import { 
  Home, 
  Ticket, 
  MessageSquare, 
  MessagesSquare, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenAuth, 
  onLogout,
  acceptedCount = 0,
  notifications = [],
  unreadNotificationCount = 0,
  isNotificationsOpen = false,
  onToggleNotifications,
  onCloseNotifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearAllNotifications,
  onNotificationNavigate
}) {
  const [isShaking, setIsShaking] = useState(false);
  const prevCountRef = useRef(unreadNotificationCount);

  // Mobile horizontal nav scroll state
  const navScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkNavScroll = () => {
    const el = navScrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 4;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    checkNavScroll();
    window.addEventListener('resize', checkNavScroll);
    const timer = setTimeout(checkNavScroll, 120);
    return () => {
      window.removeEventListener('resize', checkNavScroll);
      clearTimeout(timer);
    };
  }, []);

  // When active tab changes, smooth-scroll it into view and update buttons
  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector('.nav-btn.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    const timer = setTimeout(checkNavScroll, 320);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleSlideLeft = (e) => {
    e.stopPropagation();
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({ left: -180, behavior: 'smooth' });
      setTimeout(checkNavScroll, 300);
    }
  };

  const handleSlideRight = (e) => {
    e.stopPropagation();
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({ left: 180, behavior: 'smooth' });
      setTimeout(checkNavScroll, 300);
    }
  };

  // Trigger bell shake whenever the unread count increases
  useEffect(() => {
    if (unreadNotificationCount > prevCountRef.current) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 1000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadNotificationCount;
  }, [unreadNotificationCount]);

  // Trigger bell shake whenever a live notification event arrives
  useEffect(() => {
    const handleNewNotif = (e) => {
      if (!currentUser || (e.detail && e.detail.recipientId === currentUser.id)) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 1000);
      }
    };
    window.addEventListener('fic_notification_received', handleNewNotif);
    return () => {
      window.removeEventListener('fic_notification_received', handleNewNotif);
    };
  }, [currentUser]);

  return (
    <header className="header-container">
      <div className="header-content">
        {/* Brand Logo: Symbol Icon + Wordmark */}
        <BrandLogo 
          size={38}
          onClick={() => setActiveTab('home')}
        />

        {/* Navigation Tabs with Mobile Slide Controls */}
        <div className="nav-scroll-wrapper">
          {canScrollLeft && (
            <button 
              type="button"
              className="nav-slide-btn nav-slide-left"
              onClick={handleSlideLeft}
              aria-label="Slide back to previous tabs"
              title="Slide back"
            >
              <ChevronLeft size={14} />
              <span className="nav-slide-label">Back</span>
            </button>
          )}

          <nav 
            className="nav-links"
            ref={navScrollRef}
            onScroll={checkNavScroll}
          >
            <button 
              className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Home size={15} />
              <span>Home</span>
            </button>

            <button 
              className={`nav-btn ${activeTab === 'concerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('concerts')}
            >
              <Ticket size={15} />
              <span>Concert Invites</span>
            </button>

            <button 
              className={`nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <MessageSquare size={15} />
              <span>Reviews</span>
            </button>

            <button 
              className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
              style={{ position: 'relative' }}
            >
              <MessagesSquare size={15} />
              <span>Concert Chat</span>
              {acceptedCount > 0 && (
                <span style={{
                  backgroundColor: 'var(--btn-accept)',
                  color: '#fff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '999px',
                  marginLeft: '3px'
                }}>
                  {acceptedCount}
                </span>
              )}
            </button>

            <button 
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={15} />
              <span>My Profile</span>
            </button>
          </nav>

          {canScrollRight && (
            <button 
              type="button"
              className="nav-slide-btn nav-slide-right"
              onClick={handleSlideRight}
              aria-label="Slide right for more options"
              title="Slide for more options"
            >
              <span className="nav-slide-label">Slide</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Auth / User area (Header Actions) */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {/* Notifications Dropdown Anchor (Always accessible in Navbar) */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={onToggleNotifications}
              className={`btn-secondary ${isShaking ? 'bell-shake' : ''}`}
              style={{
                position: 'relative',
                padding: '0.35rem 0.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isNotificationsOpen ? '#eefcf0' : unreadNotificationCount > 0 ? '#f0fdf4' : '#ffffff',
                borderColor: isNotificationsOpen || unreadNotificationCount > 0 ? '#58CC02' : '#d5d5d5',
                cursor: 'pointer',
                transformOrigin: 'top center'
              }}
              title={`Activity Notifications ${unreadNotificationCount > 0 ? `(${unreadNotificationCount} unread)` : ''}`}
              aria-label="View notifications"
            >
              <Bell 
                size={16} 
                color={isNotificationsOpen || unreadNotificationCount > 0 ? '#58CC02' : '#1f2328'}
                className={isShaking ? 'bell-shake' : ''}
                style={{ transformOrigin: 'top center' }}
              />
              {unreadNotificationCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#FF9600',
                  color: '#ffffff',
                  fontSize: '0.66rem',
                  fontWeight: 900,
                  padding: '0 5px',
                  borderRadius: '999px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  lineHeight: 1
                }}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Dropdown in the Navbar */}
            <NotificationsDropdown 
              isOpen={isNotificationsOpen}
              onClose={onCloseNotifications}
              notifications={notifications}
              onMarkAsRead={onMarkNotificationRead}
              onMarkAllAsRead={onMarkAllNotificationsRead}
              onClearAll={onClearAllNotifications}
              onNavigate={onNotificationNavigate}
            />
          </div>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
              {/* Real User Pill */}
              <div 
                className="user-badge"
                onClick={() => setActiveTab('profile')}
                style={{ padding: '0.25rem 0.6rem', gap: '0.4rem' }}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="user-avatar-sm"
                  style={{ width: '22px', height: '22px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getDefaultAvatar(currentUser.name);
                  }}
                />
                <span className="nav-user-name" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                  {currentUser.name}
                </span>
              </div>

              {/* Logout Button */}
              <button 
                onClick={onLogout} 
                className="btn-secondary" 
                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', gap: '3px' }}
                title="Logout"
              >
                <LogOut size={13} />
                <span className="nav-btn-label">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
              <button 
                onClick={() => onOpenAuth('login')}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.32rem 0.65rem', gap: '3px' }}
              >
                <LogIn size={13} />
                <span>Login</span>
              </button>
              <button 
                onClick={() => onOpenAuth('register')}
                className="btn-positive"
                style={{ fontSize: '0.78rem', padding: '0.32rem 0.65rem', gap: '3px' }}
              >
                <UserPlus size={13} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
