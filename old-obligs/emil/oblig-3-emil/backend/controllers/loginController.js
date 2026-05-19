import { loginUser } from "../services/loginService.js";

export async function loginController(req, res) {
  try {
    const { email, password } = req.body; 
    const user = await loginUser(email, password);
    if (!user) {
      return res.status(404).json({ Error: "User was not found" });
    }
    return res.status(200).json({ msg: "Login successful", user });
  } catch (err) {
    return res.status(401).json({ msg: err.message });
  }
}

export default {
  loginController,
};
