import React, { useState } from 'react';
import { X, LogIn, UserPlus, Music, Sparkles, CheckCircle2, ShieldCheck, MapPin, Mail } from 'lucide-react';
import { authService, isLondonCity } from '../services/storageService';

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register specific fields
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [favoriteArtists, setFavoriteArtists] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSentEmail, setVerificationSentEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim()) {
          setError('Please enter your email.');
          setIsLoading(false);
          return;
        }
        const res = await authService.login(email.trim(), password);
        if (res.success) {
          onAuthSuccess(res.user, 'Logged in successfully!');
          onClose();
        } else {
          setError(res.error || 'Failed to login');
        }
      } else {
        if (!name.trim() || !email.trim() || !city.trim() || !password) {
          setError('Please provide your name, email, city, and password.');
          setIsLoading(false);
          return;
        }
        if (!isLondonCity(city)) {
          setError('🚫 Registration is currently exclusive to London music fans. Only London is accepted at this stage!');
          setIsLoading(false);
          return;
        }
        const res = await authService.register({
          name,
          email,
          password,
          city,
          favoriteArtists,
          favoriteGenres
        });
        if (res.success) {
          if (res.needsEmailVerification) {
            setVerificationSentEmail(email);
            return;
          }
          onAuthSuccess(res.user, 'Registration successful! Welcome to London Friends at Concert!');
          onClose();
        } else {
          setError(res.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#1f2328', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Music size={18} color="#58CC02" />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              {verificationSentEmail ? 'Verify Your Email' : mode === 'login' ? 'Welcome Back!' : 'Join Friends at Concert'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', padding: '4px', borderRadius: '6px', color: '#666' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {verificationSentEmail ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(88, 204, 2, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <Mail size={28} color="#58CC02" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#111827' }}>
              Check Your Inbox!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#59636e', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              We've sent a verification link to <strong>{verificationSentEmail}</strong>. Click the link in your email to confirm your account, then log in to join your concert crew!
            </p>
            <button
              className="btn-positive"
              style={{ width: '100%', padding: '0.75rem' }}
              onClick={() => {
                setVerificationSentEmail('');
                setMode('login');
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            {/* Tab switch */}
        <div style={{
          display: 'flex',
          background: '#f1f3f5',
          padding: '4px',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #d5d5d5'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? '#1f2328' : '#6c757d',
              boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? '#1f2328' : '#6c757d',
              boxShadow: mode === 'register' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Your City *</span>
                  <span style={{ color: '#58CC02', fontWeight: 800 }}>🇬🇧 London Only</span>
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. London, UK (or Camden, Brixton, Hackney, Islington)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.74rem', color: '#59636e', marginTop: '2px' }}>
                  * We currently operate exclusively in London. Non-London cities are not accepted.
                </span>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="e.g. fan@concerts.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Favorite Artists (comma-separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Coldplay, Taylor Swift, Billie Eilish"
                  value={favoriteArtists}
                  onChange={(e) => setFavoriteArtists(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Favorite Genres</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Rock, Pop, Indie, EDM"
                  value={favoriteGenres}
                  onChange={(e) => setFavoriteGenres(e.target.value)}
                />
              </div>
            </>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              type="submit" 
              className="btn-positive"
              disabled={isLoading}
              style={{ width: '100%', padding: '0.8rem', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn size={18} />
                  <span>Log In to Account</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
        </>
        )}

        <div style={{
          marginTop: '1.5rem',
          padding: '0.65rem 0.9rem',
          background: '#f8f9fa',
          border: '1.5px solid #d5d5d5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.76rem',
          color: '#555'
        }}>
          <ShieldCheck size={16} color="#58CC02" style={{ flexShrink: 0 }} />
          <span>Your information is safe and encrypted. Exclusive to London concert fans.</span>
        </div>
      </div>
    </div>
  );
}
