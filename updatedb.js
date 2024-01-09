/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const fs = require('fs');
const _ = require('lodash');
const Bluebird = require('bluebird');

const BaseModel = require('./src/models/base.model');
const { db } = require('./config/database.config');

const SCRIPT_PATH = 'updatedb';
const UpdateDBModel = new BaseModel('UpdateDB');

const files = _.filter(fs.readdirSync(SCRIPT_PATH), file => file.indexOf('.js') !== -1);
const createOrUpdate = (model, filename, data) => {
  if (model) {
    return UpdateDBModel.findByIdAndUpdate(model._id, data);
  }
  return UpdateDBModel.create({ filename, ...data });
};
const exec = async () => {
  await Bluebird.mapSeries(files, async filename => {
    const updateDB = await UpdateDBModel.findOne({ filename });

    if (!updateDB || !updateDB.executed || updateDB.status === 'FAILURE') {
      try {
        console.log(`::: Executing script ${filename}`);
        const script = require(`./${SCRIPT_PATH}/${filename.replace('.js', '')}`);
        await script();
        console.log(`::: Execution successful ✓`);
        return createOrUpdate(updateDB, filename, { executed: true, status: 'SUCCESS', error: undefined });
      } catch ({ message, stack }) {
        console.error({ message, stack });
        return createOrUpdate(updateDB, filename, { executed: true, status: 'FAILURE', error: { message, stack } });
      }
    }
  });

  process.exit(0);
};

db.once('open', exec);
