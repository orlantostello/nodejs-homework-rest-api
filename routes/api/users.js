const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const { User } = require("../../models");
const { joiEmailSchema } = require("../../models/user");
const { authentication, upload } = require("../../middlewares");
const { sendEmail } = require("../../helpers");

const { SITE_NAME } = process.env;

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

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });

    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { error } = joiEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "missing required field email",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Email is wrong",
      });
    }

    if (user.verify) {
      return res.status(400).json({
        message: "Verification has already been passed",
      });
    }

    const { verificationToken } = user;
    const data = {
      to: email,
      subject: "Подтверждение email",
      html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердить email</a>`,
    };

    await sendEmail(data);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
