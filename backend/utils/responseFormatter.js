class ResponseFormatter {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json(data);
  }

  static error(res, message, statusCode = 500) {
    return res.status(statusCode).json({ error: message });
  }

  static successWithMessage(res, data, message, statusCode = 200) {
    return res.status(statusCode).json({
      message,
      data
    });
  }
}

module.exports = ResponseFormatter;