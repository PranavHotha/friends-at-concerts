import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Check, 
  X as XIcon, 
  Clock, 
  Sparkles, 
  MessagesSquare,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Lock
} from 'lucide-react';
import { getDefaultAvatar } from '../services/avatarService';
import { isLondonCity, inviteService, chatService } from '../services/storageService';
import { fetchArtistPhoto, getGenreBackdrop } from '../services/artistImageService';

export default function ConcertsPage({ 
  invites, 
  currentUser, 
  onAcceptInvite, 
  onRejectInvite, 
  onCreateInvite,
  onDeleteInvite,
  onOpenChat,
  onOpenAuth
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Automatically record view events for visible invites (author excluded, deduplicated)
  useEffect(() => {
    if (currentUser && invites && invites.length > 0) {
      invites.forEach(inv => {
        if (currentUser.id !== inv.author?.id) {
          inviteService.recordInviteView(inv.id, currentUser);
        }
      });
    }
  }, [invites, currentUser]);

  // New Invite form state
  const [artist, setArtist] = useState('');
  const [tourName, setTourName] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('London, UK');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('7:30 PM');
  const [genre, setGenre] = useState('Rock / Pop');
  const [requiredSpots, setRequiredSpots] = useState(2);
  const [ticketStatus, setTicketStatus] = useState('');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [isSearchingImage, setIsSearchingImage] = useState(false);

  // Auto-lookup official artist photo or fallback to genre visual (Option 1 & 3)
  useEffect(() => {
    if (!artist.trim()) {
      setPreviewImage(getGenreBackdrop(genre));
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingImage(true);
      const photo = await fetchArtistPhoto(artist, genre);
      setPreviewImage(photo);
      setIsSearchingImage(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [artist, genre]);

  const filteredInvites = invites.filter((inv) => {
    const q = searchTerm.toLowerCase();
    return (
      (inv.artist || '').toLowerCase().includes(q) ||
      (inv.city || '').toLowerCase().includes(q) ||
      (inv.venue || '').toLowerCase().includes(q) ||
      (inv.genre || '').toLowerCase().includes(q)
    );
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!artist || !venue || !city || !date) {
      alert('Please fill in Artist, Venue, City, and Date.');
      return;
    }
    if (!isLondonCity(city)) {
      alert('🚫 Concert invites are currently exclusive to London venues. Only London is accepted!');
      return;
    }

    const finalImage = previewImage || await fetchArtistPhoto(artist, genre);

    onCreateInvite({
      artist,
      tourName: tourName || `${artist} London Live`,
      venue,
      city,
      date,
      time,
      genre,
      imageUrl: finalImage,
      requiredSpots: parseInt(requiredSpots, 10) || 2,
      ticketStatus: ticketStatus || 'Pitch Standing / Reserved Seating',
      description: description || `Looking for ${requiredSpots} London music lovers to join me for ${artist}!`
    });

    // Reset & close
    setIsModalOpen(false);
    setArtist('');
    setTourName('');
    setVenue('');
    setCity('London, UK');
    setDate('');
    setDescription('');
    setPreviewImage('');
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#111827', margin: 0 }}>
              London Concert Invites
            </h1>
            <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>
              🇬🇧 London Only
            </span>
          </div>
          <p style={{ color: '#59636e', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Find Londoners looking for gig buddies or post your own London show squad invite
          </p>
        </div>

        <button 
          className="btn-positive"
          onClick={() => {
            if (!currentUser) {
              onOpenAuth('login');
            } else {
              setIsModalOpen(true);
            }
          }}
          style={{ padding: '0.8rem 1.4rem', fontSize: '0.92rem' }}
        >
          <Plus size={18} />
          <span>Post a Concert Invite</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="fic-container" style={{ padding: '1rem 1.25rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            size={18} 
            color="#8c959f" 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem', background: '#ffffff' }}
            placeholder="Search London gigs by artist (e.g. Coldplay, Taylor Swift) or London venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Invites Grid */}
      {filteredInvites.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--container-bg)',
          borderRadius: '16px',
          border: '1px solid var(--container-border)'
        }}>
          <Ticket size={48} color="#8c959f" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No concert invites found</h3>
          <p style={{ color: '#59636e', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Try searching for another artist or be the first to post an invite!
          </p>
          <button 
            className="btn-positive"
            onClick={() => setIsModalOpen(true)}
            style={{ marginTop: '1.25rem' }}
          >
            <Plus size={16} />
            <span>Post This Invite</span>
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {filteredInvites.map((inv) => {
            const isFull = inv.acceptedCount >= inv.requiredSpots;
            const spotsRemaining = Math.max(0, inv.requiredSpots - inv.acceptedCount);
            const userResponse = currentUser && inv.userResponses ? inv.userResponses[currentUser.id] : null;
            const isAccepted = userResponse === 'accepted';
            const isRejected = userResponse === 'rejected';
            const isAuthor = Boolean(currentUser && inv.author && inv.author.id === currentUser.id);

            return (
              <div 
                key={inv.id} 
                className="fic-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: isAccepted ? '2px solid #58CC02' : '1.5px solid #d5d5d5',
                  position: 'relative'
                }}
              >
                {/* Visual Concert Poster Banner (Option 1 & 3) */}
                <div style={{
                  height: '140px',
                  margin: '-1.25rem -1.25rem 1rem -1.25rem',
                  borderTopLeftRadius: '10px',
                  borderTopRightRadius: '10px',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#111827'
                }}>
                  <img 
                    src={inv.imageUrl || getGenreBackdrop(inv.genre)} 
                    alt={inv.artist}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getGenreBackdrop(inv.genre);
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)'
                  }} />

                  {/* Floating Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span className="badge badge-purple" style={{ backdropFilter: 'blur(4px)', background: 'rgba(237, 233, 254, 0.95)' }}>
                      {inv.genre}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {isAuthor && (
                        <span className="badge badge-gray" style={{ fontWeight: 800, background: '#fff' }}>
                          Your Post
                        </span>
                      )}
                      <span 
                        className={`badge ${isFull ? 'badge-orange' : 'badge-green'}`}
                        style={{ fontWeight: 800, background: isFull ? '#FF9600' : '#58CC02', color: '#fff' }}
                      >
                        {spotsRemaining === 0 ? 'Full' : `${spotsRemaining} spots left`}
                      </span>
                    </div>
                  </div>

                  {/* Artist & Tour name overlaid on banner */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    right: '12px',
                    color: '#ffffff'
                  }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                      {inv.artist}
                    </h2>
                    <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      {inv.tourName}
                    </div>
                  </div>
                </div>

                {/* Date, Location, Ticket info */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  fontSize: '0.88rem',
                  color: '#2b3a4a',
                  marginBottom: '1rem',
                  background: '#f8f9fa',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #eef0f2'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#1f2328" />
                    <strong>{inv.date}</strong> at <span>{inv.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#1f2328" />
                    <span>{inv.venue}, <strong>{inv.city}</strong></span>
                  </div>
                  {inv.ticketStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#59636e' }}>
                      <Ticket size={16} color="#58CC02" />
                      <span>{inv.ticketStatus}</span>
                    </div>
                  )}
                </div>

                {/* Host Description */}
                <p style={{
                  fontSize: '0.9rem',
                  color: '#333',
                  lineHeight: 1.5,
                  marginBottom: '1rem',
                  flex: 1
                }}>
                  {inv.description}
                </p>

                {/* Progress bar of spots */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    <span>Required Buddies: {inv.requiredSpots}</span>
                    <span style={{ color: isFull ? '#b36b00' : '#388402' }}>
                      {inv.acceptedCount} / {inv.requiredSpots} Joined
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, (inv.acceptedCount / inv.requiredSpots) * 100)}%`,
                      height: '100%',
                      backgroundColor: isFull ? 'var(--btn-reject)' : 'var(--btn-accept)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Attendees list */}
                {inv.acceptedUsers && inv.acceptedUsers.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '1rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(88, 204, 2, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(88, 204, 2, 0.2)'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#388402' }}>Crew:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      {inv.acceptedUsers.map((u, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', padding: '2px 6px', borderRadius: '999px', border: '1px solid #d5d5d5', fontSize: '0.75rem' }}>
                          <img 
                            src={u.avatar} 
                            alt={u.name} 
                            style={{ width: '18px', height: '18px', borderRadius: '50%' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getDefaultAvatar(u.name);
                            }}
                          />
                          <span>{u.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Host user badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #e1e4e8'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={inv.author?.avatar || getDefaultAvatar(inv.author?.name || 'Host')} 
                      alt={inv.author?.name || 'Host'}
                      style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getDefaultAvatar(inv.author?.name || 'Host');
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{inv.author?.name || 'Concert Host'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#666' }}>{inv.author?.city || inv.city || 'London, UK'}</div>
                    </div>
                  </div>

                  {(isAccepted || isAuthor) && (
                    chatService.isChatTerminated(inv.id) ? (
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          color: '#64748b', 
                          fontWeight: 700, 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          padding: '0.35rem 0.65rem', 
                          background: '#f1f5f9', 
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        <Lock size={12} color="#64748b" />
                        <span>Space Closed</span>
                      </span>
                    ) : (
                      <button 
                        className="btn-secondary"
                        onClick={() => onOpenChat(inv.id)}
                        style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', gap: '4px' }}
                      >
                        <MessagesSquare size={14} color="#58CC02" />
                        <span>Concert Chat</span>
                      </button>
                    )
                  )}
                </div>

                {/* Accept / Reject Buttons as requested */}
                {isAuthor ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{
                      padding: '0.65rem 0.85rem',
                      textAlign: 'center',
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>You're the Host (Part of the Crew)</span>
                    </div>

                    {onDeleteInvite && (
                      <button
                        type="button"
                        onClick={() => onDeleteInvite(inv.id)}
                        className="btn-secondary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '0.5rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#dc2626',
                          borderColor: '#fca5a5',
                          backgroundColor: '#fef2f2'
                        }}
                        title="Delete this concert invite post"
                      >
                        <Trash2 size={14} color="#dc2626" />
                        <span>Delete Invite Post</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button
                      className="btn-positive"
                      disabled={isFull && !isAccepted}
                      style={{
                        opacity: isFull && !isAccepted ? 0.45 : isAccepted ? 0.9 : 1,
                        backgroundColor: isAccepted ? '#3f9202' : 'var(--btn-accept)',
                        cursor: isFull && !isAccepted ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => {
                        if (!currentUser) onOpenAuth('login');
                        else onAcceptInvite(inv.id);
                      }}
                    >
                      <Check size={18} />
                      <span>{isAccepted ? 'Accepted ✓' : isFull ? 'Full' : 'Accept'}</span>
                    </button>

                    <button
                      className="btn-negative"
                      style={{
                        opacity: isRejected ? 0.8 : 1,
                        backgroundColor: isRejected ? '#b86d00' : 'var(--btn-reject)'
                      }}
                      onClick={() => {
                        if (!currentUser) onOpenAuth('login');
                        else onRejectInvite(inv.id);
                      }}
                    >
                      <XIcon size={18} />
                      <span>{isRejected ? 'Rejected / Passed' : 'Pass / Reject'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Post a Concert Invite Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={22} color="#58CC02" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Post a Concert Invite
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', padding: '4px', color: '#666' }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              {/* Live Artist Artwork / Poster Detection (Option 1 & 3) */}
              <div style={{
                marginBottom: '1.25rem',
                borderRadius: '10px',
                overflow: 'hidden',
                height: '110px',
                position: 'relative',
                border: '1.5px solid #d5d5d5',
                backgroundColor: '#111827'
              }}>
                <img 
                  src={previewImage || getGenreBackdrop(genre)} 
                  alt={artist || 'Concert stage'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#ffffff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#58CC02" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      {isSearchingImage ? 'Auto-searching official artist art...' : artist ? `Auto-found: ${artist}` : `${genre} Stage Visual`}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                    0 MB Server Storage
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Artist / Band Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Coldplay, Billie Eilish, Kendrick Lamar"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tour / Event Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Music of the Spheres World Tour"
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                />
              </div>

              <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '1.2rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Venue *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Wembley Stadium, The O2, Ally Pally"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>City *</span>
                    <span style={{ color: '#58CC02', fontWeight: 800 }}>🇬🇧 London Only</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="London, UK"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '1.2rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Concert Date *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Door / Show Time</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 7:30 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '1.2rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Required Number of Invites/Spots *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    className="form-input" 
                    value={requiredSpots}
                    onChange={(e) => setRequiredSpots(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Music Genre</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Pop, Indie, Metal, EDM"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ticket Details</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. GA Standing Floor, Section 102 Row 10, or Need to buy together"
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Invite Message & Plans</label>
                <textarea 
                  className="form-textarea" 
                  rows="3"
                  placeholder="Describe your concert vibe: e.g. Who wants to join me? We can grab food beforehand, line up for floor barricade, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-positive"
                  style={{ flex: 2 }}
                >
                  <Check size={18} />
                  <span>Publish Concert Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
