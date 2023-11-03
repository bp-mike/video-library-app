const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createQuote = async (req, res, next) => {
  // try {
  //   const quote = await prisma.quote.create({
  //     data: req.body,
  //   });
  //   res.json(quote);
  // } catch (error) {
  //   next(error);
  // }
};

const getAllQuotes = async (req, res, next) => {
  // try {
  //   const quotes = await prisma.quote.findMany({});
  //   res.json(quotes);
  // } catch (error) {
  //   next(error);
  // }
};

const getOneQuote = async (req, res, next) => {
  // try {
  //   const { id } = req.params;
  //   const quote = await prisma.quote.findUnique({
  //     where: {
  //       id: Number(id),
  //     },
  //   });
  //   res.json(quote);
  // } catch (error) {
  //   next(error);
  // }
};

const deleteQuote = async (req, res, next) => {
  // try {
  //   const { id } = req.params;
  //   const deleteQuote = await prisma.quote.delete({
  //     where: {
  //       id: Number(id),
  //     },
  //   });
  //   res.json(deleteQuote);
  // } catch (error) {
  //   next(error);
  // }
};

const updateQuote = async (req, res, next) => {
  // try {
  //   const { id } = req.params;
  //   const editQuote = await prisma.quote.update({
  //     where: {
  //       id: Number(id),
  //     },
  //     data: req.body,
  //   });
  //   res.json(editQuote);
  // } catch (error) {
  //   next(error);
  // }
};

module.exports = {
  createQuote,
  getAllQuotes,
  getOneQuote,
  deleteQuote,
  updateQuote,
};
