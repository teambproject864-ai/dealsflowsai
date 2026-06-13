import crypto from "crypto";

/**
 * Decodes a base32 encoded string into a binary Buffer.
 * Characters outside the A-Z, 2-7 alphabet (such as padding '=') are ignored/stripped.
 */
function base32Decode(str: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanStr = str.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let bits = "";
  
  for (let i = 0; i < cleanStr.length; i++) {
    const val = alphabet.indexOf(cleanStr[i]);
    if (val === -1) {
      throw new Error(`Invalid base32 character: ${cleanStr[i]}`);
    }
    bits += val.toString(2).padStart(5, "0");
  }
  
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  
  return Buffer.from(bytes);
}

/**
 * Verifies a 6-digit TOTP code against a base32 encoded secret.
 * Uses a default time window of 1 interval (30 seconds before/after) for clock drift.
 */
export function verifyTOTP(secret: string, token: string, window = 1): boolean {
  try {
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);

    for (let i = -window; i <= window; i++) {
      const c = counter + i;
      const buf = Buffer.alloc(8);
      // Write the counter value as an 8-byte big-endian integer
      buf.writeUInt32BE(Math.floor(c / 0x100000000), 0);
      buf.writeUInt32BE(c % 0x100000000, 4);

      const hmac = crypto.createHmac("sha1", key).update(buf).digest();
      const offset = hmac[hmac.length - 1] & 0xf;
      const code =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

      const hotpToken = (code % 1000000).toString().padStart(6, "0");
      if (hotpToken === token) {
        return true;
      }
    }
  } catch (err) {
    console.error("[TOTP Verification Error]", err);
  }
  return false;
}
