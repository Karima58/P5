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
exports.TTFEditorProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const dispose_1 = require("./dispose");
const openType = require("opentype.js");
class TTFEditorProvider {
    constructor(_context) {
        this._context = _context;
    }
    static register(context) {
        return vscode.window.registerCustomEditorProvider("ttf.preview", new TTFEditorProvider(context), {
            supportsMultipleEditorsPerDocument: true,
            webviewOptions: {
                retainContextWhenHidden: true
            }
        });
    }
    openCustomDocument(uri, openContext, token) {
        return TTFDocument.create(uri);
    }
    resolveCustomEditor(document, webviewPanel, token) {
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        let buffer;
        const unicodeName = [];
        let result;
        try {
            buffer = this.nodeBufferToArrayBuffer(document.documentData);
            result = openType.parse(buffer.buffer);
            for (let i = 0; i < result.glyphs.length; i++) {
                const glyph = result.glyphs.get(i);
                if (glyph.unicode) {
                    unicodeName.push(`&#x${glyph.unicode.toString(16)};`);
                }
            }
            console.log(unicodeName);
            console.log(result);
        }
        catch (e) {
            console.error(e);
        }
        const html = this.getHtmlForWebView(webviewPanel.webview, Buffer.from(buffer.buffer).toString('base64'));
        webviewPanel.webview.postMessage({ data: document.documentData, names: unicodeName });
        webviewPanel.webview.html = html;
    }
    getHtmlForWebView(webview, data) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(this._context.extensionPath, 'media', 'load-ttf.js')));
        const cssUri = webview.asWebviewUri(vscode.Uri.file(path.join(this._context.extensionPath, 'media', 'load-ttf.css')));
        const nonce = getNonce();
        return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="font-src 'self' 'unsafe-inline' data:; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src  ${webview.cspSource} 'unsafe-inline';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <script src="${scriptUri}" type='text/javascript'></script>
    </head>
    
    <body>
      <link href="${cssUri}" rel="stylesheet" type="text/css" />
      <div style="display: flex; justify-content: center;">
        <div class="content"></div>
      </div>
      <style>
        @font-face {
          src: url('data:application/octet-stream;base64,${data}');
          font-family: 'iconfont-preview';
        }
      </style>
    </body>
    
    </html>`;
    }
    nodeBufferToArrayBuffer(buffer) {
        var view = new Uint8Array(buffer.length);
        for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        // console.log('raw buffer:', buffer)
        // console.log('final buffer:',view.buffer)
        return view;
    }
}
exports.TTFEditorProvider = TTFEditorProvider;
class TTFDocument extends dispose_1.Disposable {
    // private readonly _delegate: TTFDocumentDelegate;
    constructor(uri, initialContent) {
        super();
        this._uri = uri;
        this._documentData = initialContent;
    }
    static readFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (uri.scheme === 'untitled') {
                return new Uint8Array();
            }
            return vscode.workspace.fs.readFile(uri);
        });
    }
    static create(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileData = yield TTFDocument.readFile(uri);
            console.log(uri, fileData);
            return new TTFDocument(uri, fileData);
        });
    }
    get uri() { return this._uri; }
    get documentData() { return this._documentData; }
}
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=ttfPreview.js.map