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
        success: false,
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
      success: true,
      user: newUser,
      message: "User Registered Successfully",
    });
  } catch (error) {
    return res.status(400).json({ status: 400, error: `${error.message}` });
    // next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    const pageInt = parseInt(page) || 1;
    const pageSizeInt = parseInt(pageSize) || 10;
    const skip = (pageInt - 1) * pageSizeInt;

    const users = await prisma.user.findMany({
      skip,
      take: pageSizeInt,
      include: {
        orders: true,
      },
    });

    const totalUsers = await prisma.user.count({});

    return res.status(200).json({
      status: 200,
      success: true,
      users,
      totalUsers,
      page: pageInt,
      pageSize: pageSizeInt,
      message: "Users Fetched Successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: +id,
      },
    });
    if (!user) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User does not exist",
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      user,
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
        success: false,
        message: "User does not exist",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: req.body,
    });

    return res.status(200).json({
      status: 200,
      success: true,
      data: updatedUser,
      message: "User Update Successfully",
    });
  } catch (error) {
    res.status(400).json({ status: 400, error: `${error.message}` });
    console.log(error);
    // next(error);
  }
};

const updateUserPassword = async (req, res, next) => {
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
        success: false,
        message: "User does not exist",
      });
    }

    const body = req.body;
    const isPasswordMatched = await bcrypt.compare(body.currentPassword, userExists.password);
    if(!isPasswordMatched){
      return res.status(404).json({
        status: 400,
        success: false,
        message: "Incorrect Old Password",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(body.newPassword, salt);
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        password: newPasswordHash,
      },
    });

    return res.status(200).json({
      status: 200,
      success: true,
      data: updatedUser,
      message: "User Password Update Successfully",
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
        success: false,
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
      success: true,
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
  updateUserPassword,
  deleteUser,
};
