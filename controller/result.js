const convert = require('xml-js');

exports.getResult = (data, req) => {
  let result;
  if (req.headers["format"] == "xml") {
    var options = { compact: true, ignoreComment: true, spaces: 4 };
    result = convert.json2xml(JSON.stringify(data), options);
  } else {
    result = data;
  }
  return result;
};
