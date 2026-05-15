export function notFound(req, res) {
  res.status(404).json({ message: "The requested resource was not found." });
}

export function errorHandler(error, req, res, next) {
  void next;
  console.error(error);
  const status = error.status || error.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? "Something went wrong. Please try again." : error.message,
  });
}
