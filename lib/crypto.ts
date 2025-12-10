import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY = process.env.KMS_DATA_KEY || "";

export function encrypt(plaintext: string): { iv: string; tag: string; data: string } {
  if (!KEY) throw new Error("KMS_DATA_KEY missing");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY, "hex"), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString("hex"), tag: tag.toString("hex"), data: enc.toString("hex") };
}

export function decrypt(payload: { iv: string; tag: string; data: string }): string {
  if (!KEY) throw new Error("KMS_DATA_KEY missing");
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY, "hex"), Buffer.from(payload.iv, "hex"));
  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));
  const dec = Buffer.concat([decipher.update(Buffer.from(payload.data, "hex")), decipher.final()]);
  return dec.toString("utf8");
}