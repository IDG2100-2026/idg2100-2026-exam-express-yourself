export function adminRequired(req, res, next) {
  const userType = req.headers["user-type"];

  if (userType !== "admin") {
    return res.status(403).json({ Error: "Access denied! Admin Only!" });
  }
  next();
}

export function userRequire(req, res, next) {
  const userType = req.headers["user-type"]; // anonymous, registered or admin
  const userId = req.headers["user-id"]; // User has a userId if they are registered

  if (!userType || userType === "anonymous") {
    // lets you inside a tournament if you are registered or admin!
    return res.status(401).json({
      Error:
        "Access denied. You must be a registered user to play in a tournament! ",
    });
  }

  if (!userId) {
    return res
      .status(400)
      .json({ Error: "Missing user-id header to authenticate user!" });
  }
  req.user = { id: userId, type: userType };

  next();
}
export default {
  adminRequired,
  userRequire,
};
