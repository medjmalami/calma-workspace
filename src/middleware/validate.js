function validate(schema, source = 'body') {
  return (request, _response, next) => {
    const result = schema.safeParse(request[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    request[source] = result.data;
    next();
  };
}

module.exports = validate;
