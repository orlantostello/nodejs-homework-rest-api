const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const { User } = require("../../models");
const { authentication, upload } = require("../../middlewares");

const router = express.Router();

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

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

router.patch(
  "/avatars",
  authentication,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { path: tempUpload, filename } = req.file;
      const image = await Jimp.read(tempUpload);
      await image.resize(250, 250);
      await image.writeAsync(tempUpload);
      const [extension] = filename.split(".").reverse();
      const newFleName = `${req.user._id}.${extension}`;
      const fileUpload = path.join(avatarsDir, newFleName);
      await fs.rename(tempUpload, fileUpload);
      const avatarURL = path.join("avatars", newFleName);
      await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true });
      res.json({ avatarURL });
    } catch (error) {
      if (error.message.includes("Not authorized")) {
        error.status = 401;
      }
      next(error);
    }
  }
);

module.exports = router;
