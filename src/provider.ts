import * as vscode from "vscode";
import { getNonce, suggestName } from "./utils.js";
import svgPornJsonParsed from "./data/svg-porn-parsed.json" assert { type: "json" };

export class SvgHunterProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "svg-hunter";
  public static readonly viewTitle = "SVG Hunter";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "colorSelected": {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(`#${data.value}`)
          );
          break;
        }
      }
    });
  }

  public addColor() {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
      this._view.webview.postMessage({ type: "addColor" });
    }
  }

  public clearColors() {
    if (this._view) {
      this._view.webview.postMessage({ type: "clearColors" });
    }
  }

  public openView() {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
    } else {
      vscode.window.createWebviewPanel(
        SvgHunterProvider.viewType,
        SvgHunterProvider.viewTitle,
        vscode.ViewColumn.One
      );
    }
  }

  // show an input box to the user to put tha name of the icon to search
  public async searchIcon() {
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = [
      {
        label: "Open SVG Hunter",
        description: "Open SVG Hunter",
      },
    ];
    quickPick.onDidChangeSelection(async (selection) => {
      if (selection[0].label === "Open SVG Hunter") {
        const name = await vscode.window.showInputBox({
          prompt: "Enter the name of the icon to search",
        });

        const suggested = suggestName({
          name: name || "",
          files: svgPornJsonParsed,
        });

        const quickPick = vscode.window.createQuickPick();
        if (typeof suggested !== "string") {
          quickPick.items = suggested
            .map((item) => {
              const label = Object.keys(item)[0];
              return item[label].map((item) => {
                return {
                  label,
                  description: item,
                };
              });
            })
            .flat();
        } else {
          quickPick.items = [
            {
              label: suggested,
              description: suggested,
            },
          ];
        }
        quickPick.onDidChangeSelection((selection) => {
          // only log the selected item
          console.log({ selection });
          console.log(selection[0].description);
        });
        quickPick.show();
      }
    });

    quickPick.show();
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<button class="add-color-button">Add Color</button>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
