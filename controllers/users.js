const router = require("express").Router();
const { User } = require("../models");

router.post("/", async (req, res, next) => {
  console.log("req.body", req.body);
  try {
    const result = await User.create(req.body);
    const { username } = req.body;
    res.status(200).end(`User '${username} created.`);
  } catch (error) {
    console.log(error);
  }
});

router.get("/", async (req, res) => {
  console.log("hello");
  const users = await User.findAll();
  console.log(users);
});

module.exports = router;
