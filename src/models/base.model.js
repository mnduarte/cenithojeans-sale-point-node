// @Vendors
const sanitize = require("mongo-sanitize");
const mongoose = require("mongoose");
const { connectionStore } = require("../../config/database.config");
// @Schemas
const schemas = {
  User: require("../schemas/user.schema"),
  Sale: require("../schemas/sale.schema"),
  Employee: require("../schemas/employee.schema"),
  AccountTransfer: require("../schemas/accounttransfer.schema"),
  Price: require("../schemas/price.schema"),
  Store: require("../schemas/store.schema"),
  Cashflow: require("../schemas/cashflow.schema"),
  Observation: require("../schemas/observation.schema"),
  UpdateDB: require("../schemas/update-db.schema"),
  Cost: require("../schemas/cost.schema"),
  Account: require("../schemas/account.schema"),
  Cashier: require("../schemas/cashier.schema"),
  Printer: require("../schemas/printer.schema"),
};

class BaseModel {
  constructor(schemaName) {
    this.schemaName = schemaName;
    this.Schema = schemas[schemaName];
  }

  /**
   * Returns the Mongoose model for the current request's DB connection.
   * If a local connection is active (via x-client-env header), uses that.
   * Falls back to the default connection model otherwise.
   */
  _getModel() {
    const conn = connectionStore.getStore();
    if (conn) {
      try {
        return conn.model(this.schemaName);
      } catch (_) {
        // Model not yet registered on this connection — register it now
        const schema = mongoose.models[this.schemaName]?.schema;
        return conn.model(this.schemaName, schema);
      }
    }
    return this.Schema;
  }

  /**
   * Updates the document matching the criteria with the given data.
   *
   * @param {ObjectId} id
   * @param {Object} data
   * @param {Function} next
   */
  findByIdAndUpdate(id, data) {
    return this._getModel().findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Create a document.
   *
   * @param {Object} query
   * @param {Function} next
   */
  async create(data) {
    const now = data.date ? new Date(data.date) : new Date();

    if (!data.date) {
      now.setHours(now.getHours() - 3);
    }

    data.createdAt = now;

    const cleanedData = sanitize(data);

    const Model = this._getModel();
    const doc = new Model(cleanedData);

    await doc.save();
    return doc;
  }

  /**
   * Create many documents.
   *
   * @param {Object} query
   * @param {Function} next
   */
  async insertMany(data) {
    const cleanedData = sanitize(data);
    try {
      const newData = await this._getModel().insertMany(cleanedData);
      console.log("Documents inserted correctly");
      return newData;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Retrieves the document matching the criteria.
   *
   * @param {Object} query
   * @param {Function} next
   */
  findOne(
    query = {},
    { orderBy = "-createdAt", projection, mustSanitize = true } = {},
  ) {
    return this._getModel().findOne(query, projection).sort(orderBy);
  }

  /**
   * Retrieves the document matching the criteria.
   *
   * @param {Object} query
   */
  findOneNotSecure(query) {
    return this._getModel().findOne(query);
  }

  remove(query) {
    return this._getModel().deleteOne(query);
  }

  /**
   * Remove multiple documents based on a query.
   *
   * @param {Object} query
   */
  removeMany(query) {
    return this._getModel().deleteMany(query);
  }

  /**
   * Remove all documents from the collection.
   */
  removeAll() {
    return this._getModel().deleteMany({});
  }

  /**
   * Retrieves all the accounts on the database without limits.
   *
   */
  async find(query = {}, orderBy = {}, limit = {}, projection = {}) {
    return this._getModel().find(query, projection).sort(orderBy).limit(limit);
  }

  /**
   * Retrieves all the documents on the data base.
   *
   */
  findAll(
    query = {},
    { limit = 10, offset = 0, orderBy = "-createdAt", pagination = true } = {},
  ) {
    const cleanQuery = sanitize(query);

    if (pagination)
      return this._getModel().find(cleanQuery)
        .limit(limit)
        .skip(offset * limit)
        .sort(orderBy);

    return this._getModel().find(cleanQuery).sort(orderBy);
  }

  /**
   * Retrieves all the documents on the data base.
   *
   */
  findAllNotSecure(
    query = {},
    { limit = 10, offset = 0, orderBy = "-createdAt", pagination = true } = {},
  ) {
    if (pagination)
      return this._getModel().find(query)
        .limit(limit)
        .skip(offset * limit)
        .sort(orderBy);
    return this._getModel().find(query).sort(orderBy);
  }

  /**
   * Retrieves all the documents on the data base.
   *
   */
  findAllAndPopulate(
    query = {},
    populate,
    { limit = 10, offset = 0, orderBy = "-createdAt" } = {},
  ) {
    const cleanQuery = sanitize(query);
    return this._getModel().find(cleanQuery)
      .populate(populate)
      .limit(limit)
      .skip(offset * limit)
      .sort(orderBy);
  }

  findOneAndUpdate(filter = {}, update = {}) {
    const cleanFilter = sanitize(filter);
    return this._getModel().findOneAndUpdate(cleanFilter, update, { new: true });
  }

  /**
   * Retrieves the total count of documents on the data base.
   *
   * @param {Function} next
   */
  count(query = {}) {
    const cleanQuery = sanitize(query);
    return this._getModel().count(cleanQuery);
  }

  /**
   * Retrieve all aggregate data from this Schema
   */
  aggregate(list) {
    return this._getModel().aggregate(list);
  }

  /**
   * Retrieves the total count of documents on the data base.
   *
   * @param {Function} next
   */
  countNotSecure(query = {}) {
    return this._getModel().count(query);
  }

  /**
   * Updates all documents that match filter.
   * You need to use $set to not override the doc.
   *
   * @param {Function} query
   */
  updateMany(query = {}, update = {}) {
    return this._getModel().updateMany(query, update);
  }
}

module.exports = BaseModel;
