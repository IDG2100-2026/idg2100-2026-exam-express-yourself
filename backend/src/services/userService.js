import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerAUser = async (userObject) => {
  const hashedPassword = await bcrypt.hash(userObject.password, 10);

  const user = {
    username: userObject.username,
    email: userObject.email,
    password: hashedPassword,
    age: userObject.age,
  };

  const createUser = await User.create(user);
  return createUser;
};

export const loginAUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password"); // this will look up the user by email first
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const passwordMatch = await bcrypt.compare(password, user.password); // this will compare what they typed with the stored hash
  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }
  if (user.isBanned)
    throw new Error("Account is banned");
  return user;
};
export default {
  registerAUser,
  loginAUser,
};
