'use strict';

require('dotenv').config();
const { Pool } = require('pg');

// check whether this api is runing on production server or not
const isProduction = true;
console.log(process.env.IS_PRODUCTION);
console.log(`Is this the production environment? ${isProduction ? 'yes' : 'no'}`);


//postgresql://USER:PASSWORD@HOST:PORT/DATABASE
// postgresql://picture_dictionary_user:@localhost:5433/picture_dictionary
const postgreConnectionString =
 `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`;

console.log(postgreConnectionString);

const postgrePool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : postgreConnectionString,
  ssl: isProduction,
});

function saveTheme(name) {
   return postgrePool.query('insert into theme(name) values($1) returning id', [name])
   .then(result => result.rows[0].id);
}

function saveImage(themeId) {
  let maxId = (new Date()).getTime().toString(36);
  getLastImageId(themeId).then(x => {if(x[0].maxId) maxId += x[0].maxId;});
  let imageName = maxId + "-" + themeId + ".png";
   return postgrePool.query('insert into image(name, themeid) values($1, $2) returning *', [imageName, themeId])
   .then(result => result.rows[0]);
}

function getLastImageId(themeId) {
  return postgrePool.query('select max(id) as maxId from image where themeid = $1', [themeId])
  .then(result => {console.log(result.rows[0]); return result.rows});
}



function updateLabel(name, id) {
   return postgrePool.query(`update word set name = $1 where id = $2 returning *`, [name, id])
   .then(result => result.rows[0].id);
}



function getAllThemes() {
  return postgrePool.query('select * from theme')
  .then(result => result.rows);
}



function getImageIds(themeId) {
  return postgrePool.query('select * from image where themeid = $1', [themeId])
  .then(result => result.rows);
}

function getImageName(imageId) {
  return postgrePool.query('select name from image where id = $1', [imageId])
  .then(result => result.rows[0].name);
}

function getLabels(imageId) {
  return postgrePool.query('select name from image where id = $1', [imageId])
  .then(result => result.rows);
  //TODO: get all the words (lables) for the given imageId

}

function getLabel(imageId, x, y) {
  //TODO: return the related word record
  // you can use the following sql statement:
  //  select  * from word where imageid = $1 and abs(x - $2) < 7 and abs(y - $3) < 7
  return postgrePool.query(`select  * from word where imageid = $1 and abs(x - $2) < 7 and abs(y - $3) < 7`, [imageId])
  .then(result => result.rows[0].id);

}

function saveLabel(name, x, y, number, imageId) {
   //TODO: insert a new record in the word table and return its id
   return return postgrePool.query('select word from image where id = $1', [imageId])
   .then(result => result.rows);
}

module.exports = { saveTheme, getAllThemes, getImageIds, getImageName, saveImage, saveLabel, getLabel, getLabels , updateLabel}
