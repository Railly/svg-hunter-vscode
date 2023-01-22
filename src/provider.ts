import * as vscode from "vscode";
import axios from "axios";
import { transform } from "@svgr/core";
import { parsedSvgPorn } from "./data/svg-porn-parsed";
import {
  SVG_PORN,
  SVG_PORN_URL,
  externalProviders,
  sources,
} from "./data/providers";
import {
  addNewLineAfterSemi,
  deleteFirstAndLastLine,
  deletePropsWithCurlyBrackets,
  getPascalCasedName,
  getStringAfterLastSlash,
  suggestName,
} from "./utils";

export class SvgHunterProvider {
  public static readonly viewType = "svg-hunter";
  public static readonly viewTitle = "SVG Hunter";

  constructor(private readonly _extensionUri: vscode.Uri) {}

  private async handleSvgExternalProvider({
    callback,
    svgData,
    url,
  }: {
    callback: (selection: any, svgRes: Promise<string>) => void;
    svgData: any;
    url: string;
  }) {
    const name = await vscode.window.showInputBox({
      prompt: "Enter the name of the icon",
    });

    const suggested = suggestName({
      name: name || "",
      files: svgData,
    });

    const quickPick = vscode.window.createQuickPick();
    if (typeof suggested !== "string") {
      quickPick.items = suggested
        .map((item) => {
          const name = Object.keys(item)[0];
          return item[name].map((item) => {
            return {
              label: name,
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
      if (!selection[0].description) {
        return;
      }
      const svgRes = this.getSvg({
        name: selection[0].description,
        url,
      });

      callback(selection, svgRes);
    });
    quickPick.show();
  }

  public async handleWithProvider(
    callback: (
      selection: readonly vscode.QuickPickItem[],
      svgRes: Promise<string>
    ) => void
  ) {
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = "Select a source";
    quickPick.items = sources;

    quickPick.onDidChangeSelection(async (selection) => {
      if (selection[0].label === "External Provider") {
        const subQuickPick = vscode.window.createQuickPick();
        subQuickPick.placeholder = "Select a external provider";
        subQuickPick.items = externalProviders;

        subQuickPick.onDidChangeSelection(async (subSelection) => {
          switch (subSelection[0].label) {
            case SVG_PORN:
              this.handleSvgExternalProvider({
                callback,
                svgData: parsedSvgPorn,
                url: SVG_PORN_URL,
              });
              break;
            default:
              break;
          }
        });

        subQuickPick.show();
      }

      if (selection[0].label === "Local Files") {
        const files = await vscode.workspace.findFiles(
          "**/*.svg",
          "**/node_modules/**"
        );
        const subQuickPick = vscode.window.createQuickPick();
        subQuickPick.items = files.map((file) => {
          return {
            label: getStringAfterLastSlash(file.path),
            description: file.path,
          };
        });
        subQuickPick.onDidChangeSelection((selection) => {
          const fileContent = vscode.workspace.fs
            .readFile(vscode.Uri.file(selection[0].description))
            .then((buffer) => {
              return buffer.toString();
            });
          console.log({ fileContent });
          callback(selection, Promise.resolve(fileContent));
        });
        subQuickPick.show();
      }
    });
    quickPick.show();
  }

  private getSvg({
    name,
    url,
  }: {
    name: string;
    url: string;
  }): Promise<string> {
    console.log({
      url,
      name,
    });
    return new Promise((resolve, reject) => {
      axios
        .get(`${url}/${name}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public async insertSvgHtml() {
    this.handleWithProvider((selection: any, svgRes) => {
      svgRes.then((svgCode) => {
        vscode.window.activeTextEditor?.insertSnippet(
          new vscode.SnippetString(svgCode)
        );
      });
    });
  }

  public async insertRawJsxSvg() {
    this.handleWithProvider((selection: any, svgRes: Promise<string>) => {
      const pascalCasedName = getPascalCasedName(selection[0].label);
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
    this.handleWithProvider((selection: any, svgRes: Promise<string>) => {
      const pascalCasedName = getPascalCasedName(selection[0].label);
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
}
