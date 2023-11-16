const router = require("express").Router();
const usersController = require("../controllers/users.controller")
const multer = require('multer');
// const { checkToken } = require("../auth/tokenValidation")

const upload = multer({ dest: 'uploads/' });

router.post("/", usersController.registerUser);

// router.get("/", checkToken, usersController.getAllUsers);
router.get("/", usersController.getAllUsers);

// router.get("/:id", checkToken, usersController.getOneUser);
router.get("/:id", usersController.getOneUser);

// router.patch("/:id", checkToken, usersController.updateUser);
router.patch("/:id", usersController.updateUser);

router.patch("/change-pwd/:id", usersController.updateUserPassword);

// router.delete("/:id", checkToken, usersController.deleteUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;
