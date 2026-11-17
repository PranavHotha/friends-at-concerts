import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Ticket, 
  Calendar, 
  Music, 
  MapPin, 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  Plus, 
  MessagesSquare, 
  ExternalLink,
  Lock,
  Trash2,
  AlertTriangle,
  Edit3,
  Shuffle,
  X
} from 'lucide-react';
import { isLondonCity, chatService } from '../services/storageService';
import { PRESET_AVATARS, getRandomDuoAvatar, getDefaultAvatar } from '../services/avatarService';

export default function ProfilePage({ 
  currentUser, 
  invites, 
  onNavigate, 
  onSelectInviteId, 
  onOpenAuth,
  onDeleteAccount,
  onUpdateProfile,
  onDeleteInvite
}) {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'myInvites'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCity, setEditCity] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editArtists, setEditArtists] = useState('');
  const [editGenres, setEditGenres] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = () => {
    setEditCity(currentUser?.city || 'London, UK');
    setEditBio(currentUser?.bio || '');
    setEditArtists(Array.isArray(currentUser?.favoriteArtists) ? currentUser.favoriteArtists.join(', ') : '');
    setEditGenres(Array.isArray(currentUser?.favoriteGenres) ? currentUser.favoriteGenres.join(', ') : '');
    setEditAvatar(currentUser?.avatar || '');
    setEditError('');
    setShowEditModal(true);
  };

  const handleShuffleAvatar = () => {
    setEditAvatar(getRandomDuoAvatar());
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editCity.trim()) {
      setEditError('City cannot be empty.');
      return;
    }
    if (!isLondonCity(editCity)) {
      setEditError('🚫 City must be in London (e.g. Camden, Brixton, Hackney, Islington, London).');
      return;
    }

    setIsSaving(true);
    setEditError('');
    if (onUpdateProfile) {
      const res = await onUpdateProfile({
        city: editCity,
        bio: editBio,
        favoriteArtists: editArtists,
        favoriteGenres: editGenres,
        avatar: editAvatar
      });
      if (res && res.success) {
        setShowEditModal(false);
      } else if (res && res.error) {
        setEditError(res.error);
      }
    }
    setIsSaving(false);
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Please Log In to View Your Profile</h2>
        <p style={{ color: '#59636e', maxWidth: '460px', margin: '0.5rem auto 1.5rem' }}>
          Track your concert buddy stats, keep in touch with friends made at previous shows, and view upcoming tours.
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

  // Get user's created and accepted invites
  const myCreatedInvites = invites.filter(inv => inv.author && inv.author.id === currentUser.id);
  const myAcceptedInvites = invites.filter(inv => 
    inv.userResponses && inv.userResponses[currentUser.id] === 'accepted'
  );

  const friendsList = currentUser.friends || [];

  return (
    <div>
      {/* Profile Header Card */}
      <div className="fic-container" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getDefaultAvatar(currentUser.name);
            }}
          />

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', margin: 0 }}>
                  {currentUser.name}
                </h1>
                <span className="badge badge-green">London Gig Member</span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleOpenEdit}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#59636e', marginBottom: '0.6rem' }}>
              <MapPin size={15} />
              <span>{currentUser.city}</span>
              <span>•</span>
              <span>{currentUser.email}</span>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#333', lineHeight: 1.5, margin: 0, maxWidth: '650px' }}>
              {currentUser.bio}
            </p>
          </div>
        </div>

        {/* Favorite Artists & Genres Tags */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1.5px solid #c8cbd0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#59636e', marginBottom: '0.4rem' }}>
              Favorite Artists
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(currentUser.favoriteArtists && currentUser.favoriteArtists.length > 0) ? (
                currentUser.favoriteArtists.map((artist, idx) => (
                  <span key={idx} className="badge badge-purple" style={{ fontSize: '0.8rem' }}>
                    <Music size={12} />
                    <span>{artist}</span>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#888' }}>No favorite artists added yet</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#59636e', marginBottom: '0.4rem' }}>
              Music Genres
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(currentUser.favoriteGenres && currentUser.favoriteGenres.length > 0) ? (
                currentUser.favoriteGenres.map((genre, idx) => (
                  <span key={idx} className="badge badge-gray" style={{ fontSize: '0.8rem' }}>
                    {genre}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#888' }}>No genres listed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        <div className="fic-card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#111827' }}>
            {currentUser.concertsAttended || 0}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#59636e', textTransform: 'uppercase' }}>
            Concerts Attended
          </div>
        </div>

        <div className="fic-card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#58CC02' }}>
            {friendsList.length}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#59636e', textTransform: 'uppercase' }}>
            Concert Friends
          </div>
        </div>

        <div className="fic-card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FF9600' }}>
            {myCreatedInvites.length}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#59636e', textTransform: 'uppercase' }}>
            Invites Created
          </div>
        </div>

        <div className="fic-card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#7848f4' }}>
            {myAcceptedInvites.length}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#59636e', textTransform: 'uppercase' }}>
            Squads Joined
          </div>
        </div>
      </div>

      {/* Friends & Activity Section */}
      <div>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '2px solid #d5d5d5',
          marginBottom: '1.5rem',
          paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => setActiveTab('friends')}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              borderRadius: '8px',
              background: activeTab === 'friends' ? '#1f2328' : 'transparent',
              color: activeTab === 'friends' ? '#ffffff' : '#59636e',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={16} />
            <span>Friends from Concerts ({friendsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('myInvites')}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              borderRadius: '8px',
              background: activeTab === 'myInvites' ? '#1f2328' : 'transparent',
              color: activeTab === 'myInvites' ? '#ffffff' : '#59636e',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Ticket size={16} />
            <span>My Upcoming Shows ({myAcceptedInvites.length + myCreatedInvites.length})</span>
          </button>
        </div>

        {/* Tab 1: Friends from Concerts */}
        {activeTab === 'friends' && (
          <div>
            {friendsList.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'var(--container-bg)',
                borderRadius: '12px'
              }}>
                <Users size={40} color="#8c959f" style={{ margin: '0 auto 0.8rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No concert friends added yet</h3>
                <p style={{ color: '#59636e', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                  When you accept an invite or someone joins your concert squad, they appear as a concert buddy here so you can plan future shows together!
                </p>
                <button 
                  className="btn-positive"
                  onClick={() => onNavigate('concerts')}
                  style={{ marginTop: '1rem' }}
                >
                  <Ticket size={16} />
                  <span>Explore Concert Invites</span>
                </button>
              </div>
            ) : (
              <div className="grid-3">
                {friendsList.map((friend) => (
                  <div key={friend.id} className="fic-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                      src={friend.avatar} 
                      alt={friend.name}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getDefaultAvatar(friend.name);
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 2px', color: '#111827' }}>
                        {friend.name}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: '#59636e', margin: 0 }}>
                        {friend.mutualConcerts || 1} show(s) together
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                          ✓ Connected
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Upcoming Shows */}
        {activeTab === 'myInvites' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...myCreatedInvites, ...myAcceptedInvites].length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'var(--container-bg)',
                borderRadius: '12px'
              }}>
                <Calendar size={40} color="#8c959f" style={{ margin: '0 auto 0.8rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No upcoming shows planned</h3>
                <p style={{ color: '#59636e', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                  Accept a concert invite or post one to assemble your concert crew!
                </p>
              </div>
            ) : (
              [...myCreatedInvites, ...myAcceptedInvites].map((inv) => (
                <div 
                  key={inv.id} 
                  className="fic-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                        {inv.artist}
                      </h3>
                      <span className="badge badge-purple">{inv.tourName}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#59636e' }}>
                      {inv.venue}, {inv.city} • <strong>{inv.date}</strong> at {inv.time}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-green">
                      {inv.acceptedCount} / {inv.requiredSpots} Spots Filled
                    </span>

                    {chatService.isChatTerminated(inv.id) ? (
                      <span 
                        style={{ 
                          fontSize: '0.78rem', 
                          color: '#64748b', 
                          fontWeight: 700, 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          padding: '0.4rem 0.75rem', 
                          background: '#f1f5f9', 
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        <Lock size={13} color="#64748b" />
                        <span>Space Closed</span>
                      </span>
                    ) : (
                      <button 
                        className="btn-positive"
                        onClick={() => {
                          onSelectInviteId(inv.id);
                          onNavigate('chat');
                        }}
                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
                      >
                        <MessagesSquare size={16} />
                        <span>Open Chat Space</span>
                      </button>
                    )}

                    {inv.author?.id === currentUser.id && onDeleteInvite && (
                      <button
                        type="button"
                        onClick={() => onDeleteInvite(inv.id)}
                        className="btn-secondary"
                        style={{
                          padding: '0.5rem 0.8rem',
                          fontSize: '0.8rem',
                          color: '#dc2626',
                          borderColor: '#fca5a5',
                          backgroundColor: '#fef2f2',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Delete this concert invite post"
                      >
                        <Trash2 size={14} color="#dc2626" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Account Settings / Danger Zone */}
      <div 
        className="fic-container" 
        style={{ 
          marginTop: '2rem', 
          borderColor: '#fca5a5',
          backgroundColor: '#fff5f5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Trash2 size={18} color="#dc2626" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
              Delete Account
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', maxWidth: '580px' }}>
            Permanently remove your profile, hosted concert invites, reviews, and squad chat history. This action cannot be undone.
          </p>
        </div>

        <button
          type="button"
          className="btn-danger"
          onClick={() => setShowDeleteModal(true)}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
        >
          <Trash2 size={16} />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          backdropFilter: 'blur(3px)'
        }}>
          <div 
            className="fic-container" 
            style={{
              maxWidth: '460px',
              width: '100%',
              backgroundColor: '#ffffff',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '2px solid #fca5a5'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertTriangle size={30} color="#dc2626" />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, textAlign: 'center', color: '#111827', marginBottom: '0.5rem' }}>
              Delete Your Account?
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#59636e', textAlign: 'center', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to permanently delete your account for <strong>{currentUser.email}</strong>?
            </p>

            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              padding: '0.9rem',
              fontSize: '0.82rem',
              color: '#991b1b',
              marginBottom: '1.5rem',
              lineHeight: 1.5
            }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>This permanent action will:</strong>
              • Remove your profile and authentication credentials<br />
              • Cancel and remove all concert invites you created<br />
              • Delete all concert reviews and ratings you shared<br />
              • Revoke your access to all gig squad chat spaces
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Keep Account
              </button>

              <button
                type="button"
                className="btn-danger"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  if (onDeleteAccount) {
                    await onDeleteAccount(currentUser.id);
                  }
                  setIsDeleting(false);
                  setShowDeleteModal(false);
                }}
                style={{ flex: 1, padding: '0.75rem' }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          backdropFilter: 'blur(3px)'
        }}>
          <div 
            className="fic-container" 
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: '#ffffff',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#e6f7df',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Edit3 size={18} color="#58CC02" />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#111827' }}>
                  Edit Profile
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: 'transparent', padding: '4px', cursor: 'pointer', color: '#6c757d' }}
              >
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div style={{
                padding: '0.65rem 0.9rem',
                background: 'rgba(255, 150, 0, 0.15)',
                border: '1px solid #FF9600',
                color: '#b36b00',
                borderRadius: '6px',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                fontWeight: 600
              }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit}>
              {/* Profile Avatar Selection Box */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                border: '1.5px solid #e9ecef',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.85rem',
                  paddingBottom: '0.85rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <img 
                    src={editAvatar} 
                    alt="Selected Avatar" 
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #58CC02',
                      boxShadow: '0 4px 10px rgba(88,204,2,0.25)',
                      backgroundColor: '#ffffff'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDefaultAvatar(currentUser.name);
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Character:</span>
                      <span style={{ color: '#58CC02' }}>
                        {PRESET_AVATARS.find(p => p.url === editAvatar)?.label || 'Duolingo Character'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#59636e', marginTop: '2px' }}>
                      Choose your unique concert crew persona below.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleShuffleAvatar}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                    title="Roll another random illustrated portrait"
                  >
                    <Shuffle size={14} />
                    <span>Shuffle</span>
                  </button>
                </div>

                {/* Preset Avatars Grid */}
                <div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#6b7280',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Concert Animal Mascots with Headphones</span>
                    <span style={{ color: '#58CC02' }}>Click to select</span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '10px'
                  }}>
                    {PRESET_AVATARS.map((preset) => {
                      const isSelected = editAvatar === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setEditAvatar(preset.url)}
                          title={`${preset.category}: ${preset.label}`}
                          style={{
                            padding: 0,
                            background: 'none',
                            border: isSelected ? '3px solid #58CC02' : '2px solid transparent',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 0 0 2px rgba(88,204,2,0.35)' : 'none',
                            transform: isSelected ? 'scale(1.08)' : 'none'
                          }}
                        >
                          <img 
                            src={preset.url} 
                            alt={preset.label} 
                            style={{
                              width: '100%',
                              aspectRatio: '1/1',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Full Name - EXPLICITLY LOCKED AND READ-ONLY */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Full Name</span>
                  <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Lock size={12} /> Non-editable
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={currentUser.name} 
                    disabled 
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      cursor: 'not-allowed',
                      border: '1.5px solid #d1d5db',
                      fontWeight: 600,
                      paddingRight: '2rem'
                    }}
                  />
                  <Lock size={15} color="#9ca3af" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '3px', display: 'block' }}>
                  * Name cannot be changed to maintain trusted gig buddy identity.
                </span>
              </div>

              {/* Your City * (London Only) */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Your City *</span>
                  <span style={{ color: '#58CC02', fontWeight: 800 }}>🇬🇧 London Only</span>
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Camden, London (or Brixton, Hackney, Islington)"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  required
                />
              </div>

              {/* Concert Bio */}
              <div className="form-group">
                <label className="form-label">Concert Bio</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  placeholder="Tell concert buddies about your gig style, favorite venues, who you want to see live..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Favorite Artists */}
              <div className="form-group">
                <label className="form-label">Favorite Artists (comma-separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Coldplay, Wolf Alice, Fontaines D.C., Oasis"
                  value={editArtists}
                  onChange={(e) => setEditArtists(e.target.value)}
                />
              </div>

              {/* Music Genres */}
              <div className="form-group">
                <label className="form-label">Music Genres (comma-separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Indie Rock, Britpop, Post-Punk, Electronic"
                  value={editGenres}
                  onChange={(e) => setEditGenres(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isSaving}
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-positive"
                  disabled={isSaving}
                  style={{ padding: '0.65rem 1.4rem' }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
