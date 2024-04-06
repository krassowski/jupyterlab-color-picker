import { EditorView } from '@codemirror/view';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  EditorExtensionRegistry,
  IEditorExtensionRegistry
} from '@jupyterlab/codemirror';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import {
  colorPicker as CSSColorPicker,
  wrapperClassName
} from '@replit/codemirror-css-color-picker';
import { makeColorPicker } from './picker';
import { discoverColorsInStrings, IDiscoveryOptions } from './discover';

/**
 * Initialization data for the jupyterlab-color-picker extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-color-picker:plugin',
  description: 'A JupyterLab color picker',
  autoStart: true,
  requires: [IEditorExtensionRegistry],
  optional: [ITranslator],
  activate: (
    app: JupyterFrontEnd,
    extensions: IEditorExtensionRegistry,
    translator: ITranslator | null
  ) => {
    const trans = (translator ?? nullTranslator).load(
      'jupyterlab-color-picker'
    );

    extensions.addExtension(
      Object.freeze({
        name: 'jupyterlab-color-picker',
        default: {},
        factory: () =>
          EditorExtensionRegistry.createConfigurableExtension(
            (settings: IDiscoveryOptions = { matplotlibTableau: true }) => {
              return [
                CSSColorPicker,
                makeColorPicker({
                  discoverColors: discoverColorsInStrings(settings)
                }),
                EditorView.theme({
                  [`.${wrapperClassName}`]: {
                    outlineColor: '#000'
                  }
                })
              ];
            }
          ),
        schema: {
          type: 'object',
          title: trans.__('Color Picker'),
          properties: {
            matplotlibTableau: {
              type: 'boolean',
              title: trans.__('Detect Matplotlib Tableau colors in Python'),
              default: true
            }
          }
        }
      })
    );
  }
};

export default plugin;
