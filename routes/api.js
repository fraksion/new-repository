var express = require('express');
var router = express.Router();
var authentication = require('../authentication');
var request = require('request-promise');
var url = require('url');
const bodyParser = require("body-parser");

var globalDocId = '0d86c205100fae7001a39ea8'	;
var globalWSId= 'aae7a1ff196df52c5a4c153c'	;
var globalEId= 'a7d49a58add345ddb7362051'	;
var globalMId= '8c69fddbdce56a2d4ca5f2be'	;


const urlencodedParser = bodyParser.urlencoded({extended: false});
router.use(urlencodedParser);
var apiUrl = 'https://cad.onshape.com';
if (process.env.API_URL) {
  apiUrl = process.env.API_URL;
}

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).send({
    authUri: authentication.getAuthUri(),
    msg: 'Authentication required.'
  });
}

router.post('/logout', function(req, res) {
  req.session.destroy();
  return res.send({});
});

router.get('/session', function(req, res) {
  if (req.user) {
    res.send({userId: req.user.id});
  } else {
    res.status(401).send({
      authUri: authentication.getAuthUri(),
      msg: 'Authentication required.'
    });
  }
});

var getDocuments = function(req, res) {
  request.get({
    uri: apiUrl + '/api/documents',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getDocuments(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting documents: ', err);
      });
    } else {
      console.log('GET /api/documents error: ', data);
    }
  });
};

var getWorkPlaces = function(req, res) {
  request.get({
    uri: apiUrl + '/api/documents/d/' + req.query.documentId + '/workspaces',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getDocuments(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting documents: ', err);
      });
    } else {
      console.log('GET /api/documents error: ', data);
    }
  });
};

var getMicroversion = function(req, res) {
  request.get({
    uri: apiUrl + '/api/documents/d/'+req.query.documentId +'/w/' + req.query.workspaceId +'/currentmicroversion',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getDocuments(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting documents: ', err);
      });
    } else {
      console.log('GET /api/documents error: ', data);
    }
  });
};

var getElementList = function(req, res) {
  request.get({
    uri: apiUrl + '/api/documents/d/' + req.query.documentId + "/w/" + req.query.workspaceId + '/elements',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getElementList(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting elements: ', err);
      });
    } else {
      console.log('GET /api/documents/elements error: ', data);
    }
  });
};

var getPartsList = function(req, res) {
  request.get({
    uri: apiUrl + '/api/parts/d/' + req.query.documentId + "/w/" + req.query.workspaceId,
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getPartsList(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting elements: ', err);
      });
    } else {
      console.log('GET /api/parts/workspace error: ', data);
    }
  });
};

var getStl = function(req, res) {
  var url;
  if (req.query.partId != null) {
    url = apiUrl + '/api/parts/d/' + req.query.documentId +
    '/w/' + req.query.workspaceId + '/e/' + req.query.stlElementId +'/partid/'+ req.query.partId + '/stl/' +
    '?mode=' + 'text'  +
    '&scale=1&units=inch';
    console.log("** STL for partId " + req.query.partId);
  }
  else {
    url = apiUrl + '/api/partstudios/d/' + req.query.documentId +
    '/w/' + req.query.workspaceId + '/e/' + req.query.stlElementId + '/stl/' +
    '?mode=' + 'text'  +
    '&scale=1&units=inch';
    console.log("** STL for partId " + req.query.partId);
  }

  if (req.query.angleTolerance !== '' && req.query.chordTolerance !== '') {
    url += '&angleTolerance=' + req.query.angleTolerance +'&chordTolerance=' + req.query.chordTolerance + '&configuration=DIAMETER%3D0.0010160000000000002+meter%3BFLUTE_LENGTH%3D0.0+meter%3BFLUTE_PITCH%3D0.55%3BSHANK_LENGTH%3D0.0+meter';
  }                                                                                                        

  if (req.query.configuration != null)
  {
    //url += '&configuration=' + req.query.configuration;
  }

  request.get({
    uri: url,
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getStl(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting elements: ', err);
      });
    } else {
      console.log('GET /api/parts/workspace error: ', data);
    }
  });
};


var getDecodedConfigString = function(req, res) {
  request.get({
    uri: apiUrl + '/api/elements/d/' + req.query.documentId + 
	'/m/' + req.query.microversion + 
	'/e/' + req.query.elementId + 
	'/configurationencodings/undefined?includeDisplay=false&configurationIsId=true',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getConfigString(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting documents: ', err);
      });
    } else {
      console.log('GET /api/documents error: ', data);
    }
  });
};

var getEncodedConfigString = function(req, res) {

  request.get({
//    uri: apiUrl + '/api/elements/d/0d86c205100fae7001a39ea8/w/aae7a1ff196df52c5a4c153c/e/a7d49a58add345ddb7362051/configuration',
    uri: apiUrl + '/api/partstudios/d/' + req.query.documentId + 
	'/w/' + req.query.workspaceId + 
	'/e/' + req.query.elementId + 
	'/configuration',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getConfigString(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting documents: ', err);
      });
    } else {
      console.log('GET /api/documents error: ', data);
    }
  });
};

  var updateConfigString = function(req, res) {
    request.post({
    uri: apiUrl + '/api/elements/d/' + req.query.documentId + 
	'/w/' + req.query.workspaceId + 
	'/e/' + req.query.elementId + 
	'/configuration',
      headers: {
        'Authorization': 'Bearer ' + req.user.accessToken,
      },
      json:true,
      body: req.body
    }).then(function(data){
      res.json(data);
    }).catch(function(data) {
      if (data.statusCode === 401) {
        authentication.refreshOAuthToken(req, res).then(function() {
          encodeConfigString(req, res);
        }).catch(function(err) {
          console.log('Error refreshing token or getting documents: ', err);
        });
      } else {
        console.log('GET /api/documents error: ', data);
      }
    });
    };

    var encodeConfigString = function(req, res) {
      request.post({
      uri: apiUrl + '/api/elements/d/' + req.query.documentId + 
    '/e/' + req.query.elementId + 
    '/configurationencodings',
        headers: {
          'Authorization': 'Bearer ' + req.user.accessToken,
        },
        json:true,
        body: req.body
      }).then(function(data){
        res.json(data);
      }).catch(function(data) {
        if (data.statusCode === 401) {
          authentication.refreshOAuthToken(req, res).then(function() {
            encodeConfigString(req, res);
          }).catch(function(err) {
            console.log('Error refreshing token or getting documents: ', err);
          });
        } else {
          console.log('GET /api/documents error: ', data);
        }
      });
      };


  const jsonParser = express.json();

router.post('/updateConfig', jsonParser, updateConfigString);
router.post('/encodeConfig', jsonParser, encodeConfigString);
router.get('/getEncodedConfig', getEncodedConfigString);
router.get('/getDecodedConfig', getDecodedConfigString);
router.get('/documents', getDocuments);
router.get('/elements', getElementList);
router.get('/stl', getStl);
router.get('/parts', getPartsList);
router.get('/workplaces', getWorkPlaces);
router.get('/microversion', getMicroversion);

module.exports = router;
