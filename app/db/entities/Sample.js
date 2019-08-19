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
var Taxonomy_1 = require("./Taxonomy");
var Enzyme_1 = require("./Enzyme");
var ImportRecord_1 = require("./ImportRecord");
var Bin_1 = require("./Bin");
var Sample = /** @class */ (function () {
    function Sample() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Sample.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({
            type: 'varchar',
            length: 256
        }),
        __metadata("design:type", String)
    ], Sample.prototype, "scaffold", void 0);
    __decorate([
        typeorm_1.Column('double'),
        __metadata("design:type", Number)
    ], Sample.prototype, "gc", void 0);
    __decorate([
        typeorm_1.Column('integer'),
        __metadata("design:type", Number)
    ], Sample.prototype, "coverage", void 0);
    __decorate([
        typeorm_1.Column('integer'),
        __metadata("design:type", Number)
    ], Sample.prototype, "length", void 0);
    __decorate([
        typeorm_1.Column({
            type: 'varchar',
            length: 100,
            default: '',
        }),
        __metadata("design:type", String)
    ], Sample.prototype, "taxonomiesRelationString", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Taxonomy_1.Taxonomy; }, function (taxonomy) { return taxonomy.samples; }),
        typeorm_1.JoinTable(),
        __metadata("design:type", Taxonomy_1.Taxonomy)
    ], Sample.prototype, "taxonomy", void 0);
    __decorate([
        typeorm_1.ManyToMany(function (type) { return Enzyme_1.Enzyme; }, function (enzyme) { return enzyme.samples; }),
        typeorm_1.JoinTable(),
        __metadata("design:type", Array)
    ], Sample.prototype, "enzymes", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Bin_1.Bin; }, function (bin) { return bin.samples; }),
        typeorm_1.JoinTable(),
        __metadata("design:type", Bin_1.Bin)
    ], Sample.prototype, "bin", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return ImportRecord_1.ImportRecord; }, function (importRecord) { return importRecord.samples; }),
        typeorm_1.JoinTable(),
        __metadata("design:type", ImportRecord_1.ImportRecord)
    ], Sample.prototype, "importRecord", void 0);
    Sample = __decorate([
        typeorm_1.Entity(),
        typeorm_1.Unique(['scaffold', 'importRecord'])
    ], Sample);
    return Sample;
}());
exports.Sample = Sample;
//# sourceMappingURL=Sample.js.map