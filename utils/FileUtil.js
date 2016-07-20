var fs = require('fs');
var path = require('path');

var documentPath = path.normalize(__dirname + '/../documents');

function getDiretoryTree(dir, done) {
    var results = [];

    fs.readdir(dir, function (err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending)
            return done(null, {name: path.basename(dir), type: 'folder', children: results});

        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    getDiretoryTree(file, function (err, res) {
                        results.unshift({
                            name: path.basename(file),
                            type: 'folder',
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
}

module.exports = {
    getDiretoryTree: getDiretoryTree
};
