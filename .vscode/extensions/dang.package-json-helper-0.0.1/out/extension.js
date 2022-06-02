"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
function activate(context) {
    require('./definitionProvider')(context);
    require('./descHelper')(context);
    // let helper = new DescHelper(context);
    // const showHover = vscode.workspace.getConfiguration().get('vscodePluginDemo.showHover');
    // if (window.activeTextEditor) {
    //   helper.updateAction(window.activeTextEditor);
    // }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map