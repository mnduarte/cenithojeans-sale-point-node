const Setting = require("../schemas/setting.schema");

const Controllers = {};

Controllers.getSetting = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({ showCashToUsers: false });
    }
    res.send({ results: setting });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener configuración" });
  }
};

Controllers.updateSetting = async (req, res) => {
  try {
    const updates = req.body;
    let setting = await Setting.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true }
    );
    res.send({ results: setting });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al actualizar configuración" });
  }
};

module.exports = { Controllers };
