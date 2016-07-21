var fs = require('fs');
var path = require('path');
var PropertiesReader = require('properties-reader');

var documentPath = path.normalize(__dirname + '/../documents');

function getDiretoryTree(dir, done) {
    var results = [];

    fs.readdir(dir, function (err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending) {
            return done(null, {
                name: getName(dir),
                type: 'folder',
                order: path.basename(dir),
                children: results
            });
        }

        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    getDiretoryTree(file, function (err, res) {
                        results.unshift({
                            name: getName(file),
                            type: 'folder',
                            order: path.basename(file),
                            path: path.relative(documentPath, file),
                            children: res
                        });
                        if (!--pending)
                            done(null, results);
                    });
                }
                else {
                    results.unshift({
                        type: 'file',
                        name: path.basename(file)
                    });
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });

    function getName(fileDir) {
        var name = path.basename(fileDir);
        if (name.indexOf('_') > -1) {
            name = name.substr(name.indexOf('_')+1, name.length);
        }

        try{
            var properties = PropertiesReader(path.join(fileDir,'manifest'));
            name = properties.get('name');
        }catch(err){
        }

        return name;
    }
}

module.exports = {
    getDiretoryTree: getDiretoryTree
};
