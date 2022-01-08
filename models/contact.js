const { Schema, model } = require("mongoose");
const Joi = require("joi");

const joiSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.bool,
});

const contactSchema = Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});
const Contact = model("contact", contactSchema);

module.exports = { Contact, joiSchema };
