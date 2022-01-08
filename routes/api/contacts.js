const express = require("express");
const { NotFound, BadRequest } = require("http-errors");
// const Joi = require("joi");
const { Contact } = require("../../models");
const { joiSchema } = require("../../models/contact");
const { authentication } = require("../../middlewares");

const router = express.Router();

router.get("/", authentication, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const contacts = await Contact.find(
      { owner: _id },
      "_id name email phone favorite",
      { skip, limit: +limit }
    );
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authentication, async (req, res, next) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findById({ _id: id });
    if (!contact) {
      throw new NotFound();
    }
    res.json(contact);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.post("/", authentication, async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { _id } = req.user;
    const newContact = await Contact.create({ ...req.body, owner: _id });
    res.status(201).json(newContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:id", authentication, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteContact = await Contact.findByIdAndRemove(id);
    if (!deleteContact) {
      throw new NotFound();
    }
    res.json({ message: "contact delete" });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authentication, async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updateContact) {
      throw new NotFound();
    }
    res.json(updateContact);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId")) {
      error.status = 400;
    }
    next(error);
  }
});

router.patch("/:contactId/favorite", authentication, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { favorite } = req.body;

    const updateContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      {
        new: true,
      }
    );

    if (!updateContact) {
      throw new NotFound();
    }
    res.json(updateContact);
  } catch (error) {
    if (error.message.includes("missing field favorite")) {
      error.status = 400;
    }
    next(error);
  }
});

module.exports = router;
