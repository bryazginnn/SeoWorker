/**
 * Created by bryazginnn on 22.11.14.
 *
 *
 *  var PgSearch = require("./server/db/postgres/pg_search");
 *  var search = new PgSearch();
 *
 *  //вставить строку в таблицу search
 *  search.insert (
 *      <condition_id>,
 *      <html_id>,
 *      <callback>,
 *      <errback>
 *  )
 *    returns <new search_id>
 *
 *  //получить все строки из search
 *  search.list (<callback>,<errback>)
 *    returns [{search_id , condition_id , ...}, ...]
 *
 *  //получить строку из search с помощью search_id
 *  search.get (<search_id>,<callback>,<errback>)
 *    returns {search_id , condition_id , ...}
 *
 *  //получить строки из search с помощью condition_id
 *  search.find (<condition_id>,<callback>,<errback>)
 *    returns [{search_id , condition_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgSearch() {

};

PgSearch.prototype.insert = function (condition_id, html_id) {

    var date_create = new Date();
    // create a Url
    var db
    return new PG()
        .then(function (db_res) {
            db = db_res
            return db.transact(
                "INSERT INTO search (condition_id, html_id, date_create) VALUES ($1, $2, $3);",
                [condition_id, html_id, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('search','search_id'))",
                [], true)
        })
        .then(function (res) {
            console.log("param saved");
            return res.rows[0].currval;
        })

        .catch(function (err) {
            throw 'PgSearch.prototype.insert ' + err;

        }
    );
}

PgSearch.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM search ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgSearch.prototype.list');
            console.log(err);
            errback(err)
        })
}

PgSearch.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM search WHERE search_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgSearch.prototype.get');
            console.log(err);
            errback(err)
        })
}

PgSearch.prototype.find = function (condition_id, callback, errback) {
    PG.query("SELECT * FROM search WHERE condition_id = $1;",
        [condition_id],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgSearch.prototype.find');
            console.log(err);
            errback(err)
        })
}

PgSearch.prototype.listWithParams = function(condition_id) {
    return PG.query("SELECT * FROM search ORDER BY date_create desc;",
        [condition_id])
        .then(function (res) {
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgSearch.prototype.find' + err;
        })
}

module.exports = PgSearch;