var express = require('express');
var url = require('url');

exports.renderPage = function(req, res) {
  window.location.pathname  = '/oauthSignin';
  res.render('index');
};

function callback(req, res, success, data) {
  if (!success) {
    var search = url.parse(req.url).search;
    res.status(404);
    return res.send();
  }
  res.send(data);
}
