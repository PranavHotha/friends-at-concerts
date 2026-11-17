import React, { useState } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Search, 
  Hash, 
  Star, 
  Heart, 
  Calendar, 
  MapPin, 
  Plus, 
  X as XIcon, 
  ExternalLink,
  Edit3,
  Trash2
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import { getDefaultAvatar } from '../services/avatarService';

export default function ReviewsPage({ 
  reviews, 
  currentUser, 
  onCreateReview, 
  onUpdateReview,
  onDeleteReview,
  onLikeReview, 
  onOpenAuth 
}) {
  const [activeHashtag, setActiveHashtag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New review form state
  const [artist, setArtist] = useState('');
  const [venue, setVenue] = useState('');
  const [concertDate, setConcertDate] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [extraHashtags, setExtraHashtags] = useState('');

  // Edit review state
  const [editingReview, setEditingReview] = useState(null);
  const [editArtist, setEditArtist] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editConcertDate, setEditConcertDate] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState('');
  const [editInstagramUrl, setEditInstagramUrl] = useState('');
  const [editExtraHashtags, setEditExtraHashtags] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Collect all unique hashtags across reviews
  const allHashtags = Array.from(
    new Set(reviews.flatMap((r) => r.hashtags || []))
  );

  // Filter logic
  const filteredReviews = reviews.filter((r) => {
    // Hashtag filter
    if (activeHashtag) {
      const matchTag = r.hashtags && r.hashtags.some(
        (t) => t.toLowerCase() === activeHashtag.toLowerCase()
      );
      if (!matchTag) return false;
    }

    // Text search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inArtist = (r.artist || '').toLowerCase().includes(q);
      const inText = (r.reviewText || '').toLowerCase().includes(q);
      const inVenue = (r.venue || '').toLowerCase().includes(q);
      const inTags = r.hashtags && r.hashtags.some((t) => (t || '').toLowerCase().includes(q));
      return inArtist || inText || inVenue || inTags;
    }

    return true;
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!artist || !venue || !concertDate || !reviewText) {
      alert('Please fill out Artist, Venue, Date, and Review text.');
      return;
    }

    onCreateReview({
      artist,
      venue,
      concertDate,
      rating,
      reviewText,
      instagramUrl,
      hashtags: extraHashtags
    });

    // Reset & close
    setIsModalOpen(false);
    setArtist('');
    setVenue('');
    setConcertDate('');
    setRating(5);
    setReviewText('');
    setInstagramUrl('');
    setExtraHashtags('');
  };

  const handleOpenEditModal = (rev) => {
    setEditingReview(rev);
    setEditArtist(rev.artist || '');
    setEditVenue(rev.venue || '');
    setEditConcertDate(rev.concertDate || '');
    setEditRating(rev.rating || 5);
    setEditReviewText(rev.reviewText || '');
    setEditInstagramUrl(rev.instagramUrl || '');
    // Auto hashtag is #artistName
    const autoTag = `#${(rev.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const customTags = (rev.hashtags || []).filter(t => t.toLowerCase() !== autoTag.toLowerCase()).join(' ');
    setEditExtraHashtags(customTags || (rev.hashtags || []).join(' '));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!editArtist || !editVenue || !editConcertDate || !editReviewText) {
      alert('Please fill out Artist, Venue, Date, and Review text.');
      return;
    }

    setIsUpdating(true);
    try {
      if (onUpdateReview && editingReview) {
        const res = await onUpdateReview(editingReview.id, {
          artist: editArtist,
          venue: editVenue,
          concertDate: editConcertDate,
          rating: editRating,
          reviewText: editReviewText,
          instagramUrl: editInstagramUrl,
          hashtags: editExtraHashtags
        });
        if (res && res.success) {
          setEditingReview(null);
        }
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {/* Header */}
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
              London Concert Reviews
            </h1>
            <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>
              🇬🇧 London Edition
            </span>
          </div>
          <p style={{ color: '#59636e', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Real fan reviews for London gigs with artist hashtags and shared Instagram photos
          </p>
        </div>

        <button 
          className="btn-positive"
          onClick={() => {
            if (!currentUser) onOpenAuth('login');
            else setIsModalOpen(true);
          }}
          style={{ padding: '0.8rem 1.4rem' }}
        >
          <Plus size={18} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Exclusive Hashtag Search & Filters */}
      <div className="fic-container" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
          <Hash size={18} color="#1f2328" />
          <span style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Filter by Artist or Tag:
          </span>
          {activeHashtag && (
            <button
              onClick={() => setActiveHashtag('')}
              style={{
                background: 'transparent',
                color: '#FF9600',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                marginLeft: 'auto'
              }}
            >
              <XIcon size={14} />
              Clear tag filter
            </button>
          )}
        </div>

        {/* Quick Hashtag Chips Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            className={`hashtag-chip ${activeHashtag === '' ? 'active' : ''}`}
            onClick={() => setActiveHashtag('')}
          >
            All Artists
          </button>
          {allHashtags.map((tag) => (
            <button
              key={tag}
              className={`hashtag-chip ${activeHashtag.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
              onClick={() => setActiveHashtag(tag === activeHashtag ? '' : tag)}
            >
              <Hash size={13} />
              <span>{tag.replace('#', '')}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
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
            placeholder="Search by artist, venue, or review comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--container-bg)',
          borderRadius: '16px',
          border: '1px solid var(--container-border)'
        }}>
          <MessageSquare size={48} color="#8c959f" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No concert reviews match your search</h3>
          <p style={{ color: '#59636e', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Be the first to write a review for this artist!
          </p>
          <button 
            className="btn-positive"
            onClick={() => setIsModalOpen(true)}
            style={{ marginTop: '1.25rem' }}
          >
            <Plus size={16} />
            <span>Write First Review</span>
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {filteredReviews.map((rev) => {
            const isAuthor = Boolean(currentUser && rev.author?.id && rev.author.id === currentUser.id);

            return (
              <div key={rev.id} className="fic-card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Top Bar: Artist & Star Rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#111827', margin: 0 }}>
                      {rev.artist}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#59636e', marginTop: '3px' }}>
                      <MapPin size={14} />
                      <span>{rev.venue}</span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(88, 204, 2, 0.12)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(88, 204, 2, 0.3)'
                  }}>
                    <Star size={16} fill="#58CC02" color="#58CC02" />
                    <span style={{ fontWeight: 800, color: '#2f6d02', fontSize: '0.9rem' }}>
                      {rev.rating}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#8c959f', marginBottom: '0.8rem' }}>
                  <Calendar size={13} />
                  <span>Show Date: {rev.concertDate}</span>
                </div>

                {/* Review Text */}
                <p style={{
                  fontSize: '0.92rem',
                  color: '#2b3a4a',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                  flex: 1
                }}>
                  "{rev.reviewText}"
                </p>

                {/* Instagram Photos / Reels Link Box */}
                {rev.instagramUrl ? (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#fdf7f9',
                    border: '1.5px solid #f2c7d9',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        borderRadius: '6px',
                        padding: '4px',
                        display: 'flex'
                      }}>
                        <InstagramIcon size={16} color="#ffffff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#901b54' }}>
                          Concert Photos & Reels on Instagram
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#666', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rev.instagramUrl}
                        </div>
                      </div>
                    </div>

                    <a 
                      href={rev.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        gap: '4px'
                      }}
                    >
                      <span>Open</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '0.5rem 0.8rem',
                    background: '#f8f9fa',
                    border: '1px dashed #d5d5d5',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#888'
                  }}>
                    No Instagram photos attached for this review.
                  </div>
                )}

                {/* Hashtags list */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {rev.hashtags && rev.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="hashtag-chip"
                      style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                      onClick={() => setActiveHashtag(tag)}
                    >
                      <Hash size={11} />
                      <span>{tag.replace('#', '')}</span>
                    </span>
                  ))}
                </div>

                {/* Author and Action buttons (Like, Edit, Delete) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.8rem',
                  borderTop: '1px solid #e1e4e8',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={rev.author?.avatar || getDefaultAvatar(rev.author?.name || 'Fan')} 
                      alt={rev.author?.name || 'Fan'}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getDefaultAvatar(rev.author?.name || 'Fan');
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{rev.author?.name || 'Concert Fan'}</span>
                        {isAuthor && (
                          <span style={{
                            fontSize: '0.68rem',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 700
                          }}>
                            You
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#8c959f' }}>Shared {rev.createdAt}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {isAuthor && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(rev)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#334155',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title="Edit your review"
                        >
                          <Edit3 size={13} color="#475569" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteReview && onDeleteReview(rev.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#dc2626',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title="Delete your review"
                        >
                          <Trash2 size={13} color="#dc2626" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => onLikeReview(rev.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: rev.isLikedByUser ? '#fff1f2' : '#f8f9fa',
                        border: rev.isLikedByUser ? '1.5px solid #fda4af' : '1.5px solid #d5d5d5',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: rev.isLikedByUser ? '#e11d48' : '#59636e',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: rev.isLikedByUser ? '0 2px 6px rgba(225, 29, 72, 0.15)' : 'none'
                      }}
                      title={rev.isLikedByUser ? 'Click to unlike' : 'Click to like'}
                    >
                      <Heart 
                        size={14} 
                        fill={rev.isLikedByUser ? '#e11d48' : 'none'} 
                        color={rev.isLikedByUser ? '#e11d48' : '#59636e'} 
                      />
                      <span>{rev.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={22} color="#58CC02" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Write a Concert Review
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', padding: '4px', color: '#666' }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Artist Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Coldplay (Will automatically create #coldplay)"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '1.2rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">London Venue *</label>
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
                  <label className="form-label">Date Attended *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={concertDate}
                    onChange={(e) => setConcertDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rating: {rating} / 5 Stars</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'transparent',
                        padding: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Star 
                        size={26} 
                        fill={star <= rating ? '#58CC02' : 'none'} 
                        color={star <= rating ? '#58CC02' : '#cbd5e1'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Review *</label>
                <textarea 
                  className="form-textarea" 
                  rows="4"
                  placeholder="How was the sound, stage performance, energy of the crowd, favorite song played live?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
              </div>

              {/* Instagram link option as requested in info.txt */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <InstagramIcon size={16} color="#bc1888" />
                  <span>Instagram Link (Photos & Videos)</span>
                </label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://www.instagram.com/p/... or /reel/..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                />
                <span style={{ fontSize: '0.74rem', color: '#666', marginTop: '2px' }}>
                  * No file upload needed — link your Instagram post or reel where you took photos of yourself or the artist!
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Extra Hashtags (#artist, #tour, #city)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="#wembley #musicofthespheres #livemusic"
                  value={extraHashtags}
                  onChange={(e) => setExtraHashtags(e.target.value)}
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
                  <span>Post Concert Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="modal-overlay" onClick={() => !isUpdating && setEditingReview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={22} color="#58CC02" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Edit Concert Review
                </h2>
              </div>
              <button 
                onClick={() => !isUpdating && setEditingReview(null)}
                style={{ background: 'transparent', padding: '4px', color: '#666' }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Artist Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Coldplay (Will automatically update #coldplay)"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '1.2rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">London Venue *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Wembley Stadium, The O2, Ally Pally"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date Attended *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={editConcertDate}
                    onChange={(e) => setEditConcertDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rating: {editRating} / 5 Stars</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      style={{
                        background: 'transparent',
                        padding: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Star 
                        size={26} 
                        fill={star <= editRating ? '#58CC02' : 'none'} 
                        color={star <= editRating ? '#58CC02' : '#cbd5e1'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Review *</label>
                <textarea 
                  className="form-textarea" 
                  rows="4"
                  placeholder="How was the sound, stage performance, energy of the crowd, favorite song played live?"
                  value={editReviewText}
                  onChange={(e) => setEditReviewText(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <InstagramIcon size={16} color="#bc1888" />
                  <span>Instagram Link (Photos & Videos)</span>
                </label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://www.instagram.com/p/... or /reel/..."
                  value={editInstagramUrl}
                  onChange={(e) => setEditInstagramUrl(e.target.value)}
                />
                <span style={{ fontSize: '0.74rem', color: '#666', marginTop: '2px' }}>
                  * Link your Instagram post or reel where you took photos or videos!
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Extra Hashtags (#artist, #tour, #city)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="#wembley #musicofthespheres #livemusic"
                  value={editExtraHashtags}
                  onChange={(e) => setEditExtraHashtags(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  disabled={isUpdating}
                  onClick={() => setEditingReview(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-positive"
                  disabled={isUpdating}
                  style={{ flex: 2 }}
                >
                  <span>{isUpdating ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
