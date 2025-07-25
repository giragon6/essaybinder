export class GoogleAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.redirectUri = `${window.location.origin}/auth/callback`;
    this.backendUrl = import.meta.env.VITE_BACKEND_URL;
  }

  generateCodeChallenge() {
    const codeVerifier = this.generateCodeVerifier();
    sessionStorage.setItem('code_verifier', codeVerifier);
    
    return this.sha256(codeVerifier).then(hash => {
      return this.base64URLEncode(hash);
    });
  }

  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  base64URLEncode(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
  }

  async signIn() {
    const codeChallenge = await this.generateCodeChallenge();
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/drive.readonly',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: crypto.randomUUID(), 
      prompt: 'select_account'
    });

    sessionStorage.setItem('oauth_state', params.get('state'));
    
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    const codeVerifier = sessionStorage.getItem('code_verifier');
    
    const response = await fetch(`${this.backendUrl}/auth/exchange-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        code,
        codeVerifier,
        redirectUri: this.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    sessionStorage.removeItem('code_verifier');
    sessionStorage.removeItem('oauth_state');

    return response.json();
  }

  signOut() {
    return fetch(`${this.backendUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  }
}

export const googleAuth = new GoogleAuthService();