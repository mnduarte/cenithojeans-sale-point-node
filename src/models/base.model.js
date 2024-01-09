// @Vendors
const sanitize = require("mongo-sanitize");
// @Schemas
const schemas = {
  User: require("../schemas/user.schema"),
  Sale: require("../schemas/sale.schema"),
  Employee: require("../schemas/employee.schema"),
  Price: require("../schemas/price.schema"),
  UpdateDB: require("../schemas/update-db.schema"),
};

class BaseModel {
  constructor(schemaName) {
    this.Schema = schemas[schemaName];
  }

  /**
   * Updates the document matching the criteria with the given data.
   *
   * @param {ObjectId} id
   * @param {Object} data
   * @param {Function} next
   */
  findByIdAndUpdate(id, data) {
    const cleanedId = sanitize(id);
    return this.Schema.findByIdAndUpdate(cleanedId, data, { new: true });
  }

  /**
   * Create a document.
   *
   * @param {Object} query
   * @param {Function} next
   */
  async create(data) {
    const cleanedData = sanitize(data);
    const doc = new this.Schema(cleanedData);

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
      const newData = await this.Schema.insertMany(cleanedData);
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
    { orderBy = "-createdAt", projection, mustSanitize = true } = {}
  ) {
    const cleanedQuery = mustSanitize ? sanitize(query) : query;
    return this.Schema.findOne(cleanedQuery, projection).sort(orderBy);
  }

  /**
   * Retrieves the document matching the criteria.
   *
   * @param {Object} query
   */
  findOneNotSecure(query) {
    return this.Schema.findOne(query);
  }

  remove(query) {
    return this.Schema.deleteOne(query);
  }

  /**
   * Retrieves all the accounts on the database without limits.
   *
   */
  async find(query = {}, orderBy = {}, limit = {}, projection = {}) {
    return this.Schema.find(query, projection).sort(orderBy).limit(limit);
  }

  /**
   * Retrieves all the documents on the data base.
   *
   */
  findAll(
    query = {},
    { limit = 10, offset = 0, orderBy = "-createdAt", pagination = true } = {}
  ) {
    const cleanQuery = sanitize(query);

    if (pagination)
      return this.Schema.find(cleanQuery)
        .limit(limit)
        .skip(offset * limit)
        .sort(orderBy);

    return this.Schema.find(cleanQuery).sort(orderBy);
  }

  /**
   * Retrieves all the documents on the data base.
   *
   */
  findAllNotSecure(
    query = {},
    { limit = 10, offset = 0, orderBy = "-createdAt", pagination = true } = {}
  ) {
    if (pagination)
      return this.Schema.find(query)
        .limit(limit)
        .skip(offset * limit)
        .sort(orderBy);
    return this.Schema.find(query).sort(orderBy);
  }

  /**
   * Retrieves all the documents on the data base.
   *
   */
  findAllAndPopulate(
    query = {},
    populate,
    { limit = 10, offset = 0, orderBy = "-createdAt" } = {}
  ) {
    const cleanQuery = sanitize(query);
    return this.Schema.find(cleanQuery)
      .populate(populate)
      .limit(limit)
      .skip(offset * limit)
      .sort(orderBy);
  }

  findOneAndUpdate(filter = {}, update = {}) {
    const cleanFilter = sanitize(filter);
    return this.Schema.findOneAndUpdate(cleanFilter, update, { new: true });
  }

  /**
   * Retrieves the total count of documents on the data base.
   *
   * @param {Function} next
   */
  count(query = {}) {
    const cleanQuery = sanitize(query);
    return this.Schema.count(cleanQuery);
  }

  /**
   * Retrieve all aggregate data from this Schema
   */
  aggregate(list) {
    return this.Schema.aggregate(list);
  }

  /**
   * Retrieves the total count of documents on the data base.
   *
   * @param {Function} next
   */
  countNotSecure(query = {}) {
    return this.Schema.count(query);
  }

  /**
   * Updates all documents that match filter.
   * You need to use $set to not override the doc.
   *
   * @param {Function} filter
   * @param {Function} doc
   * @param {Function} options
   */
  updateMany(filter = {}, doc = {}, options = {}) {
    return this.Schema.updateMany(filter, doc, options);
  }
}

module.exports = BaseModel;
