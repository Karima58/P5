"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const shell = require("shelljs");
const fs = require("fs");
class PackageInfoHelper {
    getPackageInfo(document, packageName, line) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileName = (document === null || document === void 0 ? void 0 : document.fileName) || '';
            if (!fileName) {
                return;
            }
            let node_modules = fileName.replace('package.json', 'node_modules');
            if (!this.fsExistsSync(node_modules)) {
                let result = yield this.execCmd(`npm info ${packageName} -json`);
                return this.generateResult(result, line, 1);
            }
            let packageFolder = path.join(node_modules, packageName);
            if (!this.fsExistsSync(packageFolder)) {
                return undefined;
            }
            let jsonFile = path.join(packageFolder, 'package.json');
            if (!this.fsExistsSync(jsonFile)) {
                return undefined;
            }
            let fileContent = fs.readFileSync(jsonFile, 'utf8');
            let data = this.generateResult(fileContent, line);
            return data;
        });
    }
    /**
     *
     * @param fileContent
     * @param line
     * @param from  info source : 0 local node_modules, 1 npm info
     */
    generateResult(fileContent, line, from = 0) {
        try {
            if (!fileContent) {
                return undefined;
            }
            let _a = JSON.parse(fileContent), { version, description, author } = _a, others = __rest(_a, ["version", "description", "author"]);
            if (author && Object.prototype.toString.call(author) === '[object Object]') {
                author = this.getObjValue(author);
            }
            return Object.assign(Object.assign({ desc: 'version:' + version + (from ? '(from network)' : '') + ' @ ' + description, line,
                author }, others), { description,
                version });
        }
        catch (error) {
            return undefined;
        }
    }
    fsExistsSync(path) {
        try {
            fs.accessSync(path);
        }
        catch (error) {
            return false;
        }
        return true;
    }
    getObjValue(obj) {
        let result = '';
        let temp = Object.keys(obj).map(key => {
            return obj[key];
        });
        return temp.join(',');
    }
    execCmd(cmd) {
        return new Promise((resolve, reject) => {
            shell.exec(cmd, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve(stdout);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
}
exports.default = PackageInfoHelper;
//# sourceMappingURL=packageInfoHelper.js.map