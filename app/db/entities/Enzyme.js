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
var Enzyme = /** @class */ (function () {
    function Enzyme() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Enzyme.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({
            type: 'varchar',
            length: 256,
            unique: true,
        }),
        __metadata("design:type", String)
    ], Enzyme.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column({
            type: 'boolean',
            default: false
        }),
        __metadata("design:type", Boolean)
    ], Enzyme.prototype, "bacterial", void 0);
    __decorate([
        typeorm_1.Column({
            type: 'boolean',
            default: false
        }),
        __metadata("design:type", Boolean)
    ], Enzyme.prototype, "archaeal", void 0);
    __decorate([
        typeorm_1.ManyToMany(function (type) { return Sample_1.Sample; }, function (sample) { return sample.enzymes; }),
        __metadata("design:type", Array)
    ], Enzyme.prototype, "samples", void 0);
    Enzyme = __decorate([
        typeorm_1.Entity()
    ], Enzyme);
    return Enzyme;
}());
exports.Enzyme = Enzyme;
//# sourceMappingURL=Enzyme.js.map