import { User } from "../models/user.js";
import { checkPwd } from "../utils/pwdHash.js";

export async function loginUser(email, password) {
  const user = await User.findOne({ email }).select("+pwd"); // We need +pwd because inside the schema, we have select: false, so when we try to validate the password when logging in, it would always fail.

  if (!user) {
    throw new Error("Invalid email or password!");
  }

  if (!checkPwd(password, user.pwd)) {
    throw new Error("Invalid email or password!"); // Checks if the password is the same
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    eloRating: user.eloRating,
  };
}
