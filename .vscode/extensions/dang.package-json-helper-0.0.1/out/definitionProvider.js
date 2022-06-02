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
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const packageInfoHelper_1 = require("./packageInfoHelper");
const vscode_1 = require("vscode");
// import { getProjectPath } from './util';
const packageInfo = new packageInfoHelper_1.default();
class MyDefinitionProvider {
    /**
     * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
     * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
     * @param {*} document
     * @param {*} position
     * @param {*} token
     */
    provideDefinition(document, position, token) {
        const goToDefinition = vscode_1.workspace.getConfiguration().get('packageJsonHelper.goToDefinition');
        if (!goToDefinition) {
            return;
        }
        const fileName = document.fileName;
        const workDir = path.dirname(fileName);
        const word = document.getText(document.getWordRangeAtPosition(position));
        // const line = document.lineAt(position);
        // const projectPath = getProjectPath(document);
        // console.log('====== 进入 provideDefinition 方法 ======');
        // console.log('fileName: ' + fileName); // 当前文件完整路径
        // console.log('workDir: ' + workDir); // 当前文件所在目录
        // console.log('word: ' + word); // 当前光标所在单词
        // console.log('line: ' + line.text); // 当前光标所在行
        // console.log('projectPath: ' + projectPath); // 当前工程目录
        if (!/\/package\.json$/.test(fileName)) {
            return;
        }
        const json = document.getText();
        if (!new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
            return;
        }
        let destPath = `${workDir}/node_modules/${word.replace(/"/g, '')}/package.json`;
        if (fs.existsSync(destPath)) {
            // new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
            return new vscode.Location(vscode.Uri.file(destPath), new vscode.Position(0, 0));
        }
    }
}
class MyHoverProvider {
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const showHover = vscode_1.workspace.getConfiguration().get('packageJsonHelper.showHover');
            if (!showHover) {
                return;
            }
            const fileName = document.fileName;
            // const workDir = path.dirname(fileName);
            const word = document.getText(document.getWordRangeAtPosition(position));
            if (!/\/package\.json$/.test(fileName)) {
                return;
            }
            const json = document.getText();
            if (!new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
                return;
            }
            let info = yield packageInfo.getPackageInfo(document, word.replace(/"/g, ''), position.line);
            if (info) {
                return new vscode.Hover(`* **name**：${info.name}\n* **version**：${info.version}\n* **license**：${info.license}\n* **description**：${info.description}`);
            }
        });
    }
}
module.exports = function (context) {
    // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
    context.subscriptions.push(vscode_1.languages.registerDefinitionProvider(['json', 'jsonc'], new MyDefinitionProvider()));
    // 注册鼠标悬停提示
    context.subscriptions.push(vscode.languages.registerHoverProvider(['json', 'jsonc'], new MyHoverProvider()));
};
//# sourceMappingURL=definitionProvider.js.map