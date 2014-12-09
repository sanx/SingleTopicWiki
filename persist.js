var fs     = require('fs');
var Q      = require('q');

var pWriteFile = Q.denodeify(fs.writeFile.bind(fs));
var pReadFile = Q.denodeify(fs.readFile.bind(fs));

var Persist = function (conf) {
    this.dirname = conf.dirname;
    this.prefix = conf.prefix;
    this.timeToRefresh = conf.timeToRefresh;
    this.data = {}; // set of key-values where values are: {ts: 3947239034, val: "foo bar"}
};

Persist.prototype.getPathForKey = function (key) {
    return this.dirname + '/' + this.prefix + key
};

Persist.prototype.read = function (key) {
    var val,
        entry;
    if (this.data[key] !== undefined) {
        console.log("cached entry: " + JSON.stringify(this.data[key]));
        entry = this.data[key];
        val = Q.fcall(function () {
            return entry.val
        });
        if (entry.ts + this.timeToRefresh < Date.now()) {
            // if key is old, we refresh from disk / persist it
            val = this.__readFromFileSystemPersistInMemory(key);
        }
    } else {
        val = this.__readFromFileSystemPersistInMemory(key);
    }
    console.log("gonna return: " + JSON.stringify(val));
    return val;
};

Persist.prototype.__readFromFileSystemPersistInMemory = function (key) {
    return this.__readFromFilesystem(key)
        .then(function (res) {
            console.log("read this: " + res);
            this.__persistInMemory(key, res);
            return res;
        }.bind(this))
        .fail(function (reason) {
            console.error("failed to read from disk. reason: " + reason);
            // failed to load from disk. most likely the key doesn't exist yet.
            throw Exception("key not found");
        });
}

Persist.prototype.write = function (key, val) {
    this.__persistInMemory(key, val);
    return this.__persistInFilesystem(key, val);
};

Persist.prototype.__persistInMemory = function (key, val) {
    this.data[key] = {
        ts: Date.now(),
        val: val
    }
    return true;
};

Persist.prototype.__persistInFilesystem = function (key, val) {
    return pWriteFile(this.getPathForKey(key), val);
};

Persist.prototype.__readFromFilesystem = function (key) {
    return pReadFile(this.getPathForKey(key), {encoding: 'utf8'});
};


module.exports = Persist;
