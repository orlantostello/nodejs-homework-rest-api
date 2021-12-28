const express = require("express");
const { NotFound, BadRequest } = require("http-errors");
// const Joi = require("joi");
const { Contact } = require("../../models");
const { joiSchema } = require("../../models/contact");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findById({ _id: id });
    if (!contact) {
      throw new NotFound();
      // return res.status(404).json({
      //   message: "Not found",
      // });
    }
    res.json(contact);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
      //   return res.status(400).json({
      //     message: "missing required name field",
      //   });
    }
    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteContact = await Contact.findByIdAndRemove(id);
    if (!deleteContact) {
      throw new NotFound();
      // return res.status(404).json({
      //   message: "Not found",
      // });
    }
    res.json({ message: "contact delete" });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updateContact) {
      throw new NotFound();
      // return res.status(404).json({
      //   message: "Not found",
      // });
    }
    res.json(updateContact);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId")) {
      error.status = 400;
    }
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
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
