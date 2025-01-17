import * as Blockly from 'blockly';
import { Menu, MenuItem } from 'blockly';

export class FieldJsonExplorer extends Blockly.FieldDropdown {
  currentPath: string[] = [];
  constructor(public readonly jsonData: any, opt_validator: any) {
    super(() => FieldJsonExplorer.buildOptions(jsonData, []), opt_validator);
  }

  // Function to build dropdown options based on current path
  static buildOptions(json: any, path: string[]): [string, string][] {
    let node = json;
    path.forEach((key) => {
      if (node && typeof node === 'object') {
        node = Array.isArray(node) ? node[parseInt(key)] : node[key];
      }
    });

    const options: [string, string][] = [];
    if (typeof node === 'object') {
      for (const key in node) {
        if (node.hasOwnProperty(key)) {
          options.push([key, key]);
        }
      }
    } else if (Array.isArray(node)) {
      node.forEach((item, index) => {
        options.push([`Index ${index}`, index.toString()]);
      });
    } else {
      options.push([String(node), String(node)]);
    }
    return options;
  }

  protected override onItemSelected_(menu: Menu, menuItem: MenuItem) {
    super.onItemSelected_(menu, menuItem);
    const value = menuItem.getValue();
    if (!value) return;

    this.currentPath.push(value);
    this.menuGenerator_ = FieldJsonExplorer.buildOptions(
      this.jsonData,
      this.currentPath
    );
    this.forceRerender();
  }
}

Blockly.fieldRegistry.register('field_json_explorer', FieldJsonExplorer);
