// Real data state & service for "friends at concerts"
// EXCLUSIVELY FOR LONDON USERS — CONNECTED TO SUPABASE LIVE BACKEND

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getDefaultAvatar } from './avatarService';

const STORAGE_KEYS = {
  CURRENT_USER: 'fic_real_current_user',
  USERS: 'fic_real_users',
  INVITES: 'fic_real_concert_invites',
  REVIEWS: 'fic_real_concert_reviews',
  CHATS: 'fic_real_concert_chats',
  REVIEW_LIKES: 'fic_real_review_likes',
  NOTIFICATIONS: 'fic_real_user_notifications'
};

// Strictly check if a city string is in London
export const isLondonCity = (cityStr) => {
  if (!cityStr || typeof cityStr !== 'string') return false;
  const s = cityStr.trim().toLowerCase();
  return s.includes('london');
};

// Always redirect auth confirmation & password reset emails to the live custom domain in production
const getAppRedirectOrigin = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return window.location.origin;
  }
  return 'https://friendsatconcert.co.uk';
};

// Storage helper functions
export const getStored = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(`Failed to read ${key} from storage`, err);
    return fallback;
  }
};

export const setStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write ${key} to storage`, err);
  }
};

// Initialize data stores
// Single source of truth for turning a Supabase auth user into an app profile/user.
// Used by BOTH the email-confirmation redirect (initializeData) and manual login,
// so the profile photo is always identical no matter how the user signed in.
const loadOrCreateProfile = async (authUser) => {
  const meta = authUser.user_metadata || {};
  const fallbackName = (meta.name || authUser.email.split('@')[0] || '').trim();

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (!profile) {
    const defaultCity = meta.city || 'London, UK';
    const newProfile = {
      id: authUser.id,
      name: fallbackName,
      avatar: getDefaultAvatar(fallbackName),
      city: defaultCity,
      bio: `London concert lover based in ${defaultCity}. Ready to hit London gigs!`,
      favorite_artists: meta.favorite_artists || [],
      favorite_genres: meta.favorite_genres || [],
      concerts_attended: 0
    };
    const { data: created } = await supabase
      .from('profiles')
      .upsert([newProfile])
      .select()
      .maybeSingle();
    profile = created || newProfile;
  } else if (
    !profile.avatar ||
    profile.avatar.includes('dicebear.com') ||
    !profile.avatar.startsWith('data:image/svg+xml')
  ) {
    // Missing or legacy (e.g. old dicebear URL) photo: replace with the current animal
    // avatar and save it, so every login/redirect shows the same photo from now on.
    const avatar = getDefaultAvatar((profile.name || fallbackName).trim());
    try {
      await supabase.from('profiles').update({ avatar }).eq('id', authUser.id);
    } catch (e) {
      console.debug('Avatar save note:', e);
    }
    profile = { ...profile, avatar };
  }

  return {
    id: authUser.id,
    email: authUser.email,
    name: profile.name || fallbackName,
    avatar: profile.avatar,
    city: profile.city || 'London, UK',
    bio: profile.bio || 'London concert lover',
    favoriteArtists: profile.favorite_artists || [],
    favoriteGenres: profile.favorite_genres || [],
    concertsAttended: profile.concerts_attended || 0,
    friends: []
  };
};

// Fetch live concert invites and attendee responses from Supabase
export const syncInvitesFromCloud = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return getStored(STORAGE_KEYS.INVITES, []);
  }
  try {
    const { data: cloudInvites, error: invErr } = await supabase
      .from('concert_invites')
      .select('*, profiles:author_id(*)')
      .order('created_at', { ascending: false });

    if (invErr || !cloudInvites) {
      return getStored(STORAGE_KEYS.INVITES, []);
    }

    // Fetch attendees universally (gracefully handle if table isn't created yet)
    const attendeesByInvite = {};
    const responsesByInvite = {};
    let hasAttendeesTable = false;
    try {
      const { data: cloudAttendees, error: attErr } = await supabase
        .from('invite_attendees')
        .select('*, profiles:user_id(*)');

      if (!attErr && Array.isArray(cloudAttendees)) {
        hasAttendeesTable = true;
        cloudAttendees.forEach(att => {
          if (!responsesByInvite[att.invite_id]) responsesByInvite[att.invite_id] = {};
          responsesByInvite[att.invite_id][att.user_id] = att.status;

          if (att.status === 'accepted') {
            if (!attendeesByInvite[att.invite_id]) attendeesByInvite[att.invite_id] = [];
            attendeesByInvite[att.invite_id].push({
              id: att.user_id,
              name: att.profiles?.name || 'London Music Fan',
              avatar: att.profiles?.avatar || getDefaultAvatar(att.user_id)
            });
          }
        });
      }
    } catch (attCatchErr) {
      console.debug('Invite attendees sync note:', attCatchErr);
    }

    const mapped = cloudInvites.map(ci => {
      const acceptedUsers = (attendeesByInvite[ci.id] || []).filter(u => u.id !== ci.author_id);
      const userResponses = responsesByInvite[ci.id] || {};
      const acceptedCount = hasAttendeesTable
        ? acceptedUsers.length
        : (ci.accepted_count || 0);

      return {
        id: ci.id,
        artist: ci.artist,
        tourName: ci.tour_name,
        venue: ci.venue,
        city: ci.city,
        date: ci.date,
        time: ci.time,
        genre: ci.genre,
        imageUrl: ci.image_url,
        requiredSpots: ci.required_spots,
        acceptedCount,
        ticketStatus: ci.ticket_status,
        description: ci.description,
        createdAt: ci.created_at,
        acceptedUsers,
        userResponses,
        author: {
          id: ci.author_id,
          name: ci.profiles?.name || 'London Music Fan',
          avatar: ci.profiles?.avatar || getDefaultAvatar(ci.author_id),
          city: ci.profiles?.city || 'London, UK'
        }
      };
    });

    setStored(STORAGE_KEYS.INVITES, mapped);
    return mapped;
  } catch (err) {
    console.debug('Cloud invites sync note:', err);
    return getStored(STORAGE_KEYS.INVITES, []);
  }
};

// Fetch live concert reviews from Supabase
export const syncReviewsFromCloud = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return getStored(STORAGE_KEYS.REVIEWS, []);
  }
  try {
    const { data: cloudReviews, error: revErr } = await supabase
      .from('concert_reviews')
      .select('*, profiles:author_id(*)')
      .order('created_at', { ascending: false });

    if (!revErr && Array.isArray(cloudReviews)) {
      const mappedRev = cloudReviews.map(cr => ({
        id: cr.id,
        artist: cr.artist,
        venue: cr.venue,
        concertDate: cr.concert_date,
        rating: cr.rating,
        reviewText: cr.review_text,
        instagramUrl: cr.instagram_url,
        hashtags: cr.hashtags || [],
        likes: cr.likes || 0,
        createdAt: cr.created_at.split('T')[0],
        author: {
          id: cr.author_id,
          name: cr.profiles?.name || 'London Gig Fan',
          avatar: cr.profiles?.avatar || getDefaultAvatar(cr.author_id)
        }
      }));
      setStored(STORAGE_KEYS.REVIEWS, mappedRev);
      return mappedRev;
    }
    return getStored(STORAGE_KEYS.REVIEWS, []);
  } catch (err) {
    console.debug('Cloud reviews sync note:', err);
    return getStored(STORAGE_KEYS.REVIEWS, []);
  }
};

// Fetch live concert chat messages from Supabase
export const syncChatsFromCloud = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return getStored(STORAGE_KEYS.CHATS, {});
  }
  try {
    const { data: cloudMsgs, error: msgErr } = await supabase
      .from('chat_messages')
      .select('*, profiles:sender_id(*)')
      .order('created_at', { ascending: true });

    if (!msgErr && Array.isArray(cloudMsgs)) {
      const grouped = {};
      cloudMsgs.forEach(m => {
        if (!m.invite_id) return;
        if (!grouped[m.invite_id]) grouped[m.invite_id] = [];
        const d = new Date(m.created_at);
        const timeStr = isNaN(d.getTime())
          ? ''
          : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        grouped[m.invite_id].push({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.profiles?.name || 'London Gig Fan',
          senderAvatar: m.profiles?.avatar || getDefaultAvatar(m.sender_id),
          text: m.text,
          timestamp: timeStr ? `Today at ${timeStr}` : 'Just now'
        });
      });
      setStored(STORAGE_KEYS.CHATS, grouped);
      return grouped;
    }
    return getStored(STORAGE_KEYS.CHATS, {});
  } catch (err) {
    console.debug('Cloud chats sync note:', err);
    return getStored(STORAGE_KEYS.CHATS, {});
  }
};

// Fetch live user notifications from Supabase
export const syncNotificationsFromCloud = async (recipientId) => {
  if (!isSupabaseConfigured || !supabase) {
    return notificationService.getNotifications(recipientId);
  }
  const targetId = recipientId || authService.getCurrentUser()?.id;
  if (!targetId) return [];
  try {
    const { data: cloudNotifs, error: notifErr } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('recipient_id', targetId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!notifErr && Array.isArray(cloudNotifs)) {
      const mapped = cloudNotifs.map(cn => ({
        id: cn.id,
        recipientId: cn.recipient_id,
        senderId: cn.sender_id,
        senderName: cn.sender_name || 'London Concert Buddy',
        senderAvatar: cn.sender_avatar || getDefaultAvatar(cn.sender_name || 'Buddy'),
        type: cn.type,
        title: cn.title,
        actionVerb: '',
        elementName: '',
        actionText: cn.message,
        message: cn.message,
        inviteId: cn.invite_id,
        reviewId: cn.review_id,
        read: Boolean(cn.read),
        createdAt: cn.created_at
      }));
      const others = getStored(STORAGE_KEYS.NOTIFICATIONS, []).filter(n => n.recipientId !== targetId);
      setStored(STORAGE_KEYS.NOTIFICATIONS, [...mapped, ...others]);
      return mapped;
    }
    return notificationService.getNotifications(targetId);
  } catch (err) {
    console.debug('Cloud notifications sync note:', err);
    return notificationService.getNotifications(targetId);
  }
};

export const initializeData = async () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStored(STORAGE_KEYS.USERS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVITES)) {
    setStored(STORAGE_KEYS.INVITES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    setStored(STORAGE_KEYS.REVIEWS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
    setStored(STORAGE_KEYS.CHATS, {});
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setStored(STORAGE_KEYS.NOTIFICATIONS, []);
  } else {
    try {
      const notifs = getStored(STORAGE_KEYS.NOTIFICATIONS, []);
      if (Array.isArray(notifs)) {
        const cleaned = notifs.filter(n => 
          n && n.id && 
          !n.id.startsWith('notif_init_') && 
          !n.id.startsWith('notif_demo_') && 
          n.recipientId !== 'default' && 
          n.senderId !== 'usr_adam' && 
          n.senderId !== 'usr_ava' &&
          n.senderId !== 'usr_sam_rivera' &&
          n.senderId !== 'usr_liam_smith' &&
          n.senderId !== 'usr_alex_chen' &&
          n.senderId !== 'anon_viewer'
        );
        if (cleaned.length !== notifs.length) {
          setStored(STORAGE_KEYS.NOTIFICATIONS, cleaned);
        }
      }
    } catch (e) {}
  }

  // Purge any legacy demo messages from CHATS
  try {
    const chats = getStored(STORAGE_KEYS.CHATS, {});
    let chatsChanged = false;
    Object.keys(chats).forEach(k => {
      if (Array.isArray(chats[k])) {
        const origLen = chats[k].length;
        chats[k] = chats[k].filter(m => 
          m && 
          !m.text?.includes("Sounds great!") && 
          m.senderId !== 'usr_sam_rivera' && 
          m.senderId !== 'usr_liam_smith' &&
          m.senderId !== 'usr_alex_chen'
        );
        if (chats[k].length !== origLen) chatsChanged = true;
      }
    });
    if (chatsChanged) {
      setStored(STORAGE_KEYS.CHATS, chats);
    }
  } catch (e) {}

  // Purge any simulated attendees from INVITES
  try {
    const invites = getStored(STORAGE_KEYS.INVITES, []);
    let invitesChanged = false;
    invites.forEach(inv => {
      if (Array.isArray(inv.acceptedUsers)) {
        const origLen = inv.acceptedUsers.length;
        inv.acceptedUsers = inv.acceptedUsers.filter(u => 
          u && 
          u.id !== 'usr_sam_rivera' && 
          u.id !== 'usr_liam_smith' &&
          u.id !== 'usr_alex_chen'
        );
        if (inv.acceptedUsers.length !== origLen) {
          inv.acceptedCount = inv.acceptedUsers.length;
          if (inv.userResponses) {
            delete inv.userResponses['usr_sam_rivera'];
            delete inv.userResponses['usr_liam_smith'];
            delete inv.userResponses['usr_alex_chen'];
          }
          invitesChanged = true;
        }
      }
    });
    if (invitesChanged) {
      setStored(STORAGE_KEYS.INVITES, invites);
    }
  } catch (e) {}

  // Ensure invite host/creator is never in acceptedUsers (they are the host, not a guest attendee)
  try {
    const invites = getStored(STORAGE_KEYS.INVITES, []);
    let hostCleaned = false;
    invites.forEach(inv => {
      if (inv.author && Array.isArray(inv.acceptedUsers)) {
        const origLen = inv.acceptedUsers.length;
        inv.acceptedUsers = inv.acceptedUsers.filter(u => u && u.id !== inv.author.id);
        if (inv.acceptedUsers.length !== origLen) {
          inv.acceptedCount = inv.acceptedUsers.length;
          if (inv.userResponses && inv.userResponses[inv.author.id]) {
            delete inv.userResponses[inv.author.id];
          }
          hostCleaned = true;
        }
      }
    });
    if (hostCleaned) {
      setStored(STORAGE_KEYS.INVITES, invites);
    }
  } catch (e) {}

  // If Supabase is connected, fetch initial cloud records into local state
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Check current Supabase auth session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData && sessionData.session && sessionData.session.user) {
        const userObj = await loadOrCreateProfile(sessionData.session.user);
        setStored(STORAGE_KEYS.CURRENT_USER, userObj);
      }

      // 2. Fetch live concert invites + attendees from Supabase
      await syncInvitesFromCloud();

      // 3. Fetch live reviews from Supabase
      await syncReviewsFromCloud();

      // 4. Fetch live chat messages from Supabase
      await syncChatsFromCloud();

      // 5. Fetch live notifications for current user
      const curUser = authService.getCurrentUser();
      if (curUser?.id) {
        await syncNotificationsFromCloud(curUser.id);
      }
    } catch (err) {
      console.debug('Cloud sync in progress or waiting for tables', err);
    }
  }
};

// Real Authentication Service
export const authService = {
  getCurrentUser: () => {
    const user = getStored(STORAGE_KEYS.CURRENT_USER, null);
    if (user && user.avatar && (user.avatar.includes('dicebear.com') || !user.avatar.startsWith('data:image/svg+xml'))) {
      user.avatar = getDefaultAvatar(user.name || user.email);
      setStored(STORAGE_KEYS.CURRENT_USER, user);
    }
    return user;
  },

  login: async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Supabase Live Cloud Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });
        if (error) return { success: false, error: error.message };

        // Same shared logic as the email-confirmation redirect, so the photo always matches
        const userObj = await loadOrCreateProfile(data.user);
        setStored(STORAGE_KEYS.CURRENT_USER, userObj);
        return { success: true, user: userObj };
      } catch (err) {
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // 2. Real Persistent Local Database Fallback
    const users = getStored(STORAGE_KEYS.USERS, []);
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!existing) {
      return { success: false, error: 'No account found with this email. Please register first!' };
    }
    if (existing.password && existing.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const { password: _, ...safeUser } = existing;
    setStored(STORAGE_KEYS.CURRENT_USER, safeUser);
    return { success: true, user: safeUser };
  },

  register: async ({ name, email, password, city, favoriteArtists, favoriteGenres }) => {
    // STRICT LONDON-ONLY CHECK
    if (!city || !isLondonCity(city)) {
      return { 
        success: false, 
        error: '🚫 Friends at Concerts is currently exclusive to London music fans. Only London is accepted at this stage!' 
      };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const formattedCity = city.toLowerCase().includes('london') ? city.trim() : `${city.trim()}, London, UK`;

    // 1. Supabase Live Cloud Auth (Sends real confirmation emails to inbox)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
          options: {
            emailRedirectTo: `${getAppRedirectOrigin()}/`,
            data: {
              name: name.trim(),
              city: formattedCity,
              favorite_artists: favoriteArtists ? favoriteArtists.split(',').map(a => a.trim()).filter(Boolean) : [],
              favorite_genres: favoriteGenres ? favoriteGenres.split(',').map(g => g.trim()).filter(Boolean) : []
            }
          }
        });
        if (error) return { success: false, error: error.message };

        if (data.user) {
          // Insert profile into database
          try {
            await supabase.from('profiles').insert([{
              id: data.user.id,
              name: name.trim(),
              avatar: getDefaultAvatar(name),
              city: formattedCity,
              bio: `London concert lover based in ${formattedCity}. Ready to hit London gigs!`,
              favorite_artists: favoriteArtists ? favoriteArtists.split(',').map(a => a.trim()).filter(Boolean) : [],
              favorite_genres: favoriteGenres ? favoriteGenres.split(',').map(g => g.trim()).filter(Boolean) : [],
              concerts_attended: 0
            }]);
          } catch (profileErr) {
            console.debug('Profile insert note:', profileErr);
          }

          // If Supabase requires email verification, session is null until confirmed
          if (!data.session) {
            return {
              success: true,
              needsEmailVerification: true,
              email: trimmedEmail,
              message: `Verification link sent to ${trimmedEmail}! Please check your email inbox to confirm your account.`
            };
          }

          const userObj = {
            id: data.user.id,
            email: data.user.email,
            name: name.trim(),
            avatar: getDefaultAvatar(name),
            city: formattedCity,
            bio: `London concert lover based in ${formattedCity}. Ready to hit London gigs!`,
            favoriteArtists: favoriteArtists ? favoriteArtists.split(',').map(a => a.trim()).filter(Boolean) : [],
            favoriteGenres: favoriteGenres ? favoriteGenres.split(',').map(g => g.trim()).filter(Boolean) : [],
            concertsAttended: 0,
            friends: []
          };
          setStored(STORAGE_KEYS.CURRENT_USER, userObj);
          return { success: true, user: userObj };
        }
      } catch (err) {
        return { success: false, error: err.message || 'Registration failed' };
      }
    }

    // 2. Real Persistent Local Database Fallback
    const users = getStored(STORAGE_KEYS.USERS, []);
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists. Please log in.' };
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: name.trim(),
      email: trimmedEmail,
      password: password,
      avatar: getDefaultAvatar(name),
      bio: `London concert lover based in ${formattedCity}. Ready to discover live gigs and meet fellow music fans!`,
      city: formattedCity,
      concertsAttended: 0,
      invitesSent: 0,
      invitesAccepted: 0,
      favoriteArtists: favoriteArtists ? favoriteArtists.split(',').map(a => a.trim()).filter(Boolean) : [],
      favoriteGenres: favoriteGenres ? favoriteGenres.split(',').map(g => g.trim()).filter(Boolean) : [],
      friends: []
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    const { password: _, ...safeUser } = newUser;
    setStored(STORAGE_KEYS.CURRENT_USER, safeUser);
    return { success: true, user: safeUser };
  },

  logout: async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  requestPasswordReset: async (email) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return { success: false, error: 'Please enter your registered email address.' };

    if (isSupabaseConfigured && supabase) {
      try {
        const redirectTo = `${getAppRedirectOrigin()}/?reset_password=true`;
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: redirectTo
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message || 'Failed to send password reset email.' };
      }
    }

    // Local fallback
    const users = getStored(STORAGE_KEYS.USERS, []);
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!existing) {
      return { success: false, error: 'No account found with this email address.' };
    }
    return { success: true };
  },

  updatePassword: async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) return { success: false, error: error.message };
        try { sessionStorage.removeItem('fic_pending_password_reset'); } catch (e) {}
        if (data.user) {
          const userObj = await loadOrCreateProfile(data.user);
          setStored(STORAGE_KEYS.CURRENT_USER, userObj);
          return { success: true, user: userObj };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message || 'Failed to update password.' };
      }
    }

    // Local fallback
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const users = getStored(STORAGE_KEYS.USERS, []);
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx].password = newPassword;
        setStored(STORAGE_KEYS.USERS, users);
      }
    }
    return { success: true };
  },

  deleteAccount: async (userId) => {
    if (!userId) {
      const current = authService.getCurrentUser();
      userId = current?.id;
    }
    if (!userId) return { success: false, error: 'No user authenticated to delete' };

    // 1. Supabase Cloud cleanup if configured
    if (isSupabaseConfigured && supabase) {
      try {
        // Attempt database cascade or individual deletions
        try {
          await supabase.from('chat_messages').delete().eq('sender_id', userId);
        } catch (e) {
          console.debug('Cloud chat delete note:', e);
        }

        try {
          await supabase.from('concert_reviews').delete().eq('author_id', userId);
        } catch (e) {
          console.debug('Cloud reviews delete note:', e);
        }

        try {
          await supabase.from('concert_invites').delete().eq('author_id', userId);
        } catch (e) {
          console.debug('Cloud invites delete note:', e);
        }

        try {
          await supabase.from('profiles').delete().eq('id', userId);
        } catch (e) {
          console.debug('Cloud profile delete note:', e);
        }

        // Delete the user from auth.users using the SQL function if configured
        const { error: rpcErr } = await supabase.rpc('delete_user');
        if (rpcErr) {
          console.warn('Supabase auth.users delete notice (run SQL function delete_user in Supabase editor to enable auth credential purge):', rpcErr.message);
        }

        // Sign out from Supabase Auth
        await supabase.auth.signOut();
      } catch (cloudErr) {
        console.warn('Supabase cloud delete warning:', cloudErr);
      }
    }

    // 2. Comprehensive Local Database Cleanup
    // Wipe from users store
    const users = getStored(STORAGE_KEYS.USERS, []);
    const updatedUsers = users.filter(u => u.id !== userId);
    setStored(STORAGE_KEYS.USERS, updatedUsers);

    // Clean up invites: remove invites created by user, remove user from accepted arrays
    const invites = getStored(STORAGE_KEYS.INVITES, []);
    const updatedInvites = invites
      .filter(inv => !inv.author || inv.author.id !== userId)
      .map(inv => {
        if (inv.userResponses && inv.userResponses[userId]) {
          delete inv.userResponses[userId];
        }
        if (inv.acceptedUsers && Array.isArray(inv.acceptedUsers)) {
          inv.acceptedUsers = inv.acceptedUsers.filter(u => u.id !== userId);
          inv.acceptedCount = inv.acceptedUsers.length;
        }
        return inv;
      });
    setStored(STORAGE_KEYS.INVITES, updatedInvites);

    // Clean up reviews created by user
    const reviews = getStored(STORAGE_KEYS.REVIEWS, []);
    const updatedReviews = reviews.filter(r => !r.author || r.author.id !== userId);
    setStored(STORAGE_KEYS.REVIEWS, updatedReviews);

    // Clean up chat messages sent by user
    const chats = getStored(STORAGE_KEYS.CHATS, {});
    for (const key of Object.keys(chats)) {
      if (Array.isArray(chats[key])) {
        chats[key] = chats[key].filter(msg => msg.senderId !== userId);
      }
    }
    setStored(STORAGE_KEYS.CHATS, chats);

    // Clear session storage
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

    return { success: true };
  },

  updateProfile: async ({ city, bio, favoriteArtists, favoriteGenres, avatar }) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return { success: false, error: 'You must be logged in to update your profile.' };

    if (city && !isLondonCity(city)) {
      return {
        success: false,
        error: '🚫 Friends at Concerts is currently exclusive to London music fans. City must be in London!'
      };
    }

    const formattedCity = city 
      ? (city.toLowerCase().includes('london') ? city.trim() : `${city.trim()}, London, UK`)
      : currentUser.city;

    const parsedArtists = Array.isArray(favoriteArtists)
      ? favoriteArtists
      : (typeof favoriteArtists === 'string' ? favoriteArtists.split(',').map(a => a.trim()).filter(Boolean) : (currentUser.favoriteArtists || []));

    const parsedGenres = Array.isArray(favoriteGenres)
      ? favoriteGenres
      : (typeof favoriteGenres === 'string' ? favoriteGenres.split(',').map(g => g.trim()).filter(Boolean) : (currentUser.favoriteGenres || []));

    const updatedUser = {
      ...currentUser,
      // Name is explicitly preserved and CANNOT be edited
      city: formattedCity,
      bio: bio !== undefined ? bio.trim() : currentUser.bio,
      avatar: avatar || currentUser.avatar,
      favoriteArtists: parsedArtists,
      favoriteGenres: parsedGenres
    };

    // 1. Update Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: cloudErr } = await supabase
          .from('profiles')
          .update({
            // Name is explicitly NOT updated
            city: updatedUser.city,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar,
            favorite_artists: updatedUser.favoriteArtists,
            favorite_genres: updatedUser.favoriteGenres
          })
          .eq('id', currentUser.id);

        if (cloudErr) {
          console.warn('Supabase profile update warning:', cloudErr.message);
        }
      } catch (err) {
        console.warn('Supabase update error:', err);
      }
    }

    // 2. Update local storage
    setStored(STORAGE_KEYS.CURRENT_USER, updatedUser);

    const users = getStored(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedUser };
      setStored(STORAGE_KEYS.USERS, users);
    }

    return { success: true, user: updatedUser };
  },

  getAllUsers: () => getStored(STORAGE_KEYS.USERS, [])
};

// Real Activity Notification Service
export const notificationService = {
  getNotifications: (recipientId) => {
    let targetId = recipientId;
    if (!targetId) {
      const user = authService.getCurrentUser();
      targetId = user?.id;
    }
    if (!targetId) return [];

    let all = getStored(STORAGE_KEYS.NOTIFICATIONS, []);
    // Purge any legacy mock or demo notifications
    const hadMocks = all.some(n => n && n.id && (
      n.id.startsWith('notif_init_') || 
      n.id.startsWith('notif_demo_') || 
      n.recipientId === 'default' || 
      n.senderId === 'usr_adam' || 
      n.senderId === 'usr_ava' ||
      n.senderId === 'usr_sam_rivera' ||
      n.senderId === 'usr_liam_smith' ||
      n.senderId === 'usr_alex_chen' ||
      n.senderId === 'anon_viewer'
    ));
    if (hadMocks) {
      all = all.filter(n => 
        n && n.id &&
        !n.id.startsWith('notif_init_') && 
        !n.id.startsWith('notif_demo_') && 
        n.recipientId !== 'default' && 
        n.senderId !== 'usr_adam' && 
        n.senderId !== 'usr_ava' &&
        n.senderId !== 'usr_sam_rivera' &&
        n.senderId !== 'usr_liam_smith' &&
        n.senderId !== 'usr_alex_chen' &&
        n.senderId !== 'anon_viewer'
      );
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    }

    return all
      .filter(n => n.recipientId === targetId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getUnreadCount: (recipientId) => {
    let targetId = recipientId;
    if (!targetId) {
      const user = authService.getCurrentUser();
      targetId = user?.id;
    }
    if (!targetId) return 0;
    const list = notificationService.getNotifications(targetId);
    return list.filter(n => !n.read).length;
  },

  addNotification: (notifData) => {
    if (!notifData.recipientId) return null;

    // Suppress self-view notifications only
    if (notifData.type === 'invite_view' && notifData.senderId && notifData.senderId === notifData.recipientId) {
      return null;
    }

    const all = getStored(STORAGE_KEYS.NOTIFICATIONS, []);

    // Deduplicate invite_view within 15 minutes to avoid spamming
    if (notifData.type === 'invite_view') {
      const recent = all.find(n => 
        n.recipientId === notifData.recipientId &&
        n.type === 'invite_view' &&
        n.inviteId === notifData.inviteId &&
        n.senderId === notifData.senderId &&
        (Date.now() - new Date(n.createdAt).getTime()) < 15 * 60 * 1000
      );
      if (recent) return recent;
    }

    const newNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      recipientId: notifData.recipientId,
      senderId: notifData.senderId || null,
      senderName: notifData.senderName || 'London Concert Buddy',
      senderAvatar: notifData.senderAvatar || getDefaultAvatar('Buddy'),
      type: notifData.type, // 'invite_view' | 'invite_accept' | 'invite_reject' | 'chat_message' | 'review_like'
      title: notifData.title || 'Notification',
      actionVerb: notifData.actionVerb || '',
      elementName: notifData.elementName || '',
      actionText: notifData.actionText || notifData.message || 'Interacted with your content',
      message: notifData.message || '',
      inviteId: notifData.inviteId || null,
      reviewId: notifData.reviewId || null,
      read: false,
      createdAt: new Date().toISOString()
    };

    all.unshift(newNotification);
    if (all.length > 100) all.length = 100;
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        supabase.from('user_notifications').insert([{
          recipient_id: newNotification.recipientId,
          sender_id: newNotification.senderId,
          sender_name: newNotification.senderName,
          sender_avatar: newNotification.senderAvatar,
          type: newNotification.type,
          title: newNotification.title,
          message: newNotification.message,
          invite_id: newNotification.inviteId,
          review_id: newNotification.reviewId,
          read: false
        }]).then(() => {}).catch(() => {});
      } catch (err) {
        console.debug('Cloud notification sync note:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fic_notification_received', { detail: newNotification }));
    }

    return newNotification;
  },

  markAsRead: (notificationId) => {
    const all = getStored(STORAGE_KEYS.NOTIFICATIONS, []);
    const idx = all.findIndex(n => n.id === notificationId);
    if (idx !== -1) {
      all[idx].read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
      if (isSupabaseConfigured && supabase && !String(notificationId).startsWith('notif_')) {
        try {
          supabase.from('user_notifications').update({ read: true }).eq('id', notificationId).then(() => {}).catch(() => {});
        } catch (e) {}
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fic_notification_updated'));
      }
    }
  },

  markAllAsRead: (recipientId) => {
    let targetId = recipientId;
    if (!targetId) {
      const user = authService.getCurrentUser();
      targetId = user?.id;
    }
    if (!targetId) return;

    const all = getStored(STORAGE_KEYS.NOTIFICATIONS, []);
    let changed = false;
    all.forEach(n => {
      if (n.recipientId === targetId && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (isSupabaseConfigured && supabase) {
      try {
        supabase.from('user_notifications').update({ read: true }).eq('recipient_id', targetId).eq('read', false).then(() => {}).catch(() => {});
      } catch (e) {}
    }
    if (changed) {
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fic_notification_updated'));
      }
    }
  },

  clearAll: (recipientId) => {
    let targetId = recipientId;
    if (!targetId) {
      const user = authService.getCurrentUser();
      targetId = user?.id;
    }
    if (!targetId) return;

    let all = getStored(STORAGE_KEYS.NOTIFICATIONS, []);
    all = all.filter(n => n.recipientId !== targetId);
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    if (isSupabaseConfigured && supabase) {
      try {
        supabase.from('user_notifications').delete().eq('recipient_id', targetId).then(() => {}).catch(() => {});
      } catch (e) {}
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fic_notification_updated'));
    }
  }
};

// Real Concert Invites Service
export const inviteService = {
  getInvites: () => getStored(STORAGE_KEYS.INVITES, []),

  recordInviteView: (inviteId, customViewer = null) => {
    const viewer = customViewer || authService.getCurrentUser();
    if (!viewer) return null;

    const invites = getStored(STORAGE_KEYS.INVITES, []);
    const invite = invites.find(inv => inv.id === inviteId);
    if (!invite || !invite.author || !invite.author.id) return null;

    // Suppress if the author is viewing their own invite
    if (viewer.id === invite.author.id) return null;

    // Deduplicate: Suppress notification if this viewer has already triggered a view notification for this invite
    const notifs = getStored(STORAGE_KEYS.NOTIFICATIONS, []);
    const alreadyNotified = notifs.some(n => 
      n.type === 'invite_view' && 
      n.inviteId === invite.id && 
      n.senderId === viewer.id
    );
    if (alreadyNotified) return null;

    const inviteTitle = invite.tourName || `${invite.artist} at ${invite.venue}`;
    return notificationService.addNotification({
      recipientId: invite.author.id,
      type: 'invite_view',
      title: 'Invite Viewed',
      actionVerb: 'viewed your concert invite for',
      elementName: inviteTitle,
      actionText: `viewed your concert invite for "${inviteTitle}"`,
      message: `${viewer.name} viewed your concert invite for "${inviteTitle}"`,
      senderId: viewer.id,
      senderName: viewer.name,
      senderAvatar: viewer.avatar,
      inviteId: invite.id
    });
  },

  createInvite: async (inviteData) => {
    if (!inviteData.city || !isLondonCity(inviteData.city)) {
      return { 
        error: '🚫 Concert invites are currently exclusive to London venues. Only London is accepted!' 
      };
    }

    const user = authService.getCurrentUser();
    if (!user) return { error: 'You must be logged in to post an invite.' };

    const invites = getStored(STORAGE_KEYS.INVITES, []);
    const formattedCity = inviteData.city.toLowerCase().includes('london') 
      ? inviteData.city.trim() 
      : `${inviteData.city.trim()}, London, UK`;

    const newInvite = {
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      artist: inviteData.artist.trim(),
      tourName: inviteData.tourName ? inviteData.tourName.trim() : `${inviteData.artist} London Live`,
      venue: inviteData.venue.trim(),
      city: formattedCity,
      date: inviteData.date,
      time: inviteData.time || '7:30 PM',
      genre: inviteData.genre || 'Live Concert',
      imageUrl: inviteData.imageUrl || '',
      requiredSpots: parseInt(inviteData.requiredSpots, 10) || 2,
      acceptedCount: 0,
      acceptedUsers: [],
      userResponses: {},
      ticketStatus: inviteData.ticketStatus || 'Pitch Standing / Reserved Seating',
      description: inviteData.description || `Looking for gig buddies in London to see ${inviteData.artist}!`,
      createdAt: new Date().toISOString(),
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        city: user.city || 'London, UK'
      }
    };

    // Save locally
    invites.unshift(newInvite);
    setStored(STORAGE_KEYS.INVITES, invites);

    // Save to Supabase Cloud if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error: insertErr } = await supabase
          .from('concert_invites')
          .insert([{
            author_id: user.id,
            artist: newInvite.artist,
            tour_name: newInvite.tourName,
            venue: newInvite.venue,
            city: newInvite.city,
            date: newInvite.date,
            time: newInvite.time,
            genre: newInvite.genre,
            image_url: newInvite.imageUrl,
            required_spots: newInvite.requiredSpots,
            accepted_count: 0,
            ticket_status: newInvite.ticketStatus,
            description: newInvite.description
          }])
          .select()
          .single();

        if (!insertErr && inserted && inserted.id) {
          newInvite.id = inserted.id;
          invites[0] = newInvite;
          setStored(STORAGE_KEYS.INVITES, invites);
        }
      } catch (cloudErr) {
        console.debug('Cloud save note:', cloudErr);
      }
    }

    // Update real user's profile stats
    const users = getStored(STORAGE_KEYS.USERS, []);
    const uIdx = users.findIndex(u => u.id === user.id);
    if (uIdx !== -1) {
      users[uIdx].invitesSent = (users[uIdx].invitesSent || 0) + 1;
      setStored(STORAGE_KEYS.USERS, users);
      setStored(STORAGE_KEYS.CURRENT_USER, users[uIdx]);
    }

    // Self action notification for creating the invite
    notificationService.addNotification({
      recipientId: user.id,
      type: 'invite_accept',
      title: 'Invite Published',
      actionVerb: 'created a concert invite for',
      elementName: newInvite.tourName,
      actionText: `created a concert invite for "${newInvite.tourName}"`,
      message: `You created a concert invite for "${newInvite.tourName}"`,
      senderId: user.id,
      senderName: 'You',
      senderAvatar: user.avatar,
      inviteId: newInvite.id
    });

    return newInvite;
  },

  respondToInvite: async (inviteId, responseType) => {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in to respond to invites.' };

    const invites = getStored(STORAGE_KEYS.INVITES, []);
    const inviteIndex = invites.findIndex(inv => inv.id === inviteId);
    if (inviteIndex === -1) return { success: false, error: 'Invite not found.' };

    const invite = { ...invites[inviteIndex] };
    if (!invite.userResponses) invite.userResponses = {};
    if (!invite.acceptedUsers) invite.acceptedUsers = [];

    // The host who created the invite is already leading the crew and cannot accept/reject their own invite
    if (invite.author && invite.author.id === user.id) {
      return { 
        success: false, 
        error: 'You are the host of this concert invite and already lead the crew!' 
      };
    }

    const previousResponse = invite.userResponses[user.id];

    if (responseType === 'accept') {
      if (previousResponse === 'accepted') {
        return { success: true, message: 'Already accepted this invite!', invite };
      }
      if (invite.acceptedCount >= invite.requiredSpots) {
        return { success: false, error: 'All spots for this London concert invite are full!' };
      }

      invite.userResponses[user.id] = 'accepted';
      invite.acceptedUsers.push({
        id: user.id,
        name: user.name,
        avatar: user.avatar
      });
      invite.acceptedCount = invite.acceptedUsers.length;

      // Add real welcoming notification message to the concert's exclusive chat space
      const chats = getStored(STORAGE_KEYS.CHATS, {});
      if (!chats[inviteId]) chats[inviteId] = [];
      chats[inviteId].push({
        id: 'msg_' + Date.now(),
        senderId: 'system',
        senderName: 'London Gig System',
        senderAvatar: '🎸',
        text: `🎉 ${user.name} joined the ${invite.artist} concert crew! Say hello!`,
        timestamp: 'Just now'
      });
      setStored(STORAGE_KEYS.CHATS, chats);

      // Connect users as real concert friends
      const users = getStored(STORAGE_KEYS.USERS, []);
      const uIdx = users.findIndex(u => u.id === user.id);
      if (uIdx !== -1) {
        users[uIdx].invitesAccepted = (users[uIdx].invitesAccepted || 0) + 1;
        if (invite.author.id !== user.id) {
          if (!users[uIdx].friends) users[uIdx].friends = [];
          if (!users[uIdx].friends.some(f => f.id === invite.author.id)) {
            users[uIdx].friends.push({
              id: invite.author.id,
              name: invite.author.name,
              avatar: invite.author.avatar,
              mutualConcerts: 1
            });
          }
        }
        setStored(STORAGE_KEYS.USERS, users);
        setStored(STORAGE_KEYS.CURRENT_USER, users[uIdx]);
      }

      // Notify invite author if someone else accepted
      const inviteTitle = invite.tourName || `${invite.artist} at ${invite.venue}`;
      if (invite.author && invite.author.id !== user.id) {
        notificationService.addNotification({
          recipientId: invite.author.id,
          type: 'invite_accept',
          title: 'Invite Accepted',
          actionVerb: 'accepted your concert invite for',
          elementName: inviteTitle,
          actionText: `accepted your concert invite for "${inviteTitle}" (joined squad!)`,
          message: `${user.name} accepted your concert invite for "${inviteTitle}" (joined squad!)`,
          senderId: user.id,
          senderName: user.name,
          senderAvatar: user.avatar,
          inviteId: invite.id
        });
      }

      // Self action notification for the user who accepted
      notificationService.addNotification({
        recipientId: user.id,
        type: 'invite_accept',
        title: 'Joined Squad',
        actionVerb: 'joined the concert crew for',
        elementName: inviteTitle,
        actionText: `joined the concert crew for "${inviteTitle}"`,
        message: `You joined the concert crew for "${inviteTitle}"`,
        senderId: user.id,
        senderName: 'You',
        senderAvatar: user.avatar,
        inviteId: invite.id
      });
    } else {
      if (previousResponse === 'accepted') {
        invite.acceptedUsers = invite.acceptedUsers.filter(u => u.id !== user.id);
        invite.acceptedCount = invite.acceptedUsers.length;
      }
      invite.userResponses[user.id] = 'rejected';

      // Notify invite author if someone passed
      const inviteTitle = invite.tourName || `${invite.artist} at ${invite.venue}`;
      if (invite.author && invite.author.id !== user.id) {
        notificationService.addNotification({
          recipientId: invite.author.id,
          type: 'invite_reject',
          title: 'Invite Update',
          actionVerb: 'passed on your concert invite for',
          elementName: inviteTitle,
          actionText: `passed on your concert invite for "${inviteTitle}"`,
          message: `${user.name} passed on your concert invite for "${inviteTitle}"`,
          senderId: user.id,
          senderName: user.name,
          senderAvatar: user.avatar,
          inviteId: invite.id
        });
      }

      // Self action notification for the user who passed
      notificationService.addNotification({
        recipientId: user.id,
        type: 'invite_reject',
        title: 'Invite Passed',
        actionVerb: 'passed on the concert invite for',
        elementName: inviteTitle,
        actionText: `passed on the concert invite for "${inviteTitle}"`,
        message: `You passed on the concert invite for "${inviteTitle}"`,
        senderId: user.id,
        senderName: 'You',
        senderAvatar: user.avatar,
        inviteId: invite.id
      });
    }

    invites[inviteIndex] = invite;
    setStored(STORAGE_KEYS.INVITES, invites);

    // Persist response universally to Supabase so post owner and all users see it
    if (isSupabaseConfigured && supabase) {
      try {
        const statusValue = responseType === 'accept' ? 'accepted' : 'rejected';
        await supabase
          .from('invite_attendees')
          .upsert(
            {
              invite_id: inviteId,
              user_id: user.id,
              status: statusValue
            },
            { onConflict: 'invite_id,user_id' }
          );

        if (responseType === 'accept') {
          await supabase.from('chat_messages').insert([{
            invite_id: inviteId,
            sender_id: user.id,
            text: `🎉 Joined the ${invite.artist} concert crew!`
          }]);
        }
      } catch (cloudErr) {
        console.debug('Cloud invite response sync note:', cloudErr);
      }
    }

    return { success: true, responseType, invite };
  },

  deleteInvite: async (inviteId) => {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in to delete an invite.' };

    const invites = getStored(STORAGE_KEYS.INVITES, []);
    const inv = invites.find(i => i.id === inviteId);
    if (!inv) return { success: false, error: 'Invite not found.' };

    if (!inv.author || inv.author.id !== user.id) {
      return { success: false, error: 'Only the host who posted this invite can delete it.' };
    }

    // Filter out the invite
    const updatedInvites = invites.filter(i => i.id !== inviteId);
    setStored(STORAGE_KEYS.INVITES, updatedInvites);

    // Clean up associated chat space
    const chats = getStored(STORAGE_KEYS.CHATS, {});
    if (chats[inviteId]) {
      delete chats[inviteId];
      setStored(STORAGE_KEYS.CHATS, chats);
    }

    // Clean up terminated status if any
    const terminatedChats = getStored('FIC_TERMINATED_CHATS', {});
    if (terminatedChats[inviteId]) {
      delete terminatedChats[inviteId];
      setStored('FIC_TERMINATED_CHATS', terminatedChats);
    }

    // Delete from Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('concert_invites').delete().eq('id', inviteId);
      } catch (cloudErr) {
        console.debug('Cloud delete note:', cloudErr);
      }
    }

    // Decrement user's invitesSent stat if greater than 0
    const users = getStored(STORAGE_KEYS.USERS, []);
    const uIdx = users.findIndex(u => u.id === user.id);
    if (uIdx !== -1 && users[uIdx].invitesSent > 0) {
      users[uIdx].invitesSent -= 1;
      setStored(STORAGE_KEYS.USERS, users);
      setStored(STORAGE_KEYS.CURRENT_USER, users[uIdx]);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fic_chat_updated', { detail: { inviteId } }));
    }

    return { success: true };
  }
};

// Real Concert Reviews Service
export const reviewService = {
  getReviews: () => {
    const reviews = getStored(STORAGE_KEYS.REVIEWS, []);
    const reviewLikes = getStored(STORAGE_KEYS.REVIEW_LIKES, {});
    const currentUser = authService.getCurrentUser();

    return reviews.map(r => {
      const likesList = reviewLikes[r.id] || r.likedBy || [];
      const count = likesList.length > 0 ? likesList.length : (r.likes || 0);
      return {
        ...r,
        likes: count,
        likedBy: likesList,
        isLikedByUser: currentUser ? likesList.includes(currentUser.id) : false
      };
    });
  },

  createReview: async (reviewData) => {
    const user = authService.getCurrentUser();
    if (!user) return null;

    const reviews = getStored(STORAGE_KEYS.REVIEWS, []);
    const rawTags = (reviewData.hashtags || '').split(/\s+/).filter(t => t.startsWith('#'));
    const artistTag = '#' + reviewData.artist.toLowerCase().replace(/[^a-z0-9]/g, '');
    const londonTag = '#londonlive';
    const tagSet = new Set([artistTag, londonTag, ...rawTags]);

    const newReview = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      artist: reviewData.artist.trim(),
      venue: reviewData.venue.trim(),
      concertDate: reviewData.concertDate,
      rating: parseFloat(reviewData.rating) || 5,
      reviewText: reviewData.reviewText.trim(),
      instagramUrl: reviewData.instagramUrl ? reviewData.instagramUrl.trim() : '',
      hashtags: Array.from(tagSet),
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString().split('T')[0],
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      }
    };

    reviews.unshift(newReview);
    setStored(STORAGE_KEYS.REVIEWS, reviews);

    // Save to Supabase Cloud if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: insertedRev, error: revInsertErr } = await supabase
          .from('concert_reviews')
          .insert([{
            author_id: user.id,
            artist: newReview.artist,
            venue: newReview.venue,
            concert_date: newReview.concertDate,
            rating: newReview.rating,
            review_text: newReview.reviewText,
            instagram_url: newReview.instagramUrl,
            hashtags: newReview.hashtags,
            likes: 0
          }])
          .select()
          .single();

        if (!revInsertErr && insertedRev && insertedRev.id) {
          newReview.id = insertedRev.id;
          reviews[0] = newReview;
          setStored(STORAGE_KEYS.REVIEWS, reviews);
        }
      } catch (cloudErr) {
        console.debug('Cloud save note:', cloudErr);
      }
    }

    const users = getStored(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].concertsAttended = (users[idx].concertsAttended || 0) + 1;
      setStored(STORAGE_KEYS.USERS, users);
      setStored(STORAGE_KEYS.CURRENT_USER, users[idx]);
    }

    // Self action notification for publishing review
    const reviewTitle = `${newReview.artist} Live at ${newReview.venue}`;
    notificationService.addNotification({
      recipientId: user.id,
      type: 'review_like',
      title: 'Review Published',
      actionVerb: 'published a concert review for',
      elementName: reviewTitle,
      actionText: `published a concert review for "${reviewTitle}"`,
      message: `You published a concert review for "${reviewTitle}"`,
      senderId: user.id,
      senderName: 'You',
      senderAvatar: user.avatar,
      reviewId: newReview.id
    });

    return newReview;
  },

  likeReview: async (reviewId, customUserId) => {
    let userId = customUserId;
    if (!userId) {
      const currentUser = authService.getCurrentUser();
      userId = currentUser?.id;
    }
    if (!userId) {
      return { success: false, error: 'Please log in to like reviews.' };
    }

    const reviewLikes = getStored(STORAGE_KEYS.REVIEW_LIKES, {});
    if (!reviewLikes[reviewId]) reviewLikes[reviewId] = [];

    const existingIndex = reviewLikes[reviewId].indexOf(userId);
    let isLikedNow = false;

    if (existingIndex === -1) {
      // User hasn't liked yet -> Add like
      reviewLikes[reviewId].push(userId);
      isLikedNow = true;
    } else {
      // User already liked -> Toggle off / unlike (dislike)
      reviewLikes[reviewId].splice(existingIndex, 1);
      isLikedNow = false;
    }
    setStored(STORAGE_KEYS.REVIEW_LIKES, reviewLikes);

    const newLikeCount = reviewLikes[reviewId].length;

    // Update in stored reviews array
    const reviews = getStored(STORAGE_KEYS.REVIEWS, []);
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx !== -1) {
      reviews[idx].likes = newLikeCount;
      reviews[idx].likedBy = reviewLikes[reviewId];
      setStored(STORAGE_KEYS.REVIEWS, reviews);

      // Notify review author (including self when liking own review)
      if (isLikedNow && reviews[idx].author) {
        const user = authService.getCurrentUser();
        const isSelf = reviews[idx].author.id === userId;
        const senderName = isSelf ? 'You' : (user?.name || 'A London music fan');
        const senderAvatar = user?.avatar || getDefaultAvatar(senderName);
        const reviewTitle = `${reviews[idx].artist} Live at ${reviews[idx].venue}`;

        // Send notification to review author (self or other user)
        notificationService.addNotification({
          recipientId: reviews[idx].author.id,
          type: 'review_like',
          title: 'Review Liked',
          actionVerb: isSelf ? 'liked your own review' : 'liked your review',
          elementName: reviewTitle,
          actionText: `${isSelf ? 'liked your own review' : 'liked your review'} "${reviewTitle}"`,
          message: `${senderName} ${isSelf ? 'liked your own review' : 'liked your review'} "${reviewTitle}"`,
          senderId: userId,
          senderName,
          senderAvatar,
          reviewId: reviews[idx].id
        });

        // If user liked someone else's review, also record self action for the user
        if (!isSelf && user) {
          notificationService.addNotification({
            recipientId: user.id,
            type: 'review_like',
            title: 'Liked Review',
            actionVerb: 'liked the review for',
            elementName: reviewTitle,
            actionText: `liked the review for "${reviewTitle}"`,
            message: `You liked the review for "${reviewTitle}"`,
            senderId: user.id,
            senderName: 'You',
            senderAvatar: user.avatar,
            reviewId: reviews[idx].id
          });
        }
      }
    }

    // Sync like count to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('concert_reviews')
          .update({ likes: newLikeCount })
          .eq('id', reviewId);
      } catch (err) {
        console.debug('Cloud like sync note:', err);
      }
    }

    return { 
      success: true, 
      isLiked: isLikedNow, 
      likes: newLikeCount, 
      reviewId 
    };
  },

  updateReview: async (reviewId, updateData) => {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in to edit a review.' };

    const reviews = getStored(STORAGE_KEYS.REVIEWS, []);
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) return { success: false, error: 'Review not found.' };

    const rev = reviews[idx];
    if (!rev.author || rev.author.id !== user.id) {
      return { success: false, error: 'Only the author can edit this review.' };
    }

    // Process hashtags if provided
    let updatedHashtags = rev.hashtags || [];
    if (updateData.hashtags !== undefined) {
      const rawTags = (updateData.hashtags || '').split(/\s+/).filter(t => t.startsWith('#'));
      const artistTag = '#' + (updateData.artist || rev.artist).toLowerCase().replace(/[^a-z0-9]/g, '');
      const londonTag = '#londonlive';
      const tagSet = new Set([artistTag, londonTag, ...rawTags]);
      updatedHashtags = Array.from(tagSet);
    }

    const updatedReview = {
      ...rev,
      artist: updateData.artist !== undefined ? updateData.artist.trim() : rev.artist,
      venue: updateData.venue !== undefined ? updateData.venue.trim() : rev.venue,
      concertDate: updateData.concertDate !== undefined ? updateData.concertDate : rev.concertDate,
      rating: updateData.rating !== undefined ? (parseFloat(updateData.rating) || rev.rating) : rev.rating,
      reviewText: updateData.reviewText !== undefined ? updateData.reviewText.trim() : rev.reviewText,
      instagramUrl: updateData.instagramUrl !== undefined ? updateData.instagramUrl.trim() : rev.instagramUrl,
      hashtags: updatedHashtags,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    reviews[idx] = updatedReview;
    setStored(STORAGE_KEYS.REVIEWS, reviews);

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('concert_reviews').update({
          artist: updatedReview.artist,
          venue: updatedReview.venue,
          concert_date: updatedReview.concertDate,
          rating: updatedReview.rating,
          review_text: updatedReview.reviewText,
          instagram_url: updatedReview.instagramUrl,
          hashtags: updatedReview.hashtags
        }).eq('id', reviewId);
      } catch (cloudErr) {
        console.debug('Cloud review update note:', cloudErr);
      }
    }

    return { success: true, review: updatedReview };
  },

  deleteReview: async (reviewId) => {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in to delete a review.' };

    const reviews = getStored(STORAGE_KEYS.REVIEWS, []);
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return { success: false, error: 'Review not found.' };

    if (!rev.author || rev.author.id !== user.id) {
      return { success: false, error: 'Only the author can delete this review.' };
    }

    // Filter out the review
    const updatedReviews = reviews.filter(r => r.id !== reviewId);
    setStored(STORAGE_KEYS.REVIEWS, updatedReviews);

    // Clean up likes
    const reviewLikes = getStored(STORAGE_KEYS.REVIEW_LIKES, {});
    if (reviewLikes[reviewId]) {
      delete reviewLikes[reviewId];
      setStored(STORAGE_KEYS.REVIEW_LIKES, reviewLikes);
    }

    // Delete from Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('concert_reviews').delete().eq('id', reviewId);
      } catch (cloudErr) {
        console.debug('Cloud review delete note:', cloudErr);
      }
    }

    // Decrement user's concertsAttended stat if greater than 0
    const users = getStored(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1 && users[idx].concertsAttended > 0) {
      users[idx].concertsAttended -= 1;
      setStored(STORAGE_KEYS.USERS, users);
      setStored(STORAGE_KEYS.CURRENT_USER, users[idx]);
    }

    return { success: true };
  }
};

// Real Concert Chat Service
export const chatService = {
  getMessages: (inviteId) => {
    const chats = getStored(STORAGE_KEYS.CHATS, {});
    const list = chats[inviteId] || [];
    return list.filter(m => m && !m.text?.includes("Sounds great!") && m.senderId !== 'usr_sam_rivera' && m.senderId !== 'usr_liam_smith');
  },

  sendMessage: async (inviteId, text) => {
    const user = authService.getCurrentUser();
    if (!user || !text.trim()) return null;
    if (chatService.isChatTerminated(inviteId)) return null;

    const chats = getStored(STORAGE_KEYS.CHATS, {});
    if (!chats[inviteId]) chats[inviteId] = [];

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: text.trim(),
      timestamp: `Today at ${timeStr}`
    };

    chats[inviteId].push(message);
    setStored(STORAGE_KEYS.CHATS, chats);

    // Notify other squad members and invite host
    try {
      const invites = getStored(STORAGE_KEYS.INVITES, []);
      const invite = invites.find(inv => inv.id === inviteId);
      if (invite) {
        const recipients = new Set();
        if (invite.author && invite.author.id !== user.id) {
          recipients.add(invite.author.id);
        }
        if (Array.isArray(invite.acceptedUsers)) {
          invite.acceptedUsers.forEach(u => {
            if (u.id !== user.id) recipients.add(u.id);
          });
        }
        const chatGroupName = `${invite.artist} chat group`;
        const snippet = message.text.length > 35 ? message.text.slice(0, 32) + '...' : message.text;
        recipients.forEach(recId => {
          notificationService.addNotification({
            recipientId: recId,
            type: 'chat_message',
            title: 'Squad Chat',
            actionVerb: 'sent a message on the chat group',
            elementName: chatGroupName,
            actionText: `sent a message on the ${chatGroupName}: "${snippet}" — check it!`,
            message: `${user.name} sent a message on the ${chatGroupName} check it`,
            senderId: user.id,
            senderName: user.name,
            senderAvatar: user.avatar,
            inviteId: invite.id
          });
        });
      }
    } catch (err) {
      console.debug('Chat notification dispatch note:', err);
    }

    // Save to Supabase Cloud if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('chat_messages').insert([{
          invite_id: inviteId,
          sender_id: user.id,
          text: message.text
        }]);
      } catch (cloudErr) {
        console.debug('Cloud save note:', cloudErr);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fic_chat_updated', { detail: { inviteId } }));
    }

    return message;
  },

  clearChat: async (inviteId) => {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in to clear chat.' };

    const invites = getStored(STORAGE_KEYS.INVITES, []);
    const invite = invites.find(inv => inv.id === inviteId);
    if (!invite || !invite.author || invite.author.id !== user.id) {
      return { success: false, error: 'Only the concert invite host can clear this chat.' };
    }

    const chats = getStored(STORAGE_KEYS.CHATS, {});
    chats[inviteId] = [];
    setStored(STORAGE_KEYS.CHATS, chats);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('chat_messages').delete().eq('invite_id', inviteId);
      } catch (cloudErr) {
        console.debug('Cloud clear chat note:', cloudErr);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fic_chat_updated', { detail: { inviteId } }));
    }

    return { success: true };
  },

  isChatTerminated: (inviteId) => {
    const terminated = getStored('fic_real_terminated_chats', {});
    if (terminated[inviteId]) return true;
    const invites = getStored(STORAGE_KEYS.INVITES, []);
    const inv = invites.find(i => i.id === inviteId);
    return Boolean(inv && inv.isChatTerminated);
  },

  getTerminationInfo: (inviteId) => {
    const terminated = getStored('fic_real_terminated_chats', {});
    if (terminated[inviteId]) return terminated[inviteId];
    const invites = getStored(STORAGE_KEYS.INVITES, []);
    const inv = invites.find(i => i.id === inviteId);
    return inv && inv.isChatTerminated ? {
      terminatedAt: inv.terminatedAt,
      terminatedBy: inv.terminatedBy,
      finalMessage: inv.finalMessage
    } : null;
  },

  terminateChatSpace: async (inviteId, finalMessageText) => {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in to terminate chat space.' };

    const invites = getStored(STORAGE_KEYS.INVITES, []);
    const inviteIndex = invites.findIndex(inv => inv.id === inviteId);
    if (inviteIndex === -1) return { success: false, error: 'Concert space not found.' };

    const invite = invites[inviteIndex];
    if (!invite.author || invite.author.id !== user.id) {
      return { success: false, error: 'Only the host who posted this concert ad can terminate the chat space.' };
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Send the preset final information message into the chat as the host's official wrap-up
    const chats = getStored(STORAGE_KEYS.CHATS, {});
    if (!chats[inviteId]) chats[inviteId] = [];

    const finalNoticeMessage = {
      id: 'msg_final_' + Date.now(),
      senderId: user.id,
      senderName: `${user.name} (Host)`,
      senderAvatar: user.avatar,
      text: finalMessageText || 'The concert event has concluded. This squad chat space is now officially closed. Thank you everyone!',
      timestamp: `Today at ${timeStr}`,
      isHostFinalNotice: true
    };

    chats[inviteId].push(finalNoticeMessage);
    setStored(STORAGE_KEYS.CHATS, chats);

    // 2. Mark chat space as terminated
    const termRecord = {
      terminatedAt: now.toISOString(),
      terminatedBy: user.name,
      finalMessage: finalNoticeMessage.text
    };

    const termChats = getStored('fic_real_terminated_chats', {});
    termChats[inviteId] = termRecord;
    setStored('fic_real_terminated_chats', termChats);

    invite.isChatTerminated = true;
    invite.terminatedAt = termRecord.terminatedAt;
    invite.terminatedBy = user.name;
    invites[inviteIndex] = invite;
    setStored(STORAGE_KEYS.INVITES, invites);

    // 3. Notify squad members that the space has concluded
    try {
      const chatGroupName = `${invite.artist} chat space`;
      const recipients = new Set();
      if (Array.isArray(invite.acceptedUsers)) {
        invite.acceptedUsers.forEach(u => {
          if (u.id !== user.id) recipients.add(u.id);
        });
      }
      recipients.forEach(recId => {
        notificationService.addNotification({
          recipientId: recId,
          type: 'chat_message',
          title: 'Squad Chat Closed',
          actionVerb: 'concluded and closed the chat space for',
          elementName: chatGroupName,
          actionText: `concluded and closed the chat space for "${chatGroupName}"`,
          message: `${user.name} concluded and closed the chat space for "${chatGroupName}"`,
          senderId: user.id,
          senderName: user.name,
          senderAvatar: user.avatar,
          inviteId: invite.id
        });
      });
    } catch (err) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fic_chat_updated', { detail: { inviteId } }));
      window.dispatchEvent(new CustomEvent('fic_invite_updated', { detail: { inviteId } }));
    }

    return { success: true, message: finalNoticeMessage, invite };
  }
};
