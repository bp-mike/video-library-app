const router = require("express").Router();
const usersController = require("../controllers/users.controller")

router.post("/", usersController.registerUser);

router.get("/", usersController.getAllUsers);

router.get("/:id", usersController.getOneUser);

router.patch("/:id", usersController.updateUser);

router.delete("/:id", usersController.deleteUser);

module.exports = router;
