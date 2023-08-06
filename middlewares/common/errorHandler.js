import createError from "http-errors";

export function notFoundHandler(req, res, next) {
  next(createError(404, "Your requestd content was not found"));
}

export function errorHandler(err, req, res, next) {
  res.locals.error =
    process.env.NODE_ENV === "development" ? err : { message: err.message };

  res.status(err.status || 500);

  if (res.locals.html) {
    // html response
    res.render("error", {
      title: "Error page",
    });
  } else {
    // json response
    console.log({ errorHandler: res.locals.error });
    res.json(res.locals.error);
  }
}
