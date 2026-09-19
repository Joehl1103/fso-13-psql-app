const router = require("express").Router();

const { Blog } = require("../models");

function printError(error) {
  console.log(`Error: ${error.message}`);
}

async function paramCheck(req, res, next) {
  const id = req.params.id;
  if (!id) {
    res.status(400).end("No id provided.");
  }
  next();
}

router.get("/", async (req, res) => {
  console.log("hello");
  try {
    const results = await Blog.findAll();
    res.json(results);
  } catch (error) {
    printError(error);
    res.status(404).end();
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await Blog.create(req.body);
    res.status(200).json(result);
  } catch (error) {
    printError(error);
    res.status(404).end();
  }
});

router.patch("/:id", paramCheck, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`hello with id: ${id}`);
  } catch (error) {
    printError(error);
    res.status(404).end();
  }
});

router.delete("/:id", paramCheck, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).end();
    }
    await Blog.destroy({ where: { id: id } });
    res.status(204).end();
  } catch (error) {
    printError(error);
    res.status(404).end();
  }
});

module.exports = router;
