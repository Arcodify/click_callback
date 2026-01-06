import { PublicClientApplication, type RedirectRequest } from '@azure/msal-browser';

const tenantId = import.meta.env.VITE_AZURE_AD_TENANT_ID;
const authority =
  import.meta.env.VITE_AZURE_AD_AUTHORITY ||
  (tenantId ? `https://login.microsoftonline.com/${tenantId}` : undefined) ||
  'https://login.microsoftonline.com/common';

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID || '',
    authority,
    redirectUri: import.meta.env.VITE_AZURE_AD_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_AZURE_AD_POST_LOGOUT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
});

const msalReady = msalInstance.initialize();

export const ensureMsalReady = async () => {
  await msalReady;
};

const apiScope = import.meta.env.VITE_AZURE_AD_API_SCOPE;
const baseScopes = ['openid', 'profile', 'email'];

export const loginRequest: RedirectRequest = {
  scopes: apiScope ? [...baseScopes, apiScope] : baseScopes,
};

export const apiTokenRequest = {
  scopes: apiScope ? [apiScope] : [],
};
