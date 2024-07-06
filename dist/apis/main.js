/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apis/src/app.controller.ts":
/*!************************************!*\
  !*** ./apis/src/app.controller.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apis/src/app.service.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async getHello() {
        return this.appService.getHello();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], AppController.prototype, "getHello", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),

/***/ "./apis/src/app.module.ts":
/*!********************************!*\
  !*** ./apis/src/app.module.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const admin = __webpack_require__(/*! firebase-admin */ "firebase-admin");
const fs_1 = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const utils_service_1 = __webpack_require__(/*! common/utils/utils.service */ "./common/utils/utils.service.ts");
const email_service_1 = __webpack_require__(/*! common/email/email.service */ "./common/email/email.service.ts");
const s3_service_1 = __webpack_require__(/*! common/utils/s3.service */ "./common/utils/s3.service.ts");
const mongoose_module_1 = __webpack_require__(/*! common/dbconfig/mongoose.module */ "./common/dbconfig/mongoose.module.ts");
const response_service_1 = __webpack_require__(/*! common/services/response.service */ "./common/services/response.service.ts");
const language_module_1 = __webpack_require__(/*! common/language/language.module */ "./common/language/language.module.ts");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./apis/src/app.controller.ts");
const auth_modules_1 = __webpack_require__(/*! ./auth/auth.modules */ "./apis/src/auth/auth.modules.ts");
const user_module_1 = __webpack_require__(/*! ./user/user.module */ "./apis/src/user/user.module.ts");
const user_service_1 = __webpack_require__(/*! ./user/user.service */ "./apis/src/user/user.service.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apis/src/app.service.ts");
const stripe_service_1 = __webpack_require__(/*! common/stripe.service */ "./common/stripe.service.ts");
const auth_service_1 = __webpack_require__(/*! ./auth/auth.service */ "./apis/src/auth/auth.service.ts");
const country_schema_1 = __webpack_require__(/*! common/schemas/country.schema */ "./common/schemas/country.schema.ts");
const city_schema_1 = __webpack_require__(/*! common/schemas/city.schema */ "./common/schemas/city.schema.ts");
const resources_module_1 = __webpack_require__(/*! ./resources/resources.module */ "./apis/src/resources/resources.module.ts");
let AppModule = class AppModule {
    onModuleInit() {
        if (admin.apps.length === 0) {
            const serviceAccountPath = path.resolve('./common/fcmAccountKey.json');
            const serviceAccount = JSON.parse((0, fs_1.readFileSync)(serviceAccountPath, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase initialized in AppModule');
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '60s' },
            }),
            language_module_1.LanguageModule,
            mongoose_module_1.MongooseDbModule,
            mongoose_1.MongooseModule.forFeature([
                { name: 'Country', schema: country_schema_1.CountrySchema },
                { name: 'City', schema: city_schema_1.CitySchema },
            ]),
            auth_modules_1.AuthModule,
            user_module_1.UserModule,
            resources_module_1.ResourcesModule,
        ],
        controllers: [
            app_controller_1.AppController,
        ],
        providers: [
            config_1.ConfigService,
            auth_service_1.AuthService,
            app_service_1.AppService,
            utils_service_1.UtilityService,
            response_service_1.ResponseService,
            s3_service_1.S3Service,
            user_service_1.UserService,
            email_service_1.EmailService,
            stripe_service_1.StripeService,
        ],
    })
], AppModule);


/***/ }),

/***/ "./apis/src/app.service.ts":
/*!*********************************!*\
  !*** ./apis/src/app.service.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const nestjs_i18n_1 = __webpack_require__(/*! nestjs-i18n */ "nestjs-i18n");
let AppService = class AppService {
    constructor(i18n) {
        this.i18n = i18n;
        this.utcDateTime = (date = new Date()) => {
            date = new Date(date);
            return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
        };
    }
    getHello() {
        return 'Oyraa Server Running!';
    }
    getPlatform(headers) {
        return headers['os'];
    }
    getApiVersion(headers) {
        return headers['version'];
    }
    async getLanguage(headers) {
        return headers['language'];
    }
    getAuthToken(headers) {
        return headers['authorization'];
    }
    formatToken(token) {
        if (token.startsWith('Bearer ')) {
            return token.substring(7);
        }
        return token;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof nestjs_i18n_1.I18nService !== "undefined" && nestjs_i18n_1.I18nService) === "function" ? _a : Object])
], AppService);


/***/ }),

/***/ "./apis/src/auth/auth.controller.ts":
/*!******************************************!*\
  !*** ./apis/src/auth/auth.controller.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./apis/src/auth/auth.service.ts");
const app_service_1 = __webpack_require__(/*! ../app.service */ "./apis/src/app.service.ts");
const customHeaders_decorator_1 = __webpack_require__(/*! common/decorators/customHeaders.decorator */ "./common/decorators/customHeaders.decorator.ts");
const global_validation_pipe_1 = __webpack_require__(/*! ../../../common/global-validation.pipe */ "./common/global-validation.pipe.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const response_service_1 = __webpack_require__(/*! common/services/response.service */ "./common/services/response.service.ts");
let AuthController = class AuthController {
    constructor(authService, appService, responseService) {
        this.authService = authService;
        this.appService = appService;
        this.responseService = responseService;
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)("Auth"),
    (0, customHeaders_decorator_1.CustomHeaders)(),
    (0, common_1.UsePipes)(global_validation_pipe_1.GlobalI18nValidationPipe),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _b : Object, typeof (_c = typeof response_service_1.ResponseService !== "undefined" && response_service_1.ResponseService) === "function" ? _c : Object])
], AuthController);


/***/ }),

/***/ "./apis/src/auth/auth.modules.ts":
/*!***************************************!*\
  !*** ./apis/src/auth/auth.modules.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./apis/src/auth/auth.service.ts");
const auth_controller_1 = __webpack_require__(/*! ./auth.controller */ "./apis/src/auth/auth.controller.ts");
const response_service_1 = __webpack_require__(/*! common/services/response.service */ "./common/services/response.service.ts");
const app_service_1 = __webpack_require__(/*! ../app.service */ "./apis/src/app.service.ts");
const utils_service_1 = __webpack_require__(/*! common/utils/utils.service */ "./common/utils/utils.service.ts");
const s3_service_1 = __webpack_require__(/*! common/utils/s3.service */ "./common/utils/s3.service.ts");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const stripe_service_1 = __webpack_require__(/*! common/stripe.service */ "./common/stripe.service.ts");
const email_service_1 = __webpack_require__(/*! common/email/email.service */ "./common/email/email.service.ts");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({}),
            mongoose_1.MongooseModule.forFeature([]),
        ],
        controllers: [
            auth_controller_1.AuthController
        ],
        providers: [
            app_service_1.AppService,
            auth_service_1.AuthService,
            response_service_1.ResponseService,
            utils_service_1.UtilityService,
            s3_service_1.S3Service,
            email_service_1.EmailService,
            stripe_service_1.StripeService
        ],
    })
], AuthModule);


/***/ }),

/***/ "./apis/src/auth/auth.service.ts":
/*!***************************************!*\
  !*** ./apis/src/auth/auth.service.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const nestjs_i18n_1 = __webpack_require__(/*! nestjs-i18n */ "nestjs-i18n");
const email_service_1 = __webpack_require__(/*! common/email/email.service */ "./common/email/email.service.ts");
let AuthService = class AuthService {
    constructor(i18n, emailService) {
        this.i18n = i18n;
        this.emailService = emailService;
    }
    async Login() {
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof nestjs_i18n_1.I18nService !== "undefined" && nestjs_i18n_1.I18nService) === "function" ? _a : Object, typeof (_b = typeof email_service_1.EmailService !== "undefined" && email_service_1.EmailService) === "function" ? _b : Object])
], AuthService);


/***/ }),

/***/ "./apis/src/resources/resources.controller.ts":
/*!****************************************************!*\
  !*** ./apis/src/resources/resources.controller.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourcesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const express_1 = __webpack_require__(/*! express */ "express");
const customHeaders_decorator_1 = __webpack_require__(/*! common/decorators/customHeaders.decorator */ "./common/decorators/customHeaders.decorator.ts");
const global_validation_pipe_1 = __webpack_require__(/*! ../../../common/global-validation.pipe */ "./common/global-validation.pipe.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const response_service_1 = __webpack_require__(/*! common/services/response.service */ "./common/services/response.service.ts");
const resources_service_1 = __webpack_require__(/*! ./resources.service */ "./apis/src/resources/resources.service.ts");
const app_service_1 = __webpack_require__(/*! ../app.service */ "./apis/src/app.service.ts");
const user_schema_1 = __webpack_require__(/*! common/schemas/user.schema */ "./common/schemas/user.schema.ts");
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const mongoose_2 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const auth_guard_1 = __webpack_require__(/*! common/guards/auth-guard */ "./common/guards/auth-guard.ts");
let ResourcesController = class ResourcesController {
    constructor(userService, responseService, appService, userModel) {
        this.userService = userService;
        this.responseService = responseService;
        this.appService = appService;
        this.userModel = userModel;
    }
    async getCountry(res, req) {
        const language = await this.appService.getLanguage(req.headers);
        const data = await this.userService.countryFind(language);
        if (data.success) {
            this.responseService.sendSuccessResponse(res, data.info.country, data.message);
        }
        else {
            this.responseService.sendBadRequest(res, data.message);
        }
    }
    async getCity(res, req) {
        const countryId = req.params.countryId;
        const language = await this.appService.getLanguage(req.headers);
        const data = await this.userService.cityFind(language, countryId);
        if (data.success) {
            this.responseService.sendSuccessResponse(res, data.info.city, data.message);
        }
        else {
            this.responseService.sendBadRequest(res, data.message);
        }
    }
};
exports.ResourcesController = ResourcesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Country Details' }),
    (0, common_1.Get)('/getCountry'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _e : Object, typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], ResourcesController.prototype, "getCountry", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'City Details' }),
    (0, swagger_1.ApiParam)({ name: 'countryId', type: 'string', required: true, description: 'country id', example: '66289a7de7e43d3a52c16e4e' }),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Get)('/getCity/:countryId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _h : Object, typeof (_j = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _j : Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], ResourcesController.prototype, "getCity", null);
exports.ResourcesController = ResourcesController = __decorate([
    (0, swagger_1.ApiTags)("Resources"),
    (0, customHeaders_decorator_1.CustomHeaders)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UsePipes)(global_validation_pipe_1.GlobalI18nValidationPipe),
    (0, common_1.Controller)('resources'),
    __param(3, (0, mongoose_2.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof resources_service_1.ResourcesService !== "undefined" && resources_service_1.ResourcesService) === "function" ? _a : Object, typeof (_b = typeof response_service_1.ResponseService !== "undefined" && response_service_1.ResponseService) === "function" ? _b : Object, typeof (_c = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _c : Object, typeof (_d = typeof mongoose_1.Model !== "undefined" && mongoose_1.Model) === "function" ? _d : Object])
], ResourcesController);


/***/ }),

/***/ "./apis/src/resources/resources.module.ts":
/*!************************************************!*\
  !*** ./apis/src/resources/resources.module.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourcesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const resources_controller_1 = __webpack_require__(/*! ./resources.controller */ "./apis/src/resources/resources.controller.ts");
const resources_service_1 = __webpack_require__(/*! ./resources.service */ "./apis/src/resources/resources.service.ts");
const country_schema_1 = __webpack_require__(/*! common/schemas/country.schema */ "./common/schemas/country.schema.ts");
const city_schema_1 = __webpack_require__(/*! common/schemas/city.schema */ "./common/schemas/city.schema.ts");
const user_schema_1 = __webpack_require__(/*! common/schemas/user.schema */ "./common/schemas/user.schema.ts");
const response_service_1 = __webpack_require__(/*! common/services/response.service */ "./common/services/response.service.ts");
const app_service_1 = __webpack_require__(/*! ../app.service */ "./apis/src/app.service.ts");
const utils_service_1 = __webpack_require__(/*! common/utils/utils.service */ "./common/utils/utils.service.ts");
let ResourcesModule = class ResourcesModule {
};
exports.ResourcesModule = ResourcesModule;
exports.ResourcesModule = ResourcesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'Country', schema: country_schema_1.CountrySchema },
                { name: 'City', schema: city_schema_1.CitySchema },
                { name: 'User', schema: user_schema_1.UserSchema },
            ]),
        ],
        controllers: [resources_controller_1.ResourcesController],
        providers: [resources_service_1.ResourcesService, response_service_1.ResponseService, app_service_1.AppService, utils_service_1.UtilityService]
    })
], ResourcesModule);


/***/ }),

/***/ "./apis/src/resources/resources.service.ts":
/*!*************************************************!*\
  !*** ./apis/src/resources/resources.service.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourcesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const country_schema_1 = __webpack_require__(/*! common/schemas/country.schema */ "./common/schemas/country.schema.ts");
const city_schema_1 = __webpack_require__(/*! common/schemas/city.schema */ "./common/schemas/city.schema.ts");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let ResourcesService = class ResourcesService {
    constructor(countryModel, cityModel) {
        this.countryModel = countryModel;
        this.cityModel = cityModel;
    }
    async countryFind(req) {
        try {
            var getCountry = await this.countryModel.find({});
            console.log(req);
            const data = getCountry.map(country => ({
                _id: country._id,
                name: country.name[req]
            }));
            return {
                success: true,
                info: {
                    country: data,
                },
                message: "Country Lists Fetch succesfully"
            };
        }
        catch (error) {
            console.error(error);
        }
    }
    async cityFind(req, countryid) {
        try {
            const countryId = new mongoose_2.Types.ObjectId(countryid);
            var getCity = await this.cityModel.find({ countryId: countryId });
            const data = getCity.map(city => ({
                _id: city._id,
                countryId: city.countryId,
                name: city.name[req]
            }));
            return {
                success: true,
                info: {
                    city: data,
                },
                message: "City List Fetch succesfully"
            };
        }
        catch (error) {
            console.log(error);
        }
    }
};
exports.ResourcesService = ResourcesService;
exports.ResourcesService = ResourcesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(country_schema_1.Country.name)),
    __param(1, (0, mongoose_1.InjectModel)(city_schema_1.City.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _b : Object])
], ResourcesService);


/***/ }),

/***/ "./apis/src/user/user.controller.ts":
/*!******************************************!*\
  !*** ./apis/src/user/user.controller.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const express_1 = __webpack_require__(/*! express */ "express");
const user_service_1 = __webpack_require__(/*! ./user.service */ "./apis/src/user/user.service.ts");
const customHeaders_decorator_1 = __webpack_require__(/*! common/decorators/customHeaders.decorator */ "./common/decorators/customHeaders.decorator.ts");
const global_validation_pipe_1 = __webpack_require__(/*! ../../../common/global-validation.pipe */ "./common/global-validation.pipe.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const response_service_1 = __webpack_require__(/*! common/services/response.service */ "./common/services/response.service.ts");
const utils_service_1 = __webpack_require__(/*! common/utils/utils.service */ "./common/utils/utils.service.ts");
const user_dto_1 = __webpack_require__(/*! ./user.dto */ "./apis/src/user/user.dto.ts");
const app_service_1 = __webpack_require__(/*! ../app.service */ "./apis/src/app.service.ts");
let UserController = class UserController {
    constructor(userService, responseService, appService, utilService) {
        this.userService = userService;
        this.responseService = responseService;
        this.appService = appService;
        this.utilService = utilService;
    }
    async Login(loginBody, res, req) {
        try {
            const xyz = this.utilService.generateLoginToken('5aa7d2bb27afb022fa06a1b6');
            console.log(xyz);
        }
        catch (error) {
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Country Details' }),
    (0, common_1.Post)('/Login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof user_dto_1.LogInDto !== "undefined" && user_dto_1.LogInDto) === "function" ? _e : Object, typeof (_f = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _f : Object, typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], UserController.prototype, "Login", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)("Auth"),
    (0, customHeaders_decorator_1.CustomHeaders)(),
    (0, common_1.UsePipes)(global_validation_pipe_1.GlobalI18nValidationPipe),
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object, typeof (_b = typeof response_service_1.ResponseService !== "undefined" && response_service_1.ResponseService) === "function" ? _b : Object, typeof (_c = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _c : Object, typeof (_d = typeof utils_service_1.UtilityService !== "undefined" && utils_service_1.UtilityService) === "function" ? _d : Object])
], UserController);


/***/ }),

/***/ "./apis/src/user/user.dto.ts":
/*!***********************************!*\
  !*** ./apis/src/user/user.dto.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogInDto = void 0;
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class LogInDto {
}
exports.LogInDto = LogInDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'abc@yopmail.com',
    }),
    __metadata("design:type", String)
], LogInDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    (0, swagger_1.ApiProperty)({
        example: '12345678',
        required: true
    }),
    __metadata("design:type", String)
], LogInDto.prototype, "password", void 0);


/***/ }),

/***/ "./apis/src/user/user.module.ts":
/*!**************************************!*\
  !*** ./apis/src/user/user.module.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const user_service_1 = __webpack_require__(/*! ./user.service */ "./apis/src/user/user.service.ts");
const user_controller_1 = __webpack_require__(/*! ./user.controller */ "./apis/src/user/user.controller.ts");
const response_service_1 = __webpack_require__(/*! common/services/response.service */ "./common/services/response.service.ts");
const country_schema_1 = __webpack_require__(/*! common/schemas/country.schema */ "./common/schemas/country.schema.ts");
const city_schema_1 = __webpack_require__(/*! common/schemas/city.schema */ "./common/schemas/city.schema.ts");
const app_service_1 = __webpack_require__(/*! ../app.service */ "./apis/src/app.service.ts");
const utils_service_1 = __webpack_require__(/*! common/utils/utils.service */ "./common/utils/utils.service.ts");
const s3_service_1 = __webpack_require__(/*! common/utils/s3.service */ "./common/utils/s3.service.ts");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'Country', schema: country_schema_1.CountrySchema },
                { name: 'City', schema: city_schema_1.CitySchema },
            ]),
        ],
        controllers: [
            user_controller_1.UserController
        ],
        providers: [
            app_service_1.AppService,
            user_service_1.UserService,
            response_service_1.ResponseService,
            utils_service_1.UtilityService,
            s3_service_1.S3Service
        ],
    })
], UserModule);


/***/ }),

/***/ "./apis/src/user/user.service.ts":
/*!***************************************!*\
  !*** ./apis/src/user/user.service.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const country_schema_1 = __webpack_require__(/*! common/schemas/country.schema */ "./common/schemas/country.schema.ts");
const city_schema_1 = __webpack_require__(/*! common/schemas/city.schema */ "./common/schemas/city.schema.ts");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const nestjs_i18n_1 = __webpack_require__(/*! nestjs-i18n */ "nestjs-i18n");
const utils_service_1 = __webpack_require__(/*! common/utils/utils.service */ "./common/utils/utils.service.ts");
let UserService = class UserService {
    constructor(countryModel, cityModel, i18n, utilityService) {
        this.countryModel = countryModel;
        this.cityModel = cityModel;
        this.i18n = i18n;
        this.utilityService = utilityService;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(country_schema_1.Country.name)),
    __param(1, (0, mongoose_1.InjectModel)(city_schema_1.City.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _b : Object, typeof (_c = typeof nestjs_i18n_1.I18nService !== "undefined" && nestjs_i18n_1.I18nService) === "function" ? _c : Object, typeof (_d = typeof utils_service_1.UtilityService !== "undefined" && utils_service_1.UtilityService) === "function" ? _d : Object])
], UserService);


/***/ }),

/***/ "./common/dbconfig/mongoose.module.ts":
/*!********************************************!*\
  !*** ./common/dbconfig/mongoose.module.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MongooseDbModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let MongooseDbModule = class MongooseDbModule {
};
exports.MongooseDbModule = MongooseDbModule;
exports.MongooseDbModule = MongooseDbModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('MONGO_URI'),
                }),
                inject: [config_1.ConfigService],
            }),
        ],
    })
], MongooseDbModule);


/***/ }),

/***/ "./common/decorators/customHeaders.decorator.ts":
/*!******************************************************!*\
  !*** ./common/decorators/customHeaders.decorator.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = exports.IS_PUBLIC_KEY = void 0;
exports.CustomHeaders = CustomHeaders;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
function CustomHeaders() {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiHeader)({
        name: 'language',
        required: true,
        schema: { type: 'string', default: 'en', enum: ['en', 'jp'] },
    }), (0, swagger_1.ApiHeader)({
        name: 'os',
        required: true,
        schema: { type: 'string', default: 'ios', enum: ['ios', 'android'] },
    }), (0, swagger_1.ApiHeader)({
        name: 'version',
        required: true,
        schema: {
            type: 'string',
            default: '1.0.0',
            pattern: '^\\d+\\.\\d+\\.\\d+$',
        },
    }), (0, swagger_1.ApiHeader)({
        name: 'device_version',
        required: false,
        schema: {
            type: 'string',
            default: '14.0.0',
            pattern: '^\\d+\\.\\d+\\.\\d+$',
        },
    }));
}
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_2.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;


/***/ }),

/***/ "./common/email/email.service.ts":
/*!***************************************!*\
  !*** ./common/email/email.service.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const nodemailer = __webpack_require__(/*! nodemailer */ "nodemailer");
const handlebars = __webpack_require__(/*! handlebars */ "handlebars");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
let EmailService = class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            pool: true,
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            }
        });
    }
    async sendEmail({ to, subject, template, context }) {
        const templatePath = path.join(process.cwd(), '/common/email/templates', `${template}.hbs`);
        const html = await this.renderTemplate(templatePath, context);
        const recipients = Array.isArray(to) ? to : [to];
        const mailOptions = {
            from: process.env.FROM_MAIL,
            to: recipients,
            subject,
            html,
        };
        await this.transporter.sendMail(mailOptions);
    }
    async renderTemplate(templatePath, context) {
        const template = fs.readFileSync(templatePath, 'utf-8');
        const compiledTemplate = handlebars.compile(template);
        return compiledTemplate(context);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);


/***/ }),

/***/ "./common/enums/index.ts":
/*!*******************************!*\
  !*** ./common/enums/index.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NOTIFICATION_TYPE = exports.MESSAGE_TYPE = exports.FileType = exports.OTP_TYPE = exports.DEVICE_TYPE = exports.GENDER = exports.CURRENCY = void 0;
var CURRENCY;
(function (CURRENCY) {
    CURRENCY["USD"] = "USD";
    CURRENCY["JPY"] = "JPY";
    CURRENCY["EUR"] = "EUR";
    CURRENCY["GBP"] = "GBP";
    CURRENCY["CNY"] = "CNY";
    CURRENCY["MXN"] = "MXN";
})(CURRENCY || (exports.CURRENCY = CURRENCY = {}));
;
var GENDER;
(function (GENDER) {
    GENDER["MALE"] = "Male";
    GENDER["FEMALE"] = "Female";
    GENDER["OTHER"] = "Other";
})(GENDER || (exports.GENDER = GENDER = {}));
var DEVICE_TYPE;
(function (DEVICE_TYPE) {
    DEVICE_TYPE["WEB"] = "web";
    DEVICE_TYPE["ANDROID"] = "android";
    DEVICE_TYPE["IOS"] = "ios";
})(DEVICE_TYPE || (exports.DEVICE_TYPE = DEVICE_TYPE = {}));
var OTP_TYPE;
(function (OTP_TYPE) {
    OTP_TYPE["VERIFYEMAIL"] = "VERIFYEMAIL";
    OTP_TYPE["VERIFYPHONE"] = "VERIFYPHONE";
    OTP_TYPE["FORGOTPASSWORD"] = "FORGOTPASSWORD";
})(OTP_TYPE || (exports.OTP_TYPE = OTP_TYPE = {}));
var FileType;
(function (FileType) {
    FileType["IMAGE"] = "IMAGE";
})(FileType || (exports.FileType = FileType = {}));
var MESSAGE_TYPE;
(function (MESSAGE_TYPE) {
    MESSAGE_TYPE["TEXT"] = "text";
    MESSAGE_TYPE["FILE"] = "file";
})(MESSAGE_TYPE || (exports.MESSAGE_TYPE = MESSAGE_TYPE = {}));
var NOTIFICATION_TYPE;
(function (NOTIFICATION_TYPE) {
})(NOTIFICATION_TYPE || (exports.NOTIFICATION_TYPE = NOTIFICATION_TYPE = {}));


/***/ }),

/***/ "./common/global-validation.pipe.ts":
/*!******************************************!*\
  !*** ./common/global-validation.pipe.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GlobalI18nValidationPipe = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const nestjs_i18n_1 = __webpack_require__(/*! nestjs-i18n */ "nestjs-i18n");
let GlobalI18nValidationPipe = class GlobalI18nValidationPipe extends nestjs_i18n_1.I18nValidationPipe {
    constructor(i18nService) {
        super();
        this.i18nService = i18nService;
    }
    async transform(value, metadata) {
        try {
            return await super.transform(value, metadata);
        }
        catch (error) {
            const customErrors = [];
            if (error?.errors && Array.isArray(error.errors)) {
                for (const err of error.errors) {
                    const errorMessage = err.constraints[Object.keys(err.constraints)[0]];
                    customErrors.push(this.i18nService.t(errorMessage));
                }
            }
            else {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: customErrors[0] || this.i18nService.t("validation.validationError")
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.GlobalI18nValidationPipe = GlobalI18nValidationPipe;
exports.GlobalI18nValidationPipe = GlobalI18nValidationPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof nestjs_i18n_1.I18nService !== "undefined" && nestjs_i18n_1.I18nService) === "function" ? _a : Object])
], GlobalI18nValidationPipe);


/***/ }),

/***/ "./common/guards/auth-guard.ts":
/*!*************************************!*\
  !*** ./common/guards/auth-guard.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthGuard = void 0;
const utils_service_1 = __webpack_require__(/*! common/utils/utils.service */ "./common/utils/utils.service.ts");
const user_schema_1 = __webpack_require__(/*! common/schemas/user.schema */ "./common/schemas/user.schema.ts");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
let AuthGuard = class AuthGuard {
    constructor(jwtService, reflector, authModel, utilityService) {
        this.jwtService = jwtService;
        this.reflector = reflector;
        this.authModel = authModel;
        this.utilityService = utilityService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return false;
        }
        const user = this.authModel.findOne({ loginToken: authHeader }).lean();
        try {
            request['user'] = user;
            request['user']['isLogin'] = true;
            return true;
        }
        catch (e) {
            return false;
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _b : Object, typeof (_c = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _c : Object, typeof (_d = typeof utils_service_1.UtilityService !== "undefined" && utils_service_1.UtilityService) === "function" ? _d : Object])
], AuthGuard);
;


/***/ }),

/***/ "./common/language/language.module.ts":
/*!********************************************!*\
  !*** ./common/language/language.module.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LanguageModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const nestjs_i18n_1 = __webpack_require__(/*! nestjs-i18n */ "nestjs-i18n");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let LanguageModule = class LanguageModule {
};
exports.LanguageModule = LanguageModule;
exports.LanguageModule = LanguageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_i18n_1.I18nModule.forRootAsync({
                useFactory: (configService) => ({
                    fallbackLanguage: 'en',
                    loaderOptions: {
                        path: `${process.cwd()}/common/language/i18n`,
                        watch: true,
                    },
                }),
                resolvers: [
                    { use: nestjs_i18n_1.QueryResolver, options: ['lang'] },
                    nestjs_i18n_1.AcceptLanguageResolver,
                    new nestjs_i18n_1.HeaderResolver(['x-lang']),
                ],
                inject: [config_1.ConfigService],
            }),
        ],
    })
], LanguageModule);


/***/ }),

/***/ "./common/schemas/city.schema.ts":
/*!***************************************!*\
  !*** ./common/schemas/city.schema.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CitySchema = exports.City = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const country_schema_1 = __webpack_require__(/*! ./country.schema */ "./common/schemas/country.schema.ts");
let City = class City {
};
exports.City = City;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Country' }),
    __metadata("design:type", typeof (_a = typeof country_schema_1.Country !== "undefined" && country_schema_1.Country) === "function" ? _a : Object)
], City.prototype, "countryId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        en: { type: String, unique: true, required: true },
        jp: { type: String, unique: true, required: true },
        fr: { type: String, unique: true, required: true },
        zh: { type: String, unique: true, required: true },
        pt: { type: String, unique: true, required: true },
        ko: { type: String, unique: true, required: true },
        es: { type: String, unique: true, required: true },
        vi: { type: String, unique: true, required: true },
        tl: { type: String, unique: true, required: true },
        id: { type: String, unique: true, required: true },
        my: { type: String, unique: true, required: true },
    }),
    __metadata("design:type", Object)
], City.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], City.prototype, "isActive", void 0);
exports.City = City = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], City);
exports.CitySchema = mongoose_1.SchemaFactory.createForClass(City);


/***/ }),

/***/ "./common/schemas/country.schema.ts":
/*!******************************************!*\
  !*** ./common/schemas/country.schema.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CountrySchema = exports.Country = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let Country = class Country extends mongoose_2.Document {
};
exports.Country = Country;
__decorate([
    (0, mongoose_1.Prop)({ type: String, unique: true, uppercase: true, required: [true, "can't be blank"] }),
    __metadata("design:type", String)
], Country.prototype, "dialCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, unique: true, uppercase: true, required: [true, "can't be blank"] }),
    __metadata("design:type", String)
], Country.prototype, "isoCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Country.prototype, "flag", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        required: true,
        unique: true,
        index: true,
        default: {
            en: '',
            jp: '',
            fr: '',
            zh: '',
            pt: '',
            ko: '',
            es: '',
            vi: '',
            tl: '',
            id: '',
            my: '',
        },
        validate: {
            validator: function (value) {
                const languages = ['en', 'jp', 'fr', 'zh', 'pt', 'ko', 'es', 'vi', 'tl', 'id', 'my'];
                for (const lang of languages) {
                    if (!value[lang] || value[lang] === '') {
                        return false;
                    }
                }
                return true;
            },
            message: "can't be blank",
        },
    }),
    __metadata("design:type", Object)
], Country.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Country.prototype, "isActive", void 0);
exports.Country = Country = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Country);
exports.CountrySchema = mongoose_1.SchemaFactory.createForClass(Country);


/***/ }),

/***/ "./common/schemas/referralCode.schema.ts":
/*!***********************************************!*\
  !*** ./common/schemas/referralCode.schema.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReferralCodeSchema = exports.ReferralCode = void 0;
const mongoose = __webpack_require__(/*! mongoose */ "mongoose");
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const mongoose_2 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const referralCodeType_schema_1 = __webpack_require__(/*! ./referralCodeType.schema */ "./common/schemas/referralCodeType.schema.ts");
let ReferralCode = class ReferralCode extends mongoose_1.Document {
};
exports.ReferralCode = ReferralCode;
__decorate([
    (0, mongoose_2.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'ReferralCodeType' }),
    __metadata("design:type", typeof (_a = typeof referralCodeType_schema_1.ReferralCodeType !== "undefined" && referralCodeType_schema_1.ReferralCodeType) === "function" ? _a : Object)
], ReferralCode.prototype, "codeType", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: String, required: [true, "can't be blank"] }),
    __metadata("design:type", String)
], ReferralCode.prototype, "name", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: String,
        unique: true,
        uppercase: true,
        required: [true, "can't be blank"],
    }),
    __metadata("design:type", String)
], ReferralCode.prototype, "referralCode", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: String, required: [true, "can't be blank"] }),
    __metadata("design:type", String)
], ReferralCode.prototype, "description", void 0);
__decorate([
    (0, mongoose_2.Prop)([{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"] }]),
    __metadata("design:type", Array)
], ReferralCode.prototype, "assignedSpecificInterpreters", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], ReferralCode.prototype, "isCreditCardShown", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], ReferralCode.prototype, "isCallRateShown", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], ReferralCode.prototype, "isFreeCallApply", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], ReferralCode.prototype, "isReferralAdmin", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: {
            emailAddress: String,
            referralAdminId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
        },
    }),
    __metadata("design:type", Object)
], ReferralCode.prototype, "referralAdminDetails", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: {
            allowedCallLimit: { type: Number, default: 0 },
            assignedFreeCallMinutes: { type: Number, default: 0 },
        }
    }),
    __metadata("design:type", Object)
], ReferralCode.prototype, "freeCallConditions", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: {
            referralDiscountPercentage: { type: Number, default: 0 },
            referralAdminRevenuePercentage: { type: Number, default: 5 },
            oyraaEarningPercentage: { type: Number, default: 35 },
            interpreterEarningPercentage: { type: Number, default: 60 },
        }
    }),
    __metadata("design:type", Object)
], ReferralCode.prototype, "callingPriceCalculation", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], ReferralCode.prototype, "isActive", void 0);
exports.ReferralCode = ReferralCode = __decorate([
    (0, mongoose_2.Schema)({ timestamps: true })
], ReferralCode);
exports.ReferralCodeSchema = mongoose_2.SchemaFactory.createForClass(ReferralCode);


/***/ }),

/***/ "./common/schemas/referralCodeType.schema.ts":
/*!***************************************************!*\
  !*** ./common/schemas/referralCodeType.schema.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReferralCodeTypeSchema = exports.ReferralCodeType = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let ReferralCodeType = class ReferralCodeType extends mongoose_2.Document {
};
exports.ReferralCodeType = ReferralCodeType;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: [true, "can't be blank"] }),
    __metadata("design:type", String)
], ReferralCodeType.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], ReferralCodeType.prototype, "isActive", void 0);
exports.ReferralCodeType = ReferralCodeType = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ReferralCodeType);
exports.ReferralCodeTypeSchema = mongoose_1.SchemaFactory.createForClass(ReferralCodeType);


/***/ }),

/***/ "./common/schemas/user.schema.ts":
/*!***************************************!*\
  !*** ./common/schemas/user.schema.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserSchema = exports.User = void 0;
const mongoose = __webpack_require__(/*! mongoose */ "mongoose");
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const mongoose_2 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const bcrypt = __webpack_require__(/*! bcrypt */ "bcrypt");
const enums_1 = __webpack_require__(/*! common/enums */ "./common/enums/index.ts");
const referralCode_schema_1 = __webpack_require__(/*! ./referralCode.schema */ "./common/schemas/referralCode.schema.ts");
let User = class User extends mongoose_1.Document {
};
exports.User = User;
__decorate([
    (0, mongoose_2.Prop)({ type: String, required: true, maxLength: 80 }),
    __metadata("design:type", typeof (_a = typeof String !== "undefined" && String) === "function" ? _a : Object)
], User.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    }),
    __metadata("design:type", typeof (_b = typeof String !== "undefined" && String) === "function" ? _b : Object)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_2.Prop)({ select: false, minlength: [6, 'Password must be at least 6 characters'] }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_2.Prop)({ enum: enums_1.GENDER, default: 'MALE' }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true }),
    __metadata("design:type", typeof (_e = typeof mongoose !== "undefined" && (_c = mongoose.Schema) !== void 0 && (_d = _c.Types) !== void 0 && _d.ObjectId) === "function" ? _e : Object)
], User.prototype, "countryId", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: String, enum: enums_1.CURRENCY, required: true, default: 'USD' }),
    __metadata("design:type", typeof (_f = typeof String !== "undefined" && String) === "function" ? _f : Object)
], User.prototype, "preferredCurrency", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'ReferralCode' }),
    __metadata("design:type", typeof (_g = typeof referralCode_schema_1.ReferralCode !== "undefined" && referralCode_schema_1.ReferralCode) === "function" ? _g : Object)
], User.prototype, "userReferralCode", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }),
    __metadata("design:type", typeof (_k = typeof mongoose !== "undefined" && (_h = mongoose.Schema) !== void 0 && (_j = _h.Types) !== void 0 && _j.ObjectId) === "function" ? _k : Object)
], User.prototype, "roleId", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: String }),
    __metadata("design:type", typeof (_l = typeof String !== "undefined" && String) === "function" ? _l : Object)
], User.prototype, "userNo", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: String }),
    __metadata("design:type", typeof (_m = typeof String !== "undefined" && String) === "function" ? _m : Object)
], User.prototype, "photo", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: String, enum: ['Email', 'Social'], required: true, default: 'Email' }),
    __metadata("design:type", typeof (_o = typeof String !== "undefined" && String) === "function" ? _o : Object)
], User.prototype, "source", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: {
            type: String,
            id: String,
        },
    }),
    __metadata("design:type", Object)
], User.prototype, "social", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: {
            isOnline: { type: Boolean, default: true },
            isLogin: { type: Boolean, default: false },
            isActive: { type: Boolean, default: true },
            isSelfdelete: { type: Boolean, default: false },
            profileStatus: { type: String, enum: ['Pending', 'Registered', 'Complete'], default: 'Registered' },
            lastConnect: { type: Date },
            isAvailableForCall: { type: Boolean, default: true },
            isPTFlag: { type: Boolean, default: false },
            gdprAccepted: { type: Boolean, default: false },
            isProfessional: { type: String, enum: ['Pending', 'Verified', 'Declined'] },
            isDeleted: { type: Boolean, default: false },
            deleteRequestDate: { type: Date },
        },
    }),
    __metadata("design:type", Object)
], User.prototype, "userStatus", void 0);
__decorate([
    (0, mongoose_2.Prop)([{
            languages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Language' }],
            fee: { type: Number },
            usdFee: { type: Number },
            currency: { type: String, enum: enums_1.CURRENCY, default: 'USD' },
        }]),
    __metadata("design:type", Array)
], User.prototype, "rates", void 0);
__decorate([
    (0, mongoose_2.Prop)([{
            arnToken: { type: String, required: true },
            voipARNToken: { type: String },
            loginToken: { type: String, required: true, index: true },
            verificationToken: { type: String },
            resetToken: { type: String },
        }]),
    __metadata("design:type", Array)
], User.prototype, "userToken", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: {
            email: { type: Boolean, default: false },
            phone: { type: Boolean, default: false },
        }
    }),
    __metadata("design:type", Object)
], User.prototype, "verification", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: Number, required: true, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "registrationSteps", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: String }),
    __metadata("design:type", typeof (_p = typeof String !== "undefined" && String) === "function" ? _p : Object)
], User.prototype, "stripeId", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: {
            id: { type: String },
            legalEntity: {
                verification: {
                    status: { type: String },
                },
            },
            verification: {
                disabledReason: { type: String },
            },
            externalAccounts: {
                data: [{
                        status: { type: String },
                    }],
            },
        }
    }),
    __metadata("design:type", Object)
], User.prototype, "stripe", void 0);
__decorate([
    (0, mongoose_2.Prop)([{
            _id: mongoose.Schema.Types.ObjectId,
            number: String,
            isDefault: { type: Boolean, default: false },
            brand: String,
            name: String,
            cardId: String,
            fingerPrint: String,
            chargeId: String,
            isRefunded: { type: Boolean },
            type: { type: String, enum: ['DUES', 'NORMAL'] },
            isVerified: { type: String, enum: ['PENDING', 'APPROVED', 'INPROGRESS', 'DECLINED'], default: 'INPROGRESS' },
            cardType: { type: String, enum: ['OLD', 'NEW'], default: 'OLD' },
        }]),
    __metadata("design:type", Array)
], User.prototype, "cardData", void 0);
__decorate([
    (0, mongoose_2.Prop)({
        type: Object,
        os: String,
        version: String,
        language: String,
        deviceVersion: String,
        deviceName: String,
        lastConnectedDate: Date,
        timezone: String,
    }),
    __metadata("design:type", Object)
], User.prototype, "deviceInfo", void 0);
__decorate([
    (0, mongoose_2.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "responseRate", void 0);
exports.User = User = __decorate([
    (0, mongoose_2.Schema)({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
], User);
exports.UserSchema = mongoose_2.SchemaFactory.createForClass(User);
exports.UserSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password'))
        return next();
    bcrypt.genSalt(10, (err, salt) => {
        if (err)
            return next(err);
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err)
                return next(err);
            user.password = hash;
            next();
        });
    });
});
exports.UserSchema.methods.comparePassword = async function (password, callback) {
    try {
        const isMatch = await bcrypt.compare(password, this.password);
        callback(null, isMatch);
    }
    catch (err) {
        callback(err, false);
    }
};


/***/ }),

/***/ "./common/services/response.service.ts":
/*!*********************************************!*\
  !*** ./common/services/response.service.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResponseService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let ResponseService = class ResponseService {
    sendSuccessResponse(res, data, message = '') {
        return res.status(200).json({ success: true, data, message });
    }
    sendBadRequest(res, message = 'Internal Server Error') {
        return res.status(200).json({ success: false, message });
    }
    sendUnauthorize(res, message = 'Unauthorize Request') {
        return res.status(401).json({ success: false, message });
    }
    sendForbidden(res, message = 'Internal Server Error') {
        return res.status(403).json({ success: false, message });
    }
    sendNotFount(res, message = '404 Not Found') {
        return res.status(404).json({ success: false, message });
    }
    sendServerError(res, message = 'Internal Server Error') {
        return res.status(500).json({ success: false, message });
    }
};
exports.ResponseService = ResponseService;
exports.ResponseService = ResponseService = __decorate([
    (0, common_1.Injectable)()
], ResponseService);


/***/ }),

/***/ "./common/stripe.service.ts":
/*!**********************************!*\
  !*** ./common/stripe.service.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StripeService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const stripe_1 = __webpack_require__(/*! stripe */ "stripe");
let StripeService = class StripeService {
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StripeService);


/***/ }),

/***/ "./common/utils/s3.service.ts":
/*!************************************!*\
  !*** ./common/utils/s3.service.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.S3Service = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const AWS = __webpack_require__(/*! aws-sdk */ "aws-sdk");
const moment = __webpack_require__(/*! moment */ "moment");
let S3Service = class S3Service {
    constructor() {
        const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
        const region = process.env.AWS_S3_REGION;
        const awsConfig = {
            accessKeyId,
            secretAccessKey,
            region,
            apiVersion: '2006-03-01',
            signatureVersion: 'v4',
            ACL: 'public-read',
        };
        AWS.config.update(awsConfig);
        this.s3 = new AWS.S3({
            sslEnabled: true
        });
    }
    async getSignedUrl(location, extension) {
        const key = `${location}/${this.randomString(10)}.${extension}`;
        return new Promise((resolve, reject) => {
            this.s3.getSignedUrl('putObject', {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: key,
                ACL: 'public-read',
            }, (err, data) => {
                if (err)
                    return reject(err);
                resolve({
                    url: data,
                    preview: `${process.env.AWS_S3_BASE}${key}`,
                    filePath: `${key}`,
                });
            });
        });
    }
    randomString(length = 30, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let randomString = '';
        for (let i = 0; i < length; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return `${moment.utc().unix()}-${randomString}`;
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);


/***/ }),

/***/ "./common/utils/utils.service.ts":
/*!***************************************!*\
  !*** ./common/utils/utils.service.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UtilityService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");
const bcrypt = __webpack_require__(/*! bcrypt */ "bcrypt");
const crypto = __webpack_require__(/*! crypto */ "crypto");
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
let UtilityService = class UtilityService {
    constructor() { }
    getAuthToken(headers) {
        return headers['authorization'];
    }
    getPlatform(headers) {
        return headers['oyraa-platform'];
    }
    formatToken(token) {
        if (token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }
    signToken(userId, platform, authTokenIssuedAt) {
        const payload = {
            sub: userId,
            iat: authTokenIssuedAt,
            aud: platform,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        return token;
    }
    validTillTime() {
        return 15 * 60;
    }
    async comparePassword(oldPassword, password) {
        return await bcrypt.compare(oldPassword, password);
    }
    getSlug(str, count) {
        str = str.toLowerCase();
        str = str.replace(/[^a-zA-Z0-9]+/g, '-');
        if (count)
            return str + "-" + count;
        return str;
    }
    ;
    arrayToObject(array) {
        return array.map(items => {
            return new mongoose_1.Types.ObjectId(items);
        });
    }
    ;
    randomString(len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < len; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }
    encrypt(text) {
        const cipher = crypto.createCipher('aes-256-cbc', 'your-encryption-key');
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    generateLoginToken(userId) {
        return this.encrypt(userId + this.randomString(5));
    }
};
exports.UtilityService = UtilityService;
exports.UtilityService = UtilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UtilityService);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/mongoose":
/*!***********************************!*\
  !*** external "@nestjs/mongoose" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "firebase-admin":
/*!*********************************!*\
  !*** external "firebase-admin" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("firebase-admin");

/***/ }),

/***/ "handlebars":
/*!*****************************!*\
  !*** external "handlebars" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("handlebars");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("moment");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "nestjs-i18n":
/*!******************************!*\
  !*** external "nestjs-i18n" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("nestjs-i18n");

/***/ }),

/***/ "nodemailer":
/*!*****************************!*\
  !*** external "nodemailer" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("nodemailer");

/***/ }),

/***/ "stripe":
/*!*************************!*\
  !*** external "stripe" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stripe");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**************************!*\
  !*** ./apis/src/main.ts ***!
  \**************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apis/src/app.module.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const dotenv = __webpack_require__(/*! dotenv */ "dotenv");
const mongoose = __webpack_require__(/*! mongoose */ "mongoose");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const fs = __webpack_require__(/*! fs */ "fs");
const path_1 = __webpack_require__(/*! path */ "path");
async function bootstrap() {
    dotenv.config({ path: '.env.apis' });
    const httpsOptions = process.env.SERVER_MODE === 'https' ? {
        key: fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8'),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8'),
        ca: fs.readFileSync(process.env.SSL_CA_PATH, 'utf8'),
    } : null;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { httpsOptions });
    process.env.NODE_ENV === 'development' && mongoose.set('debug', true);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Oyraa Apis')
        .setDescription('OyraaApis')
        .addServer(process.env.API_SERVER, 'Local development server')
        .addServer(process.env.API_STAGING_SERVER, 'Staging development server')
        .setVersion('4.3')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {});
    app.enableCors();
    app.useStaticAssets((0, path_1.join)(__dirname, 'public'));
    app.setBaseViewsDir((0, path_1.join)(__dirname, 'views'));
    app.setViewEngine('hbs');
    app.useGlobalPipes(new common_1.ValidationPipe());
    await app.listen(+process.env.PORT);
}
bootstrap();

})();

/******/ })()
;