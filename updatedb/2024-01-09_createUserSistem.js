const BaseModel = require("../src/models/base.model");

const User = new BaseModel("User");

const users = {
  username: "sistem",
  password: "sistem",
  store: "BOGOTA",
  role: "ADMIN",
};

module.exports = async () => {
  return User.create(users);
};
