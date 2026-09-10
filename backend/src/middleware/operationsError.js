module.exports = function operationsError(err, req, res, next) {
  console.error("[operations]", err);
  const status = err.status || (err.code === "P2025" ? 404 : err.code === "P2002" ? 409 : 500);
  const message = err.code === "P2002" ? "A record with the same unique value already exists." : err.message || "Internal server error";
  res.status(status).json({ message });
};
