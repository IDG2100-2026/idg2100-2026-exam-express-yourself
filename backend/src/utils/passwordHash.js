import crypto from 'node:crypto';

const salt = process.env.PASSWORD_SALT;

export const hashPassword = (password) => {
    const hash = password + salt;
    return crypto.createHash('md5').update(hash).digest('hex').toString();
}

export const chechPassword = (password, existingHash) => {
    return hashPassword(password === existingHash);
}
