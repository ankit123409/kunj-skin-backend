export const normalizeProductImages = (req, res, next) => {
  const images = Array.isArray(req.body?.images)
    ? req.body.images.filter(Boolean)
    : [];
  const image = req.body?.image;

  if (images.length) {
    req.body.images = images;
    req.body.image = images[0];
  } else if (Array.isArray(image) && image.length) {
    req.body.images = image.filter(Boolean);
    req.body.image = req.body.images[0];
  } else if (typeof image === "string" && image.trim()) {
    req.body.image = image.trim();
    req.body.images = [req.body.image];
  }

  next();
};
