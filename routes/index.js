var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var FileUtil = require('../utils/FileUtil');
var documentPath = path.normalize(__dirname + '/../documents');
var documentDistPath = path.normalize(__dirname + '/../public/dist/documents');

function sortObject(obj, field){
    obj = _.sortBy(obj, field);
    for(var i = 0; i < obj.length; i ++){
        if(obj[i].children){
            obj[i].children = _.sortBy(obj[i].children, field);
        }
    }

    return obj;
}



router.get('/', function (req, res) {
    FileUtil.getDiretoryTree(documentPath, function (err, data) {
        if (err) {
            console.error(err);
        }

        res.render('index', {
            documents: sortObject(data, 'name')
        });
    });
});

router.get('/documents/*', function (req, res) {
    var dicPath = decodeURI(req.path).replace('/documents/', '');

    fs.readFile(path.join(documentDistPath, dicPath, 'README.html'), function (err, textData) {
        if (err) {
            throw err;
        }
        var text = textData.toString();
        res.send(text);
    });

});

module.exports = router;
