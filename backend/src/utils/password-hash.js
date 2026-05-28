import crypto from 'node:crypto'; // node's built in module for hashing

const salt = process.env.PASSWORD_SALT; // get the password salt from .env

export const hashPassword = (password) => {
    const hash = password + salt; // attach the raw password and salt together 
    return crypto.createHash('sha256').update(hash).digest('hex').toString(); // create a sha256 hash
}

export const checkPassword = (password, existingHash) => {
    return hashPassword(password) === existingHash; // hash the incoming password and check if it matches the one in DB
}
