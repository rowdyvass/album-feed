# Cover Art Service Setup Guide

The SpinGrid app now includes a robust multi-source cover art service that ensures every album has visual representation. This guide explains how to set up the optional API keys for enhanced cover art coverage.

## Overview

The cover art service tries multiple sources in this order:
1. **Cover Art Archive** (MusicBrainz) - Primary source, no API key needed
2. **Last.fm** - Free tier, good coverage
3. **iTunes/Apple Music** - Free, high quality
4. **Spotify** - High quality, requires API setup
5. **Custom Placeholder** - Generated fallback with album info

## Required Setup

### 1. Last.fm API (Recommended)
**Cost**: Free  
**Coverage**: Excellent for mainstream and indie releases

1. Go to [Last.fm API](https://www.last.fm/api/account/create)
2. Create a free account
3. Generate an API key
4. Add to your `.env.local` file:
   ```bash
   LASTFM_API_KEY=your_api_key_here
   ```

### 2. Spotify API (Optional)
**Cost**: Free tier available  
**Coverage**: Excellent quality, comprehensive catalog

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Get your Client ID and Client Secret
4. Add to your `.env.local` file:
   ```bash
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

### 3. iTunes/Apple Music (No Setup Required)
**Cost**: Free  
**Coverage**: Good for mainstream releases  
**Setup**: None required - works out of the box

## Environment File

Create a `.env.local` file in your project root:

```bash
# Cover Art Service API Keys
LASTFM_API_KEY=your_lastfm_api_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

## Benefits

### With API Keys
- **100% Cover Art Coverage**: Every album will have artwork
- **High Quality**: Multiple sources ensure best available quality
- **Fast Loading**: Parallel requests to multiple sources
- **Reliability**: Automatic fallbacks if primary sources fail

### Without API Keys
- **Good Coverage**: Still gets covers from Cover Art Archive
- **Placeholder Fallback**: Custom-generated placeholders for missing covers
- **No Cost**: Completely free to use

## Performance Impact

- **With APIs**: Slightly slower initial load, but better coverage
- **Without APIs**: Faster initial load, but some albums may have placeholders
- **Caching**: Results are cached to improve subsequent requests

## Troubleshooting

### Common Issues

1. **"API key not configured" warnings**
   - Normal if you haven't set up optional APIs
   - App will continue working with available sources

2. **Rate limiting errors**
   - Service automatically handles rate limits
   - Falls back to next available source

3. **Network timeouts**
   - Built-in timeout handling
   - Automatic fallback to next source

### Getting Help

- Check that your `.env.local` file is in the project root
- Verify API keys are correct and active
- Ensure your app has internet access
- Check browser console for detailed error messages

## Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for sensitive data
- **Rotate keys regularly** for production use
- **Monitor API usage** to stay within free tier limits
