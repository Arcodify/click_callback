import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { env } from "./env";

// Fastify request augmentation so downstream handlers can access request.user.
declare module "fastify" {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

const tenantId = env.AZURE_AD_TENANT_ID;
const issuerV2 = `https://login.microsoftonline.com/${tenantId}/v2.0`;
const issuerV1 = `https://sts.windows.net/${tenantId}/`;
const jwks = createRemoteJWKSet(
  new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`)
);

// Verify Azure AD access token signature + issuer + audience.
export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, jwks, {
    issuer: [issuerV2, issuerV1],
    audience: env.AZURE_AD_API_AUDIENCE,
  });
  return payload;
}
