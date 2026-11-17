# 🎸 Friends at Concerts — Free Backend & API Setup Guide

This guide explains how authentication, data storage, and the exclusive concert chat work, plus recommended **100% free-tier cloud backends** that require **$0 and no credit card**.

---

## 🚀 1. Out-of-the-Box Functionality (Zero Setup Needed)

The application is **already fully functional immediately** out-of-the-box!
- **Authentication:** You can register new accounts, log in, switch users, and log out right in the browser. State is saved in persistent browser storage.
- **Preloaded Demo Accounts:**
  - **Maya Lin** (`maya@concerts.io`): Host of the Coldplay Rose Bowl invite with 2 accepted concert buddies.
  - **Sam Rivera** (`sam@concerts.io`): Active concert fan looking to join tours.
- **Concert Invites:** Full accept/reject functionality with `#58CC02` and `#FF9600` 3D buttons.
- **Hashtag Reviews:** Search by `#artist_name` (e.g., `#coldplay`, `#taylorswift`, `#dualipa`), star ratings, and Instagram links.
- **Concert Chat:** Unlocked exclusive group chat for confirmed attendees of each show.

---

## 🆓 2. Recommended Free Cloud Backend: Supabase

For connecting a live multi-user cloud database and live real-time chat with high usage limits for free, **Supabase** is the #1 recommendation:

### Why Supabase?
* **Cost:** **$0 / month** (Perpetual Free Plan, no credit card required).
* **Usage Limits (Free Tier):**
  * **50,000 monthly active users** (MAUs) for Authentication (Email/Password, Google, etc.).
  * **500 MB database storage** (enough for hundreds of thousands of concert invites and reviews).
  * **Realtime Chat Channels:** 200 concurrent connected users included for free.
  * **Unlimited API requests.**

---

### Step-by-Step Supabase Setup (3 Minutes):

#### Step 1: Create a Free Account
1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"**.
2. Sign up with GitHub or your email.
3. Click **"New Project"**, name it `friends-at-concerts`, set a database password, and pick the region closest to you.

#### Step 2: Run the Database Tables Script
Go to the **SQL Editor** tab in your Supabase dashboard and run this script:

```sql
-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  avatar text,
  city text,
  bio text,
  favorite_artists text[],
  favorite_genres text[],
  concerts_attended integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Concert Invites Table
create table if not exists public.concert_invites (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  artist text not null,
  tour_name text,
  venue text not null,
  city text not null,
  date date not null,
  time text,
  genre text,
  required_spots integer default 2,
  accepted_count integer default 0,
  ticket_status text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Invite Attendees (Joins)
create table if not exists public.invite_attendees (
  id uuid default gen_random_uuid() primary key,
  invite_id uuid references public.concert_invites(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text default 'accepted', -- 'accepted' or 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(invite_id, user_id)
);

-- 4. Concert Reviews Table
create table if not exists public.concert_reviews (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  artist text not null,
  venue text not null,
  concert_date date not null,
  rating numeric(2,1) default 5.0,
  review_text text not null,
  instagram_url text,
  hashtags text[],
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Concert Chat Messages Table
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  invite_id uuid references public.concert_invites(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. User Activity Notifications Table
create table if not exists public.user_notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references public.profiles(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text not null,
  sender_avatar text,
  type text not null, -- 'invite_view' | 'invite_accept' | 'invite_reject' | 'chat_message' | 'review_like'
  title text not null,
  message text not null,
  invite_id text,
  review_id text,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime for Chat Messages & Notifications
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.user_notifications;

-- RLS & Account Deletion Policies
alter table public.profiles enable row level security;
alter table public.concert_invites enable row level security;
alter table public.concert_reviews enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_notifications enable row level security;

create policy "Public profiles viewable" on public.profiles for select using (true);
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id);

create policy "Invites viewable" on public.concert_invites for select using (true);
create policy "Users manage own invites" on public.concert_invites for all using (auth.uid() = author_id);

create policy "Reviews viewable" on public.concert_reviews for select using (true);
create policy "Users manage own reviews" on public.concert_reviews for all using (auth.uid() = author_id);

create policy "Chat messages viewable" on public.chat_messages for select using (true);
create policy "Users manage own chat" on public.chat_messages for all using (auth.uid() = sender_id);

create policy "Users view own notifications" on public.user_notifications for select using (auth.uid() = recipient_id);
create policy "Users update own notifications" on public.user_notifications for update using (auth.uid() = recipient_id);
create policy "Users delete own notifications" on public.user_notifications for delete using (auth.uid() = recipient_id);
create policy "Any authenticated user can insert notifications" on public.user_notifications for insert with check (true);

-- Optional: Instant Cascade Self-Delete RPC for Auth Users
create or replace function delete_user()
returns void
language sql
security definer
as $$
  delete from auth.users where id = auth.uid();
$$;
```

#### Step 3: Add API Keys to Project
In your Supabase dashboard:
1. Click **Project Settings** -> **API**.
2. Copy `Project URL` and `anon public key`.
3. Create a `.env.local` file in `c:\proj-fic`:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## ⚡ 3. Alternative Free Option: Firebase (Google)

If you prefer Google Firebase:
1. Go to [https://firebase.google.com](https://firebase.google.com) and create a project on the **Spark Plan ($0 Free)**.
2. Under **Build**, turn on **Authentication** (Email/Password) and **Firestore Database**.
3. **Usage Limits (Free Spark Tier):**
   * 50,000 document reads/day.
   * 20,000 document writes/day.
   * 1 GB stored data.
   * Free phone/email authentication.

---

## 🛠️ 4. Running the App Locally

To start the local development server:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```
