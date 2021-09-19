const Joi = require("joi");
const { number } = require("joi");

module.exports.campgroundSchema = Joi.object({
  incident: Joi.object({
    title: Joi.string().required(),
    // price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    time: Joi.string().regex(/^([0-9]{2}):([0-9]{2})$/),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number(),
    body: Joi.string().required(),
  }).required(),
});
