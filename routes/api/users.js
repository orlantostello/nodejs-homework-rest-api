const express = require("express");

const { User } = require("../../models");
const { authentication } = require("../../middlewares");

const router = express.Router();

router.get("/logout", authentication, async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/current", authentication, async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ user: { email, subscription } });
});

module.exports = router;
