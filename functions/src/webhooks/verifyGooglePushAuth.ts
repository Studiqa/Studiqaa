import { OAuth2Client } from "google-auth-library";
import { HttpsError } from "firebase-functions/v2/https";
import type { Request } from "firebase-functions/v2/https";

let cachedClient: OAuth2Client | null = null;

/**
 * Verifies that a request genuinely came from Google Cloud Pub/Sub's push delivery
 * (which is how Google Play's Real-time Developer Notifications arrive), not from
 * someone who merely knows or guesses the function's URL.
 *
 * How it works: when you configure the Pub/Sub push subscription with an OIDC token
 * (recommended, see Pub/Sub docs "Authenticate push subscriptions"), Google attaches
 * `Authorization: Bearer <token>` to every push request, signed by Google using a key
 * only Google holds. We verify that signature here against Google's public certs
 * (fetched by the library itself, cached automatically) and check:
 *   - the token's audience matches this function's own URL (so a token meant for a
 *     DIFFERENT push endpoint can't be replayed against this one)
 *   - the token's issuer is a Google service account you configured on the Pub/Sub
 *     subscription (PUBSUB_PUSH_SERVICE_ACCOUNT_EMAIL) — so an arbitrary valid Google
 *     token isn't enough; it must be from the specific identity you set up push with.
 */
export async function verifyGooglePushAuth(req: Request): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpsError("unauthenticated", "Missing Pub/Sub push authentication token");
  }
  const token = authHeader.slice("Bearer ".length);

  const expectedAudience = process.env.PUBSUB_PUSH_AUDIENCE; // set to this function's URL
  const expectedServiceAccount = process.env.PUBSUB_PUSH_SERVICE_ACCOUNT_EMAIL;
  if (!expectedAudience || !expectedServiceAccount) {
    throw new HttpsError("internal", "Pub/Sub push verification not configured");
  }

  if (!cachedClient) cachedClient = new OAuth2Client();

  const ticket = await cachedClient.verifyIdToken({ idToken: token, audience: expectedAudience });
  const payload = ticket.getPayload();

  if (!payload || payload.email !== expectedServiceAccount || !payload.email_verified) {
    throw new HttpsError("permission-denied", "Push token did not match expected service account");
  }
}
