"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {Connection} from "typeorm";
var typeorm_1 = require("typeorm");
var DB = /** @class */ (function () {
    function DB() {
    }
    DB.test = function () {
        return "Hello world!";
    };
    DB.connect = function () {
        return typeorm_1.createConnection({
            type: "sqlite",
            database: require('os').homedir() + "/database.sqlite"
        });
    };
    return DB;
}());
exports.DB = DB;
// console.log('db.js __dirname', __dirname);
//# sourceMappingURL=dbApi.js.map