var URL = require('url-parse');

function parseUrl(url) {
  // console.log(URL(url, true));
  return URL(url, true);
};

function getHost(url) {
  // const clearUrl = parseUrl(url).hostname;
  // return clearUrl.replace('www.', '');
  return parseUrl(url).hostname;
};

function getFulPath(url) {
  var clearUrl = parseUrl(url);
  var fullPath = url.replace('http://', '');
  // fullPath = fullPath.replace('www.', '');
  
  return fullPath.replace(getHost(url), '');
};

module.exports = {
    parseUrl: parseUrl,
    getHost: getHost,
    getFulPath: getFulPath
};
