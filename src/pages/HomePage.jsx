import React from 'react';
import { getDefaultAvatar } from '../services/avatarService';
import { 
  Users, 
  Ticket, 
  MessageSquare, 
  MessagesSquare, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Check, 
  X as XIcon, 
  Hash, 
  Heart,
  Music2,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import { getGenreBackdrop } from '../services/artistImageService';

export default function HomePage({ 
  onNavigate, 
  invites, 
  reviews, 
  currentUser, 
  onAcceptInvite, 
  onRejectInvite 
}) {
  const featuredInvites = invites.slice(0, 3);
  const featuredReview = reviews[0];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #f7f9fa 0%, #ffffff 100%)',
        border: '2px solid #d5d5d5',
        borderRadius: '16px',
        padding: '3rem 2rem',
        marginBottom: '2.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(88,204,2,0.18) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#eef2f6',
          border: '1.5px solid #d5d5d5',
          padding: '0.35rem 0.9rem',
          borderRadius: '999px',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: '#1f2328',
          marginBottom: '1.25rem'
        }}>
          <Sparkles size={16} color="#58CC02" />
          <span>Exclusively for London Music Fans & Gigs</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.035em',
          lineHeight: 1.15,
          color: '#111827',
          maxWidth: '750px',
          margin: '0 auto 1.25rem'
        }}>
          Make Friends at London Concerts, <br />
          <span style={{ 
            background: 'linear-gradient(90deg, #111827 0%, #3f4752 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            So You Can Go Together in Future.
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
          fontWeight: 500,
          letterSpacing: '-0.015em',
          color: '#495057',
          maxWidth: '640px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          Don't miss a gig because your mates can't make it. Connect with fellow music fans, find concert buddies, unlock private chat spaces, and share reviews.
        </p>

        <div className="hero-btn-container" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button 
            className="btn-positive"
            onClick={() => onNavigate('concerts')}
            style={{ fontSize: '0.98rem', padding: '0.85rem 1.6rem' }}
          >
            <Ticket size={20} />
            <span>Browse Concert Invites</span>
          </button>

          <button 
            className="btn-secondary"
            onClick={() => onNavigate('reviews')}
            style={{ fontSize: '0.98rem', padding: '0.85rem 1.6rem' }}
          >
            <MessageSquare size={20} />
            <span>Explore #Artist Reviews</span>
          </button>
        </div>

        {/* Community Motto / Live Music Quote */}
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '1.75rem',
          borderTop: '1px solid #e1e4e8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.45rem'
        }}>
          <p style={{
            fontSize: '1.08rem',
            fontStyle: 'italic',
            fontWeight: 600,
            color: '#1f2328',
            maxWidth: '580px',
            margin: 0,
            lineHeight: 1.55
          }}>
            “The best concerts aren’t just about who is on stage — they’re about the people you scream the lyrics with.”
          </p>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#8c959f', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Never miss a London gig alone again
          </span>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827' }}>
            How Friends at Concert Works
          </h2>
          <p style={{ color: '#59636e', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Three simple steps from solo ticket holder to squad at the barricade.
          </p>
        </div>

        <div className="grid-3">
          <div className="fic-container" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#ffffff',
              border: '2px solid #d5d5d5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 0 #b3b7bd'
            }}>
              <Ticket size={28} color="#1f2328" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>
              1. Post or Find an Invite
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#59636e', lineHeight: 1.5 }}>
              Have an extra ticket or going solo? Share the artist, date, venue, and the required number of buddies you want to join you.
            </p>
          </div>

          <div className="fic-container" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#58CC02',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 0 #3f9202'
            }}>
              <Check size={28} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>
              2. Accept or Pass
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#59636e', lineHeight: 1.5 }}>
              Use the green <strong>Accept</strong> or orange <strong>Pass</strong> buttons. As soon as you accept, you fill one of the needed spots.
            </p>
          </div>

          <div className="fic-container" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#ffffff',
              border: '2px solid #d5d5d5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 0 #b3b7bd'
            }}>
              <MessagesSquare size={28} color="#1f2328" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>
              3. Unlock Private Chat
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#59636e', lineHeight: 1.5 }}>
              Accepting an invite immediately unlocks an exclusive chat room for your concert group to coordinate meetups, rides, and food!
            </p>
          </div>
        </div>
      </section>

      {/* Featured Invites Feed Preview */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
              Trending Concert Invites
            </h2>
            <p style={{ color: '#59636e', fontSize: '0.9rem' }}>
              Real people with spots ready for their concert squads
            </p>
          </div>
          <button 
            className="btn-secondary"
            onClick={() => onNavigate('concerts')}
          >
            <span>View All Invites</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {featuredInvites.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1.5px solid #d5d5d5'
          }}>
            <Ticket size={40} color="#8c959f" style={{ margin: '0 auto 0.8rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.3rem' }}>
              No Concert Invites Posted Yet
            </h3>
            <p style={{ color: '#59636e', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
              Be the first London music fan to post an invite and assemble your concert crew!
            </p>
            <button 
              className="btn-positive"
              onClick={() => onNavigate('concerts')}
            >
              <Ticket size={16} />
              <span>Post First Concert Invite</span>
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {featuredInvites.map((inv) => {
              const isFull = inv.acceptedCount >= inv.requiredSpots;
              const isAuthor = currentUser && inv.author && inv.author.id === currentUser.id;
              const userResponse = currentUser && inv.userResponses ? inv.userResponses[currentUser.id] : null;
              const isAccepted = userResponse === 'accepted';
              const isRejected = userResponse === 'rejected';

              return (
                <div key={inv.id} className="fic-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Concert Visual Banner (Option 1 & 3) */}
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

                    {/* Badges on banner */}
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
                      <span 
                        className={`badge ${isFull ? 'badge-orange' : 'badge-green'}`}
                        style={{ fontWeight: 800, background: isFull ? '#FF9600' : '#58CC02', color: '#fff' }}
                      >
                        {inv.acceptedCount} / {inv.requiredSpots} Spots
                      </span>
                    </div>

                    {/* Artist & Tour overlaid */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      right: '12px',
                      color: '#ffffff'
                    }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {inv.artist}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600, margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                        {inv.tourName}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#444', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={15} color="#59636e" />
                      <span>{inv.date} • {inv.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color="#59636e" />
                      <span>{inv.venue}, {inv.city}</span>
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#495057',
                    lineHeight: 1.45,
                    marginBottom: '1rem',
                    flex: 1,
                    fontStyle: 'italic',
                    background: '#f8f9fa',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    "{inv.description ? (inv.description.length > 90 ? inv.description.slice(0, 90) + '...' : inv.description) : 'Looking for gig buddies in London!'}"
                  </p>

                  {/* Host Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                    <img 
                      src={inv.author?.avatar || getDefaultAvatar(inv.author?.name || 'Host')} 
                      alt={inv.author?.name || 'Host'}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getDefaultAvatar(inv.author?.name || 'Host');
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Posted by {inv.author?.name || 'Concert Host'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#777' }}>{inv.author?.city || inv.city || 'London, UK'}</div>
                    </div>
                  </div>

                  {/* Accept / Reject Buttons or Host Status */}
                  {isAuthor ? (
                    <div style={{
                      padding: '0.6rem 0.75rem',
                      textAlign: 'center',
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={15} color="#16a34a" />
                      <span>You're the Host (Part of the Crew)</span>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <button
                        className="btn-positive"
                        style={{
                          opacity: isAccepted ? 0.75 : 1,
                          backgroundColor: isAccepted ? '#3f9202' : 'var(--btn-accept)'
                        }}
                        onClick={() => onAcceptInvite(inv.id)}
                      >
                        <Check size={16} />
                        <span>{isAccepted ? 'Accepted ✓' : 'Accept'}</span>
                      </button>

                      <button
                        className="btn-negative"
                        style={{
                          opacity: isRejected ? 0.75 : 1,
                          backgroundColor: isRejected ? '#b86d00' : 'var(--btn-reject)'
                        }}
                        onClick={() => onRejectInvite(inv.id)}
                      >
                        <XIcon size={16} />
                        <span>{isRejected ? 'Passed' : 'Pass'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Review & Instagram Callout */}
      {featuredReview ? (
        <section style={{
          background: 'var(--container-bg)',
          border: '1.5px solid var(--container-border)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#1f2328" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Featured Concert Review
              </h3>
            </div>
            <button 
              className="btn-secondary"
              onClick={() => onNavigate('reviews')}
              style={{ fontSize: '0.82rem' }}
            >
              <span>Explore All Reviews</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #d5d5d5'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    {featuredReview.artist}
                  </h4>
                  <span className="badge badge-green">★ {featuredReview.rating} / 5</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#59636e', margin: 0 }}>
                  {featuredReview.venue} • {featuredReview.concertDate}
                </p>
              </div>

              {featuredReview.instagramUrl && (
                <a 
                  href={featuredReview.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.4rem 0.8rem',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    boxShadow: '0 3px 6px rgba(220, 39, 67, 0.3)'
                  }}
                >
                  <InstagramIcon size={14} />
                  <span>View Photos on Instagram</span>
                </a>
              )}
            </div>

            <p style={{ fontSize: '0.95rem', color: '#2b3a4a', lineHeight: 1.6, marginBottom: '1.2rem' }}>
              "{featuredReview.reviewText}"
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(featuredReview.hashtags || []).map((tag, idx) => (
                <span 
                  key={idx} 
                  className="hashtag-chip"
                  onClick={() => onNavigate('reviews')}
                >
                  <Hash size={12} />
                  <span>{tag.replace('#', '')}</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section style={{
          background: 'var(--container-bg)',
          border: '1.5px solid var(--container-border)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <MessageSquare size={36} color="#8c959f" style={{ margin: '0 auto 0.6rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.3rem' }}>
            No Concert Reviews Yet
          </h3>
          <p style={{ color: '#59636e', fontSize: '0.88rem', margin: '0 0 1rem' }}>
            Attended a gig recently in London? Share your thoughts, ratings, and Instagram photos!
          </p>
          <button 
            className="btn-positive"
            onClick={() => onNavigate('reviews')}
            style={{ fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
          >
            <MessageSquare size={16} />
            <span>Write First Review</span>
          </button>
        </section>
      )}
    </div>
  );
}
