import { env } from "../env";

type GraphUser = {
  id: string;
  displayName: string | null;
  mail: string | null;
  userPrincipalName: string;
  accountEnabled?: boolean | null;
};

export type DirectoryUser = {
  id: string;
  displayName: string;
  email: string;
  userPrincipalName: string;
};

const tokenUrl = `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
const graphUsersUrl =
  "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,accountEnabled&$orderby=displayName&$top=999";
const cacheTtlMs = 5 * 60 * 1000;

let cachedUsers: { expiresAt: number; users: DirectoryUser[] } | null = null;

async function getGraphAccessToken() {
  const body = new URLSearchParams({
    client_id: env.AZURE_AD_CLIENT_ID,
    client_secret: env.AZURE_AD_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: env.AZURE_AD_GRAPH_SCOPE,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to fetch Graph token: ${response.status} ${message}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Graph token response missing access_token");
  }

  return data.access_token;
}

export async function listDirectoryUsers() {
  if (cachedUsers && cachedUsers.expiresAt > Date.now()) {
    return cachedUsers.users;
  }

  const token = await getGraphAccessToken();
  const response = await fetch(graphUsersUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to fetch Graph users: ${response.status} ${message}`);
  }

  const data = (await response.json()) as { value?: GraphUser[] };
  const users = (data.value ?? [])
    .filter((user) => user.accountEnabled !== false)
    .map((user) => {
      const displayName = user.displayName?.trim() || user.userPrincipalName;
      const email = user.mail?.trim() || user.userPrincipalName;
      return {
        id: user.id,
        displayName,
        email,
        userPrincipalName: user.userPrincipalName,
      } satisfies DirectoryUser;
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  cachedUsers = {
    expiresAt: Date.now() + cacheTtlMs,
    users,
  };

  return users;
}
