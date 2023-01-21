import * as vscode from "vscode";
import { SvgHunterProvider } from "./provider.js";

export function activate(context: vscode.ExtensionContext) {
  const provider = new SvgHunterProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.commands.registerCommand("svg-hunter.insertSvgHtml", () => {
      provider.insertSvgHtml();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("svg-hunter.insertRawJsxSvg", () => {
      provider.insertRawJsxSvg();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("svg-hunter.createJsxSvgComponent", () => {
      provider.createJsxSvgComponent();
    })
  );
}
