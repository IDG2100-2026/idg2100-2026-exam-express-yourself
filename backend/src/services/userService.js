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

export default {
  registerAUser,
};
