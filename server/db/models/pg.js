/**
 * Created by zmenka on 01.11.14.
 */
// get a pg client from the connection pool
var pg = require('pg');
var Q = require('q');
var Config = require('../../config');
var Client = require('pg').Client;

function err_text(err) {
    return err ? err.toString() : ''
}
function PG() {
    var deferred = Q.defer();
    var _this = this;
    pg.connect(Config.postgres, function (err, client, done) {
        if (err) {
            deferred.reject('pg connect ' + err_text(err));
            return;
        }
        _this.client = client;
        _this.done = done;
        client.query('BEGIN', function (err) {
            if (err) {
                deferred.reject('pg begin ' + err_text(err));
                return _this.rollback(client, done);
            }
            deferred.resolve(_this);
        })
    })
    return deferred.promise
        .catch(function (err) {
            throw new Error(err)
        });
}
PG.prototype.rollback = function (client, done) {
    //if there was a problem rolling back the query
    //something is seriously messed up.  Return the error
    //to the done function to close & remove this client from
    //the pool.  If you leave a client in the pool with an unaborted
    //transaction weird, hard to diagnose problems might happen.
    client.query('ROLLBACK', function (err) {
        if (err) {
            console.log('pg rollback ', err_text(err))
        }
        return done(err);
    });
};

PG.prototype.transact = function (query, params, endTransaction, logTime) {
    var _this = this;
    var date = new Date()
    var deferred = Q.defer();
    endTransaction = endTransaction || false;
    logTime = logTime || false;
    process.nextTick(function () {
        _this.client.query(query, params, function (err, result) {
            if (err) {
                _this.rollback(_this.client, _this.done);
                deferred.reject('pg transact ' + err_text(err) + ' in query: ' + query.replace(/\s+/g, " "));
                return;
            }

            if (endTransaction) {
                //disconnect after successful commit
                _this.client.query('COMMIT', function (err, res) {
                    _this.done(err);
                    if (logTime) {
                        console.log(-date.getTime() + (new Date().getTime()))
                    }
                    deferred.resolve(result);
                });
            } else {
                //console.log(-date.getTime()+(new Date().getTime()))
                //console.log("call callback");
                deferred.resolve(result);
            }

        });
    })
    return deferred.promise
        .catch(function (err) {
            throw new Error(err)
        });

}

PG.prototype.commit = function (result) {
    var _this = this;

    var deferred = Q.defer();

    process.nextTick(function () {
        _this.client.query('COMMIT', function (err, res) {
            _this.done(err);
            //console.log(-date.getTime() + (new Date().getTime()))
            deferred.resolve(result);
        });
    })
    return deferred.promise
        .catch(function (err) {
            throw new Error(err)
        });
}

PG.query = function (query, params, logTime) {
    logTime = logTime || false;
    var deferred = Q.defer();
    var date = new Date();
    pg.connect(Config.postgres, function (err, client, done) {
        var handleError = function (err1) {
            // no error occurred, continue with the request
            if (!err1) {
                return false;
            }

            // An error occurred, remove the client from the connection pool.
            // A truthy value passed to done will remove the connection from the pool
            // instead of simply returning it to be reused.
            // In this case, if we have successfully received a client (truthy)
            // then it will be removed from the pool.
            done(client);
            deferred.reject('pg query ' + err_text(err1) + ' in query: ' + query.replace(/\s+/g, " "));
            return true;
        };

        if (handleError(err)) {
            return;
        }

        client.query(query, params, function (err, result) {
            if (handleError(err)) {
                return;
            }
            done();
            if (logTime) {
                console.log(-date.getTime() + (new Date().getTime()))
            }
            deferred.resolve(result);
        });
    });
    return deferred.promise
        .catch(function (err) {
            throw new Error(err)
        });
}

module.exports = PG;