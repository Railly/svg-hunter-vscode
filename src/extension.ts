import * as vscode from "vscode";
import { SvgHunterProvider } from "./provider.js";

export function activate(context: vscode.ExtensionContext) {
  const provider = new SvgHunterProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.commands.registerCommand("svg-hunter.openView", () => {
      provider.openView();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("svg-hunter.openViewWithQuickPick", () => {
      const quickPick = vscode.window.createQuickPick();
      quickPick.items = [
        {
          label: "Open SVG Hunter",
          description: "Open SVG Hunter",
        },
      ];
      quickPick.onDidChangeSelection((selection) => {
        if (selection[0].label === "Open SVG Hunter") {
          provider.openView();
        }
      });
      quickPick.show();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("svg-hunter.searchIcon", () => {
      provider.searchIcon();
    })
  );
}
