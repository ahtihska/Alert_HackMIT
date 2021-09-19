const express = require("express");
const router = express.Router();
const incidents = require("../controllers/incidents");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const Incident = require("../models/incident");

router
  .route("/")
  .get(catchAsync(incidents.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(incidents.createCampground)
  );

router.get("/new", isLoggedIn, incidents.renderNewForm);
router.get("/companion", isLoggedIn, incidents.renderNewComp);

router
  .route("/:id")
  .get(catchAsync(incidents.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(incidents.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(incidents.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(incidents.renderEditForm)
);

module.exports = router;
