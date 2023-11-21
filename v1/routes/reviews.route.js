const router = require("express").Router();
const reviewsController = require("../controllers/reviews.controller");
// const { checkToken } = require("../auth/tokenValidation")

router.post("/", reviewsController.createReview); //todo check token on create

router.get("/",  reviewsController.getAllReviews);

router.get("/:movieId", reviewsController.getReviewsByMovie);

// TODO route that returns where user can review movie or not

// router.get("/:id", reviewsController.getOneReview);

// router.delete("/:id",  reviewsController.deleteReview); 

// router.patch("/:id",  reviewsController.updateReview); 

module.exports = router;
