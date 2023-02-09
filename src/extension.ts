import * as vscode from "vscode";
import { SvgHunterProvider } from "./provider";

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

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "svg-hunter.transformSelectedSvgToJsx",
      () => {
        provider.transformSelectedSvgToJsx();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "svg-hunter.copyJsxSvgComponent",
      (uri: vscode.Uri) => {
        provider.copyJsxSvg(uri, "component");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "svg-hunter.copyPlainJsxSvg",
      (uri: vscode.Uri) => {
        provider.copyJsxSvg(uri, "plain");
      }
    )
  );
}
