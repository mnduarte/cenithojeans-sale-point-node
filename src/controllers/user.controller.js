// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const User = new BaseModel("User");
// @Services

Controllers.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    res.send({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error to get the user" });
  }
};

module.exports = {
  Controllers,
};
