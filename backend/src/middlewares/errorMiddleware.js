// Catches all errors passed with next(err)
const errorHandler = (err, req, res, _next) => {
  console.error(err.message);

  // Duplicate key error (e.g. same username or email)
  if (err.code === 11000) {
    return res.status(400).json({ error: "That value already exists" });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  // Fallback
  res.status(500).json({ error: "Something went wrong" });
};

export default errorHandler;
