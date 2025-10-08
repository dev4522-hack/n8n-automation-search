# 🚀 Authentication Setup Instructions

## Step 1: Configure Your Supabase Project

### 1.1 Update Your Project URL and API Key

1. Open `public/supabase.js`
2. Replace `YOUR_SUPABASE_URL_HERE` with your actual Supabase project URL
3. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your actual Supabase anonymous key

Example:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 1.2 Create Database Tables

1. Go to your Supabase dashboard
2. Navigate to "SQL Editor" 
3. Copy the entire content of `supabase-setup.sql`
4. Paste it in the SQL Editor and click "Run"

This will create:
- ✅ `profiles` table for user data
- ✅ `favorites` table for saved templates  
- ✅ `search_history` table for user searches
- ✅ Row Level Security policies
- ✅ Automatic profile creation trigger

### 1.3 Configure OAuth Providers (Optional)

**For Google Login:**
1. Go to Authentication > Settings > Auth Providers
2. Enable Google provider
3. Add your Google OAuth client ID and secret

**For GitHub Login:**
1. Go to Authentication > Settings > Auth Providers  
2. Enable GitHub provider
3. Add your GitHub OAuth app credentials

## Step 2: Test Your Setup

### 2.1 Start Your Server
```bash
node server.js
```

### 2.2 Test Authentication Features

1. **Sign Up**: Click "Login" → "Sign up" → Create account
2. **Sign In**: Use your email/password 
3. **Social Login**: Try Google/GitHub (if configured)
4. **Favorites**: Heart icon on templates (when logged in)
5. **Profile**: Click user avatar → View dropdown menu

## Step 3: Free Tier Limits

Your free Supabase account includes:

✅ **Database**: 500MB storage (thousands of users)
✅ **Auth**: 50,000 monthly active users  
✅ **API Requests**: Unlimited
✅ **File Storage**: 1GB
✅ **Bandwidth**: 5GB

## 🎯 What's Included

### **Authentication Features:**
- ✅ Email/password signup & login
- ✅ Google OAuth login (optional)
- ✅ GitHub OAuth login (optional)
- ✅ Session management
- ✅ User profiles with avatars
- ✅ Automatic logout on session expiry

### **User Features:**
- ✅ **Favorites System**: Heart templates to save them
- ✅ **Search History**: Automatic search tracking
- ✅ **User Profiles**: Display name and avatar
- ✅ **Persistent Sessions**: Stay logged in
- ✅ **Responsive Design**: Works on mobile

### **Database:**
- ✅ **Secure**: Row Level Security enabled
- ✅ **Scalable**: PostgreSQL database
- ✅ **Fast**: Indexed for performance
- ✅ **Automatic**: Profile creation on signup

## 🔧 Troubleshooting

**If login doesn't work:**
1. Check browser console for errors
2. Verify your Supabase URL and API key
3. Ensure database tables are created
4. Check if RLS policies are enabled

**If favorites don't save:**
1. Make sure you're logged in
2. Check browser network tab for errors
3. Verify database table permissions

**If OAuth doesn't work:**
1. Configure OAuth providers in Supabase dashboard
2. Add correct redirect URLs
3. Verify client ID and secrets

## 🎉 You're Ready!

Your n8n automation templates app now has:
- 🔐 **Full user authentication**
- 💖 **Favorites system** 
- 📊 **Search history tracking**
- 👤 **User profiles**
- 🆓 **Completely free** (within limits)

All data is stored securely in your Supabase database with proper authentication and authorization!