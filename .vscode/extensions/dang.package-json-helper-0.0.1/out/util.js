"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectPath = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
function getProjectPath(document) {
    var _a, _b;
    if (!document) {
        document = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
    }
    if (!document) {
        return '';
    }
    const currentFile = document.uri.fsPath;
    let projectPath = null;
    let workspaceFolders = (_b = (_a = vscode === null || vscode === void 0 ? void 0 : vscode.workspace) === null || _a === void 0 ? void 0 : _a.workspaceFolders) === null || _b === void 0 ? void 0 : _b.map(item => item.uri.path);
    // 由于存在Multi-root工作区，暂时没有特别好的判断方法，先这样粗暴判断
    // 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
    if (!workspaceFolders) {
        return '';
    }
    if (workspaceFolders.length === 1 && workspaceFolders[0] === vscode.workspace.rootPath) {
        const rootPath = workspaceFolders[0];
        var files = fs.readdirSync(rootPath);
        workspaceFolders = files.filter(name => !/^\./g.test(name)).map(name => path.resolve(rootPath, name));
        // vscode.workspace.rootPath会不准确，且已过时
        // return vscode.workspace.rootPath + '/' + this._getProjectName(vscode, document);
    }
    workspaceFolders.forEach(folder => {
        if (currentFile.indexOf(folder) === 0) {
            projectPath = folder;
        }
    });
    if (!projectPath) {
        return '';
    }
    return projectPath;
}
exports.getProjectPath = getProjectPath;
//# sourceMappingURL=util.js.map