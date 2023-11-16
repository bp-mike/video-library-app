const router = require("express").Router();
const moviesController = require("../controllers/movies.controller");
// const { checkToken } = require("../auth/tokenValidation")

router.post("/", moviesController.createMovie); //todo check token on create

router.get("/",  moviesController.getAllMovies);

router.get("/:id", moviesController.getOneMovie);

router.delete("/:id",  moviesController.deleteMovie); //todo check token on create

router.patch("/:id",  moviesController.updateMovie); //todo check token on create

module.exports = router;
