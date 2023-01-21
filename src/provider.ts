import * as vscode from "vscode";
import { parsedSvgPorn } from "./data/svg-porn-parsed";
import {
  addNewLineAfterSemi,
  deleteFirstAndLastLine,
  deletePropsWithCurlyBrackets,
  getNonce,
  getPascalCasedName,
  suggestName,
} from "./utils";
import axios from "axios";
import { transform } from "@svgr/core";

export class SvgHunterProvider {
  public static readonly viewType = "svg-hunter";
  public static readonly viewTitle = "SVG Hunter";

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public async handleWithProvider(callback: (selection: any) => void) {
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = "Select a provider";

    quickPick.items = [
      {
        label: "SVG Porn",
        description: "Tech logos",
      },
    ];
    quickPick.onDidChangeSelection(async (selection) => {
      if (selection[0].label === "SVG Porn") {
        const name = await vscode.window.showInputBox({
          prompt: "Enter the name of the icon",
        });

        const suggested = suggestName({
          name: name || "",
          files: parsedSvgPorn,
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
        quickPick.onDidChangeSelection(callback);
        quickPick.show();
      }
    });

    quickPick.show();
  }

  public async insertSvgHtml() {
    this.handleWithProvider((selection) => {
      if (!selection[0].description) {
        return;
      }
      const svgRes = this.getSvgPornSvg(selection[0].description);
      svgRes.then((svgCode) => {
        vscode.window.activeTextEditor?.insertSnippet(
          new vscode.SnippetString(svgCode)
        );
      });
    });
  }

  public async insertRawJsxSvg() {
    this.handleWithProvider((selection) => {
      if (!selection[0].description) {
        return;
      }
      const svgRes = this.getSvgPornSvg(selection[0].description);
      const pascalCasedName = getPascalCasedName(selection[0].description);
      svgRes.then((svgCode) => {
        transform(
          svgCode,
          {
            icon: true,
            plugins: [
              "@svgr/plugin-svgo",
              "@svgr/plugin-jsx",
              "@svgr/plugin-prettier",
            ],
          },
          { componentName: `${pascalCasedName}Icon` }
        ).then((jsCode) => {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(
              deleteFirstAndLastLine(deletePropsWithCurlyBrackets(jsCode))
            )
          );
        });
      });
    });
  }

  public async createJsxSvgComponent() {
    this.handleWithProvider((selection) => {
      if (!selection[0].description) {
        return;
      }
      const svgRes = this.getSvgPornSvg(selection[0].description);
      const pascalCasedName = getPascalCasedName(selection[0].description);
      svgRes.then((svgCode) => {
        transform(
          svgCode,
          {
            icon: true,
            plugins: [
              "@svgr/plugin-svgo",
              "@svgr/plugin-jsx",
              "@svgr/plugin-prettier",
            ],
          },
          { componentName: `${pascalCasedName}Icon` }
        ).then((jsCode) => {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(addNewLineAfterSemi(jsCode))
          );
        });
      });
    });
  }

  private getSvgPornSvg(name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      axios
        .get(`https://cdn.svgporn.com/logos/${name}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
