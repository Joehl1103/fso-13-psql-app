const router = require("express").Router();

const { Blog } = require("../models");

router.get("/", async (req, res) => {
  console.log("hello");
  try {
    const results = await Blog.findAll();
    res.json(results);
  } catch (error) {
    console.log(`error: ${error.message}`);
    res.status(404).end();
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await Blog.create(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.log(`error: ${error.message}`);
    res.status(404).end();
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Error(`No id provided.`);
    }
    await Blog.destroy({ where: { id: id } });
    res.status(204).end();
  } catch (error) {
    console.error(`Error: ${e.message}`);
    res.status(404).end();
  }
});

module.exports = router;
