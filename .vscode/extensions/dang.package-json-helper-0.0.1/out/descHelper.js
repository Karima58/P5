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
const vscode_1 = require("vscode");
const packageInfoHelper_1 = require("./packageInfoHelper");
const annotationDecoration = vscode_1.window.createTextEditorDecorationType({
    after: {
        margin: '0 3em 0 3em',
        textDecoration: 'none'
    },
    rangeBehavior: vscode_1.DecorationRangeBehavior.ClosedOpen
});
class DescHelper {
    constructor(context) {
        this._currentLine = -1;
        this.package = new packageInfoHelper_1.default();
        this.ctx = context;
        this.initEventListener();
    }
    initEventListener() {
        // * Handle active file changed
        vscode_1.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this._editor = editor;
            }
        }, null, this.ctx.subscriptions);
        // * Handle file contents changed
        vscode_1.workspace.onDidChangeTextDocument(event => {
            // Trigger updates if the text was changed in the same document
            if (this._editor && event.document === this._editor.document) {
                this.updateAction(this._editor);
            }
            else {
            }
        }, null, this.ctx.subscriptions);
        vscode_1.window.onDidChangeTextEditorSelection((event) => {
            this.updateAction(this._editor);
        }, null, this.ctx.subscriptions);
    }
    addDesc(editor) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!editor) {
                return;
            }
            this.clear(editor);
            let active = editor.selection.active;
            let line = editor.document.lineAt(active.line);
            let json = editor.document.getText();
            let matches = line.text.trim().match(/^['"](.*?)['"]:.*?['"](.*?)['"],?$/);
            if (!matches) {
                return;
            }
            let key = matches[1];
            if (!new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${key.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
                return;
            }
            try {
                this._editor = editor;
                this._currentLine = active.line;
                let packageInfo = yield this.package.getPackageInfo((_a = this._editor) === null || _a === void 0 ? void 0 : _a.document, key, this._currentLine);
                if (!packageInfo) {
                    return;
                }
                if (packageInfo.line !== this._currentLine) {
                    return;
                }
                let md = new vscode_1.MarkdownString(`##### [${key}](${packageInfo.homepage})\n`);
                if (packageInfo.desc) {
                    md.appendMarkdown(`##### ${packageInfo.description}\n`);
                }
                if (packageInfo.homepage) {
                    md.appendMarkdown(`#### homepage: ${packageInfo.homepage}\n`);
                }
                if (packageInfo.author) {
                    md.appendMarkdown(`#### author: ${JSON.stringify(packageInfo.author)}\n`);
                }
                let decoration = {
                    renderOptions: {
                        after: {
                            color: new vscode_1.ThemeColor('packagejson.lineForegroundColor'),
                            contentText: packageInfo.desc,
                            fontWeight: 'normal',
                            fontStyle: 'normal',
                            textDecoration: 'none'
                        },
                    },
                    range: new vscode_1.Range(active.line, Number.MAX_SAFE_INTEGER, active.line, Number.MAX_SAFE_INTEGER),
                    hoverMessage: md
                };
                editor.setDecorations(annotationDecoration, [decoration]);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    clear(editor) {
        if (this._editor !== editor && this._editor !== undefined) {
            this.clearAnnotations(this._editor);
        }
        this.clearAnnotations(editor);
        this._editor = undefined;
    }
    clearAnnotations(editor) {
        if (editor === undefined || editor._disposed === true) {
            return;
        }
        editor.setDecorations(annotationDecoration, []);
    }
    updateAction(editor) {
        var _a;
        const showDecoration = vscode_1.workspace.getConfiguration().get('packageJsonHelper.showDecoration');
        if (!showDecoration || !editor) {
            return;
        }
        this._editor = editor;
        const uri = (_a = this === null || this === void 0 ? void 0 : this._editor) === null || _a === void 0 ? void 0 : _a.document.uri;
        if ((uri === null || uri === void 0 ? void 0 : uri.scheme) !== 'file' || !(uri === null || uri === void 0 ? void 0 : uri.path.endsWith('package.json'))) {
            return;
        }
        this.triggerUpdate();
    }
    triggerUpdate() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.addDesc(this._editor);
        }, 200);
    }
}
module.exports = function (context) {
    let helper = new DescHelper(context);
    if (vscode_1.window.activeTextEditor) {
        helper.updateAction(vscode_1.window.activeTextEditor);
    }
};
//# sourceMappingURL=descHelper.js.map