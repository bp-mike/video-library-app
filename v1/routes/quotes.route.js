const router = require("express").Router();
const quotesController = require("../controllers/quotes.controller");

router.post("/", quotesController.createQuote);

router.get("/", quotesController.getAllQuotes);

router.get("/:id", quotesController.getOneQuote);

router.delete("/:id", quotesController.deleteQuote);

router.patch("/:id", quotesController.updateQuote);

module.exports = router;
