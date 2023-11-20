const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//TODO restrict non admin role users from creatinf & editing

const createMovie = async (req, res, next) => {
  try {
    const body = req.body;
    // check if movie title  exists
    const movieTitleExists = await prisma.movie.findUnique({
      where: {
        title: body.title.toLowerCase(),
      },
    });
    if (movieTitleExists) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "A Movie with a similar title already exists",
      });
    }

    await prisma.movie.create({
      data: {
        ...body,
        title: body.title.toLowerCase(),
      },
    });

    return res.status(201).json({
      status: 200,
      success: true,
      message: "Movie added Successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
    // return res.status(400).json({ status: 400, error: `${error.message}` });
  }
};

const getAllMovies = async (req, res, next) => {
  try {
    const { page, pageSize, titleSearch, genre, ratings, minPrice, maxPrice } = req.query;
    const pageInt = parseInt(page) || 1;
    const pageSizeInt = parseInt(pageSize) || 10;
    const skip = (pageInt - 1) * pageSizeInt;

    const where = {};
    if (titleSearch) {
      where.title = {
        contains: titleSearch,
        mode: "insensitive", // Case-insensitive titleSearch
      };
    }
    if (genre) {
      where.genre = genre;
    }
    // if (ratings) {
    //   where.ratings = parseFloat(ratings)
    // }

    if (ratings) {
      const ratingRange = parseFloat(ratings);
      switch (true) {
        case ratingRange === 1:
          where.ratings = 1;
          break;
        case ratingRange >= 1.1 && ratingRange <= 2:
          where.ratings = { gte: 1.1, lte: 2 };
          break;
        case ratingRange >= 2.1 && ratingRange <= 3:
          where.ratings = { gte: 2.1, lte: 3 };
          break;
        case ratingRange >= 3.1 && ratingRange <= 4:
          where.ratings = { gte: 3.1, lte: 4 };
          break;
        case ratingRange >= 4.1 && ratingRange <= 5:
          where.ratings = { gte: 4.1, lte: 5 };
          break;
        default:
          return res.status(400).json({ error: "Invalid ratings" });
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    const movies = await prisma.movie.findMany({
      where,
      skip,
      take: pageSizeInt,
      include: {
        reviews: true,
      },
    });

    const totalMovies = await prisma.movie.count({ where });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Movies Fetched Successfully",
      movies,
      totalMovies,
      page: pageInt,
      pageSize: pageSizeInt,
    });
  } catch (error) {
    next(error);
  }
};

const getOneMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        reviews: true,
      },
    });
    if (!movie) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Movie does not exist",
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      movie,
      message: "movie Fetched Successfully",
    });
  } catch (error) {
    // res.status(400).json({ status: 400, error: `${error.message}` });
    next(error);
  }
};

const updateMovie = async (req, res, next) => {
  const body = req.body;
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!movie) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Movie does not exist",
      });
    }

    // Check if a movie with the same title as the updated title exists (excluding the current movie)
    const movieTitleExists = await prisma.movie.findFirst({
      where: {
        title: body.title.toLowerCase(),
        NOT: {
          id: Number(id), // Exclude the current movie by its ID
        },
      },
    });

    if (movieTitleExists) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "A movie with a similar title already exists",
      });
    }

    await prisma.movie.update({
      where: {
        id: Number(id),
      },

      data: {
        ...body,
        title: body.title.toLowerCase(),
      },
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Movie Update Successfully",
    });
  } catch (error) {
    res.status(400).json({ status: 400, error: `${error.message}` });
    next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!movie) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Movie does not exist",
      });
    }

    await prisma.movie.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Movie Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({ status: 400, error: `${error.message}` });
    next(error);
  }
};

// TODO search functionality

module.exports = {
  createMovie,
  getAllMovies,
  getOneMovie,
  deleteMovie,
  updateMovie,
};
