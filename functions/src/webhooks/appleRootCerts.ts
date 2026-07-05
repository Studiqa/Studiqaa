/**
 * Apple's App Store Server Library needs Apple's actual root CA certificates (DER-encoded)
 * to validate the certificate chain on every signed JWS payload it verifies. These are
 * public certificates (not secrets) published by Apple at a stable, well-known URL —
 * safe to fetch over HTTPS and cache in memory for the life of the function instance.
 *
 * We fetch once per cold start and cache, rather than bundling the cert bytes into source
 * control, so rotation on Apple's side (rare, but it happens) doesn't require a redeploy.
 */
const APPLE_ROOT_CERT_URLS = [
  "https://www.apple.com/certificateauthority/AppleRootCA-G3.cer",
  "https://www.apple.com/certificateauthority/AppleComputerRootCertificate.cer",
];

let cachedCerts: Buffer[] | null = null;

export async function getAppleRootCerts(): Promise<Buffer[]> {
  if (cachedCerts) return cachedCerts;

  const certs = await Promise.all(
    APPLE_ROOT_CERT_URLS.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch Apple root cert from ${url}: ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    })
  );

  cachedCerts = certs;
  return certs;
}
