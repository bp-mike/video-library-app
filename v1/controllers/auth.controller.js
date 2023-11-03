const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const login = async (req, res, next) => {
  try {
    const body = req.body;
    // find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (!user) {
      return res.status(400).json({
        status: 400,
        success: 0,
        message: "Invalid user",
      });
    }

    const result = bcrypt.compare(body.password, user.password);
    if (result) {
      user.password = undefined;
      const jToken = jwt.sign(user, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "1m",
      });
      return res.status(200).json({
        status: 200,
        success: 1,
        token: jToken,
        message: "logged in successfully",
      });
    } else {
      return res.status(400).json({
        status: 400,
        success: 0,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: 400, error: `${error.message}` });
    // next(error);
  }
};

module.exports = {
  login,
};
