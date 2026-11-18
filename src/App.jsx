import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import NotificationToast from './components/NotificationToast';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import ConcertsPage from './pages/ConcertsPage';
import ReviewsPage from './pages/ReviewsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import BrandLogo from './components/BrandLogo';
import { 
  initializeData, 
  syncInvitesFromCloud,
  syncReviewsFromCloud,
  syncChatsFromCloud,
  syncNotificationsFromCloud,
  authService, 
  inviteService, 
  reviewService,
  chatService,
  notificationService,
  getStored 
} from './services/storageService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Heart, Music, ShieldCheck, Ticket } from 'lucide-react';

// Persistent detection of password recovery link
const detectRecovery = () => {
  try {
    const hash = typeof window !== 'undefined' ? (window.location.hash || '') : '';
    const search = typeof window !== 'undefined' ? (window.location.search || '') : '';
    if (
      hash.includes('type=recovery') || 
      search.includes('type=recovery') || 
      search.includes('reset_password') || 
      hash.includes('reset_password')
    ) {
      sessionStorage.setItem('fic_pending_password_reset', 'true');
      return true;
    }
    return sessionStorage.getItem('fic_pending_password_reset') === 'true';
  } catch (e) {
    return false;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [invites, setInvites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedChatInviteId, setSelectedChatInviteId] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(() => detectRecovery());
  const [authMode, setAuthMode] = useState(() => detectRecovery() ? 'reset_password' : 'login');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userNotifications, setUserNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Initialize real data on mount
  useEffect(() => {
    const init = async () => {
      await initializeData();
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      setInvites(inviteService.getInvites());
      setReviews(reviewService.getReviews());
      setUserNotifications(notificationService.getNotifications(user?.id));
    };
    init();

    const handleNotifEvents = () => {
      const user = authService.getCurrentUser();
      setUserNotifications(notificationService.getNotifications(user?.id));
    };

    const handleChatEvents = () => {
      setInvites(inviteService.getInvites());
    };

    // Check if user landed from password reset email link
    const isRecovery = window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery');
    if (isRecovery) {
      setAuthMode('reset_password');
      setIsAuthOpen(true);
    }

    let authSubscription = null;
    let invitesChannel = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setAuthMode('reset_password');
          setIsAuthOpen(true);
        }
      });
      authSubscription = data?.subscription;

      invitesChannel = supabase
        .channel('public:universal_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invite_attendees' }, async () => {
          const updated = await syncInvitesFromCloud();
          setInvites(updated);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'concert_invites' }, async () => {
          const updated = await syncInvitesFromCloud();
          setInvites(updated);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'concert_reviews' }, async () => {
          const updatedReviews = await syncReviewsFromCloud();
          setReviews(updatedReviews);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, async () => {
          await syncChatsFromCloud();
          window.dispatchEvent(new CustomEvent('fic_chat_updated'));
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, async (payload) => {
          const cur = authService.getCurrentUser();
          if (cur?.id && payload?.new?.recipient_id === cur.id) {
            const updatedNotifs = await syncNotificationsFromCloud(cur.id);
            setUserNotifications(updatedNotifs);
            if (payload.new.message) {
              addNotification(payload.new.message, payload.new.type === 'invite_accept' ? 'accept' : 'info');
            }
          }
        })
        .subscribe();
    }

    const runUniversalSync = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const cur = authService.getCurrentUser();
      const [updatedInvites, updatedReviews] = await Promise.all([
        syncInvitesFromCloud(),
        syncReviewsFromCloud(),
        syncChatsFromCloud(),
        cur?.id ? syncNotificationsFromCloud(cur.id) : Promise.resolve([])
      ]);
      setInvites(updatedInvites);
      setReviews(updatedReviews);
      if (cur?.id) {
        setUserNotifications(notificationService.getNotifications(cur.id));
      }
      window.dispatchEvent(new CustomEvent('fic_chat_updated'));
    };

    const pollTimer = setInterval(runUniversalSync, 3000);
    window.addEventListener('focus', runUniversalSync);
    window.addEventListener('fic_notification_received', handleNotifEvents);
    window.addEventListener('fic_notification_updated', handleNotifEvents);
    window.addEventListener('fic_chat_updated', handleChatEvents);
    return () => {
      clearInterval(pollTimer);
      if (authSubscription) {
        try { authSubscription.unsubscribe(); } catch (e) {}
      }
      if (invitesChannel) {
        try { supabase.removeChannel(invitesChannel); } catch (e) {}
      }
      window.removeEventListener('focus', runUniversalSync);
      window.removeEventListener('fic_notification_received', handleNotifEvents);
      window.removeEventListener('fic_notification_updated', handleNotifEvents);
      window.removeEventListener('fic_chat_updated', handleChatEvents);
    };
  }, []);

  const addNotification = (message, type = 'success') => {
    // Visual toast feedback for user actions
    const newToast = { id: Date.now() + Math.random(), message, type };
    setToasts((prev) => [...prev.slice(-2), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    try { sessionStorage.removeItem('fic_pending_password_reset'); } catch (e) {}
    setIsAuthOpen(false);
  };

  const handleAuthSuccess = async (user, msg) => {
    try { sessionStorage.removeItem('fic_pending_password_reset'); } catch (e) {}
    setCurrentUser(user);
    setInvites(inviteService.getInvites());
    if (user) {
      setUserNotifications(notificationService.getNotifications(user.id));
      const [updatedInvites, updatedNotifs] = await Promise.all([
        syncInvitesFromCloud(),
        syncNotificationsFromCloud(user.id),
        syncChatsFromCloud()
      ]);
      setInvites(updatedInvites);
      setUserNotifications(updatedNotifs);
    }
    addNotification(msg, 'success');
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setUserNotifications([]);
    setInvites(inviteService.getInvites());
    addNotification('Logged out successfully', 'warning');
    setActiveTab('home');
  };

  const handleMarkNotificationRead = (id) => {
    notificationService.markAsRead(id);
    if (currentUser) {
      setUserNotifications(notificationService.getNotifications(currentUser.id));
    }
  };

  const handleMarkAllNotificationsRead = () => {
    if (currentUser) {
      notificationService.markAllAsRead(currentUser.id);
      setUserNotifications(notificationService.getNotifications(currentUser.id));
    }
  };

  const handleClearAllNotifications = () => {
    if (currentUser) {
      notificationService.clearAll(currentUser.id);
      setUserNotifications([]);
    }
  };

  const handleNotificationNavigate = (tab, entityId) => {
    if (tab === 'chat' && entityId) {
      if (chatService.isChatTerminated(entityId)) {
        addNotification('This concert coordination space has been concluded and closed.', 'warning');
        return;
      }
      setSelectedChatInviteId(entityId);
    }
    setActiveTab(tab);
  };

  const handleDeleteAccount = async (userId) => {
    const res = await authService.deleteAccount(userId);
    if (res.success) {
      setCurrentUser(null);
      setInvites(inviteService.getInvites());
      setReviews(reviewService.getReviews());
      addNotification('Your account and all associated data have been permanently deleted.', 'warning');
      setActiveTab('home');
    } else {
      addNotification(res.error || 'Failed to delete account', 'warning');
    }
  };

  const handleUpdateProfile = async (updatedFields) => {
    const res = await authService.updateProfile(updatedFields);
    if (res.success) {
      setCurrentUser(res.user);
      addNotification('Profile details updated successfully!', 'success');
      return { success: true };
    } else {
      addNotification(res.error || 'Failed to update profile', 'warning');
      return { success: false, error: res.error };
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    const inv = invites.find(i => i.id === inviteId);
    if (inv && inv.author && inv.author.id === currentUser.id) {
      addNotification('You are the host of this concert invite and already lead the crew!', 'warning');
      return;
    }
    const res = await inviteService.respondToInvite(inviteId, 'accept');
    if (res.success) {
      setInvites(inviteService.getInvites());
      setCurrentUser(authService.getCurrentUser());
      setSelectedChatInviteId(inviteId);
      addNotification(`Invite accepted! You've joined the ${res.invite.artist} concert crew! Chat unlocked!`, 'accept');
    } else {
      addNotification(res.error || 'Could not accept invite', 'warning');
    }
  };

  const handleRejectInvite = async (inviteId) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    const inv = invites.find(i => i.id === inviteId);
    if (inv && inv.author && inv.author.id === currentUser.id) {
      addNotification('You are the host of this concert invite and cannot pass on it.', 'warning');
      return;
    }
    const res = await inviteService.respondToInvite(inviteId, 'reject');
    if (res.success) {
      setInvites(inviteService.getInvites());
      setCurrentUser(authService.getCurrentUser());
      addNotification(`Passed on invite for ${res.invite.artist}`, 'reject');
    } else {
      addNotification(res.error || 'Could not pass on invite', 'warning');
    }
  };

  const handleCreateInvite = async (newInviteData) => {
    const created = await inviteService.createInvite(newInviteData);
    if (!created || created.error) {
      addNotification(created?.error || 'Could not post invite', 'warning');
      return;
    }
    setInvites(inviteService.getInvites());
    setCurrentUser(authService.getCurrentUser());
    addNotification(`Concert invite for ${created.artist} published successfully!`, 'accept');
  };

  const handleDeleteInvite = async (inviteId) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    const inv = invites.find(i => i.id === inviteId);
    if (!inv) return;

    const confirmed = window.confirm(`Are you sure you want to delete your concert invite for "${inv.artist}"? This cannot be undone.`);
    if (!confirmed) return;

    const res = await inviteService.deleteInvite(inviteId);
    if (res.success) {
      setInvites(inviteService.getInvites());
      setCurrentUser(authService.getCurrentUser());
      if (selectedChatInviteId === inviteId) {
        setSelectedChatInviteId(null);
      }
      addNotification(`Concert invite for ${inv.artist} deleted successfully.`, 'warning');
    } else {
      addNotification(res.error || 'Failed to delete invite', 'warning');
    }
  };

  const handleCreateReview = async (newReviewData) => {
    const created = await reviewService.createReview(newReviewData);
    setReviews(reviewService.getReviews());
    setCurrentUser(authService.getCurrentUser());
    if (created?.artist) {
      addNotification(`Review for ${created.artist} published with hashtag #${created.artist.toLowerCase().replace(/[^a-z0-9]/g, '')}!`, 'success');
    }
  };

  const handleUpdateReview = async (reviewId, updatedData) => {
    const res = await reviewService.updateReview(reviewId, updatedData);
    if (res.success) {
      setReviews(reviewService.getReviews());
      addNotification(`Review for ${res.review.artist} updated successfully!`, 'success');
      return { success: true };
    } else {
      addNotification(res.error || 'Failed to update review', 'warning');
      return { success: false, error: res.error };
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return;

    const confirmed = window.confirm(`Are you sure you want to delete your review for "${rev.artist}"? This cannot be undone.`);
    if (!confirmed) return;

    const res = await reviewService.deleteReview(reviewId);
    if (res.success) {
      setReviews(reviewService.getReviews());
      setCurrentUser(authService.getCurrentUser());
      addNotification(`Review for ${rev.artist} deleted successfully.`, 'warning');
    } else {
      addNotification(res.error || 'Failed to delete review', 'warning');
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!currentUser) {
      handleOpenAuth('login');
      addNotification('Please log in to like concert reviews!', 'warning');
      return;
    }
    const res = await reviewService.likeReview(reviewId, currentUser.id);
    if (res.success) {
      setReviews(reviewService.getReviews());
      if (res.isLiked) {
        addNotification('Liked review! ❤️', 'success');
      } else {
        addNotification('Removed like', 'warning');
      }
    } else if (res.error) {
      addNotification(res.error, 'warning');
    }
  };

  const handleOpenChat = (inviteId) => {
    setSelectedChatInviteId(inviteId);
    setActiveTab('chat');
  };

  // Count active chats for user (excluding terminated chats)
  const acceptedChatCount = invites.filter((inv) => {
    if (!currentUser) return false;
    if (chatService.isChatTerminated(inv.id)) return false;
    const isAuthor = Boolean(inv.author && inv.author.id === currentUser.id);
    const isAccepted = inv.userResponses && inv.userResponses[currentUser.id] === 'accepted';
    return isAuthor || isAccepted;
  }).length;

  // Count unread notifications
  const unreadNotificationCount = userNotifications.filter((n) => !n.read).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        acceptedCount={acceptedChatCount}
        notifications={userNotifications}
        unreadNotificationCount={unreadNotificationCount}
        isNotificationsOpen={isNotificationsOpen}
        onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
        onCloseNotifications={() => setIsNotificationsOpen(false)}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onClearAllNotifications={handleClearAllNotifications}
        onNotificationNavigate={handleNotificationNavigate}
      />

      {/* Main Content Area */}
      <main className="app-main" style={{ flex: 1 }}>
        <ErrorBoundary key={activeTab}>
          {activeTab === 'home' && (
            <HomePage 
              onNavigate={setActiveTab}
              invites={invites}
              reviews={reviews}
              currentUser={currentUser}
              onAcceptInvite={handleAcceptInvite}
              onRejectInvite={handleRejectInvite}
            />
          )}

          {activeTab === 'concerts' && (
            <ConcertsPage 
              invites={invites}
              currentUser={currentUser}
              onAcceptInvite={handleAcceptInvite}
              onRejectInvite={handleRejectInvite}
              onCreateInvite={handleCreateInvite}
              onDeleteInvite={handleDeleteInvite}
              onOpenChat={handleOpenChat}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsPage 
              reviews={reviews}
              currentUser={currentUser}
              onCreateReview={handleCreateReview}
              onUpdateReview={handleUpdateReview}
              onDeleteReview={handleDeleteReview}
              onLikeReview={handleLikeReview}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {activeTab === 'chat' && (
            <ChatPage 
              invites={invites}
              currentUser={currentUser}
              selectedInviteId={selectedChatInviteId}
              onSelectInviteId={setSelectedChatInviteId}
              onNavigate={setActiveTab}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage 
              currentUser={currentUser}
              invites={invites}
              onNavigate={setActiveTab}
              onSelectInviteId={setSelectedChatInviteId}
              onOpenAuth={handleOpenAuth}
              onDeleteAccount={handleDeleteAccount}
              onUpdateProfile={handleUpdateProfile}
              onDeleteInvite={handleDeleteInvite}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '2px solid #d5d5d5',
        backgroundColor: '#f8f9fa',
        padding: '2.5rem 1.5rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <BrandLogo size={34} onClick={() => setActiveTab('home')} />
            <div style={{ fontSize: '0.75rem', color: '#59636e' }}>
              Make friends at concerts, from concerts, so you can go together in future.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#59636e' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>Home</span>
            <span>•</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('concerts')}>Concert Invites</span>
            <span>•</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('reviews')}>Concert Reviews</span>
            <span>•</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('chat')}>Chat Space</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: '#555',
            background: '#ffffff',
            padding: '4px 12px',
            borderRadius: '999px',
            border: '1px solid #d5d5d5'
          }}>
            <span style={{ fontSize: '0.9rem' }}>🇬🇧</span>
            <span>London Gig Community</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={handleCloseAuth}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Action Feedback Toast */}
      <NotificationToast 
        notifications={toasts}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}
