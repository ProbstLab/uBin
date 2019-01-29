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
var Sample_1 = require("./Sample");
var Taxonomy = /** @class */ (function () {
    function Taxonomy() {
    }
    Taxonomy_1 = Taxonomy;
    var Taxonomy_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Taxonomy.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({
            type: 'tinyint',
            default: 0
        }),
        __metadata("design:type", Number)
    ], Taxonomy.prototype, "order", void 0);
    __decorate([
        typeorm_1.Column({
            type: 'varchar',
            length: 100,
        }),
        __metadata("design:type", String)
    ], Taxonomy.prototype, "name", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Sample_1.Sample; }, function (sample) { return sample.taxonomy; }),
        typeorm_1.JoinTable(),
        __metadata("design:type", Array)
    ], Taxonomy.prototype, "samples", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Taxonomy_1; }, function (taxonomy) { return taxonomy.parent; }),
        typeorm_1.JoinTable(),
        __metadata("design:type", Taxonomy)
    ], Taxonomy.prototype, "parent", void 0);
    Taxonomy = Taxonomy_1 = __decorate([
        typeorm_1.Entity(),
        typeorm_1.Unique(['order', 'id'])
    ], Taxonomy);
    return Taxonomy;
}());
exports.Taxonomy = Taxonomy;
//# sourceMappingURL=Taxonomy.js.map