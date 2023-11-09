const dotenv = require("dotenv");
const path = require("path");

module.exports = async () => {
  const envVars = dotenv.config({
    path: path.join(__dirname, ".env"),
  }).parsed;
  return Object.assign({}, envVars, process.env);
};
