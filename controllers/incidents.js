const Incident = require("../models/incident");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const incidents = await Incident.find({});
  res.render("incidents/index", { incidents });
};

module.exports.renderNewForm = (req, res) => {
  res.render("incidents/new");
};

module.exports.renderNewComp = (req, res) => {
  res.render("incidents/companion");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.incident.location,
      limit: 1,
    })
    .send();
  const incident = new Incident(req.body.incident);
  incident.geometry = geoData.body.features[0].geometry;
  incident.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  incident.author = req.user._id;
  await incident.save();
  console.log(incident);
  req.flash("success", "Successfully made a new incident!");
  res.redirect(`/incidents/${incident._id}`);
};

module.exports.showCampground = async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!incident) {
    req.flash("error", "Cannot find that incident!");
    return res.redirect("/incidents");
  }
  res.render("incidents/show", { incident });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const incident = await Incident.findById(id);
  if (!incident) {
    req.flash("error", "Cannot find that incident!");
    return res.redirect("/incidents");
  }
  res.render("incidents/edit", { incident });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const incident = await Incident.findByIdAndUpdate(id, {
    ...req.body.incident,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  incident.images.push(...imgs);
  await incident.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await incident.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated incident!");
  res.redirect(`/incidents/${incident._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Incident.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted incident");
  res.redirect("/incidents");
};
