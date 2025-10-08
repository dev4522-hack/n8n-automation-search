# OAuth Provider Setup Guide for n8n Automation Search

## ✅ Completed Setup Checklist

### 🔵 Google OAuth Setup
- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API  
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 credentials
- [ ] Added redirect URI: `https://fmdxmvolwlvbvrqxkrth.supabase.co/auth/v1/callback`
- [ ] Configured in Supabase Authentication → Providers → Google

**Required Information:**
- Client ID: `[PASTE FROM GOOGLE CLOUD CONSOLE]`
- Client Secret: `[PASTE FROM GOOGLE CLOUD CONSOLE]`

---

### ⚫ GitHub OAuth Setup
- [ ] Created GitHub OAuth App
- [ ] Set Homepage URL: `http://localhost:3000`
- [ ] Set Authorization callback URL: `https://fmdxmvolwlvbvrqxkrth.supabase.co/auth/v1/callback`
- [ ] Generated client secret
- [ ] Configured in Supabase Authentication → Providers → GitHub

**Required Information:**
- Client ID: `[PASTE FROM GITHUB OAUTH APP]`
- Client Secret: `[PASTE FROM GITHUB OAUTH APP]`

---

### 🍎 Apple OAuth Setup (Requires Paid Apple Developer Account)
- [ ] Created App ID with Sign In with Apple capability
- [ ] Created Service ID
- [ ] Configured domains and return URLs
- [ ] Generated private key (.p8 file)
- [ ] Configured in Supabase Authentication → Providers → Apple

**Required Information:**
- Service ID: `com.yourname.n8n-search.service`
- Team ID: `[FROM APPLE DEVELOPER ACCOUNT]`
- Key ID: `[10-CHARACTER KEY ID]`
- Private Key: `[CONTENT OF .p8 FILE]`

---

## 🧪 Testing Your OAuth Setup

1. **Start your server**: Make sure it's running on http://localhost:3000
2. **Open the app**: Visit http://localhost:3000
3. **Click Login**: Try each social login button
4. **Verify redirect**: Each should redirect to the respective OAuth provider
5. **Complete login**: After authentication, you should return to your app logged in

## 🔧 Troubleshooting Common Issues

### Google OAuth Issues:
- **"redirect_uri_mismatch"**: Double-check the redirect URI is exactly `https://fmdxmvolwlvbvrqxkrth.supabase.co/auth/v1/callback`
- **"access_blocked"**: Make sure OAuth consent screen is properly configured

### GitHub OAuth Issues:
- **"bad_verification_code"**: Verify callback URL matches exactly
- **"redirect_uri_mismatch"**: Check authorization callback URL

### Apple OAuth Issues:
- **"invalid_client"**: Verify Service ID and configuration
- **"invalid_key"**: Make sure private key content is copied completely

## 📝 Important Notes

1. **Apple requires HTTPS**: Apple OAuth only works with HTTPS URLs in production
2. **Development vs Production**: You may need separate OAuth apps for development and production
3. **Rate Limits**: Be aware of OAuth provider rate limits during testing
4. **Security**: Never commit OAuth secrets to version control

## 🎯 Next Steps After Setup

Once all providers are configured:
1. Test each social login method
2. Verify user data is properly stored in Supabase
3. Test the favorites and search history features
4. Deploy to production with proper HTTPS domain
5. Update OAuth redirect URIs for production domain