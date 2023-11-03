const { PrismaClient } = require("@prisma/client");
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// TODO validate with joi in another folder research

const registerUser = async (req, res, next) => {
  try {
    const body = req.body;
    // check if user exists
    const useExists = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (useExists) {
      return res.status(400).json({
        status: 400,
        success: 0,
        message: "A User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);

    const newUser = await prisma.user.create({
      data: body,
    });

    return res.status(200).json({
      status: 200,
      success: 1,
      data: newUser,
      message: "User Registered Successfully",
    });
  } catch (error) {
    return res.status(400).json({ status: 400, error: `${error.message}` });
    // next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: true,
      },
    });

    return res.status(200).json({
      status: 200,
      success: 1,
      data: users,
      message: "Users Fetched Successfully",
    });
  } catch (error) {
    // res.status(400).json({ status: 400, error: `${error.message}` });
    next(error);
  }
};

const getOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      return res.status(404).json({
        status: 404,
        success: 0,
        message: "User does not exist",
      });
    }

    return res.status(200).json({
      status: 200,
      success: 1,
      data: user,
      message: "User Data Fetched Successfully",
    });
  } catch (error) {
    // res.status(400).json({ status: 400, error: `${error.message}` });
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userExists = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!userExists) {
      return res.status(404).json({
        status: 404,
        success: 0,
        message: "User does not exist",
      });
    }

    const body = req.body;
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: body,
    });

    return res.status(200).json({
      status: 200,
      success: 1,
      data: updatedUser,
      message: "User Update Successfully",
    });
  } catch (error) {
    res.status(400).json({ status: 400, error: `${error.message}` });
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userExists = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!userExists) {
      return res.status(404).json({
        status: 404,
        success: 0,
        message: "User does not exist",
      });
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      status: 200,
      success: 1,
      data: deletedUser,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({ status: 400, error: `${error.message}` });
    next(error);
  }
};

module.exports = {
  registerUser,
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
};
