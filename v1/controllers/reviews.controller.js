const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createReview = async (req, res, next) => {
  try {
    const { movieId, rating, comment } = req.body;

    // make sure the review is to an exising movie
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Movie not found",
      });
    }

    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        movieId,
      },
    });

    return res.status(201).json({
      status: 201,
      success: true,
      message: "Review created successfully",
    });
  } catch (error) {
    res.status(400).json({ status: 400, error: `${error.message}` });
    next(error);
  }
};

const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        Movie: true,
      },
    });

    return res.status(200).json({
      status: 200,
      success: true,
      reviews,
      message: "Reviews fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getReviewsByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        movieId: parseInt(movieId),
      },
      include: {
        Movie: true,
      },
    });

    return res.status(200).json({
      status: 200,
      success: true,
      reviews,
      message: "Movie Reviews fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

// TODO edit del reviews
// after adding user field, check if user ordered the movie hence allowing / disallowing him/her from reviewing

module.exports = {
  createReview,
  getAllReviews,
  getReviewsByMovie,
};
