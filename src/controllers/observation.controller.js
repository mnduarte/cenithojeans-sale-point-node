// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Observation = new BaseModel("Observation");
// @Services

Controllers.create = async (req, res) => {
  try {
    const { observation, store, username } = req.body;

    const newObservation = await Observation.create({
      observation,
      store,
      username,
    });

    res.send({
      results: newObservation,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear precio" });
  }
};

Controllers.getObservations = async (req, res) => {
  try {
    const { month, year, store } = req.query;

    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfNextMonth = new Date(year, month + 1, 1);

    const query = {
      createdAt: {
        $gte: firstDayOfMonth,
        $lt: firstDayOfNextMonth,
      },
    };

    query.store = store;

    const observations = await Observation.aggregate([
      { $match: query },
      {
        $project: {
          id: "$_id",
          observation: 1,
          store: 1,
          _id: 0,
          date: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$createdAt",
            },
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.send({ results: observations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

module.exports = {
  Controllers,
};
