"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var ImportRecord_1 = require("./ImportRecord");
var ImportFile = /** @class */ (function () {
    function ImportFile() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], ImportFile.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({
            type: 'varchar',
            length: 256,
            unique: true,
        }),
        __metadata("design:type", String)
    ], ImportFile.prototype, "name", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return ImportRecord_1.ImportRecord; }, function (importRecord) { return importRecord.files; }),
        __metadata("design:type", ImportRecord_1.ImportRecord)
    ], ImportFile.prototype, "importRecord", void 0);
    ImportFile = __decorate([
        typeorm_1.Entity()
    ], ImportFile);
    return ImportFile;
}());
exports.ImportFile = ImportFile;
//# sourceMappingURL=ImportFile.js.map