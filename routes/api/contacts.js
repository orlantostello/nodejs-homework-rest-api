const express = require("express");
// const { NotFound, BadRequest } = require("http-errors");
const Joi = require("joi");
const router = express.Router();

const contactsOperations = require("../../model");

const schemaUpdate = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
}).min(1);

router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsOperations.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await contactsOperations.getContactById(contactId);
    if (!contact) {
      // throw new NotFound();
      return res.status(404).json({
        message: "Not found",
      });
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = schemaUpdate.validate(req.body);
    if (error) {
      // throw new BadRequest(error.message);
      return res.status(400).json({
        message: "missing required name field",
      });
    }
    const newContact = await contactsOperations.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deleteContact = await contactsOperations.removeContact(contactId);
    if (!deleteContact) {
      // throw new NotFound();
      return res.status(404).json({
        message: "Not found",
      });
    }
    res.json({ message: "contact delete" });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "missing fields",
    });
  }

  try {
    const updateContact = await contactsOperations.updateContact(
      contactId,
      req.body
    );

    if (!updateContact) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    res.json(updateContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
