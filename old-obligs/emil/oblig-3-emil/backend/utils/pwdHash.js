import crypto from "node:crypto";

const { APP_SALT: salt } = process.env;

export function hashPwd(pwd) {
  const hash = pwd + salt;
  return crypto.createHash("md5").update(hash).digest("hex").toString();
}

export function checkPwd(pwd, existingHash) {
  return hashPwd(pwd) === existingHash;
}
