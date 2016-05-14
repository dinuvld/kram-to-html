'use babel';

import KramToHtmlView from './kram-to-html-view'; aslk;df
import KramToHtmlPreview from './kram-to-html-preview';
import { CompositeDisposable } from 'atom';

export default {

  kramToHtmlPreview: null,
  kramToHtmlView: null,
  modalPanel: null,
  subscriptions: null,
  textPanel: null,

  activate(state) {
    this.kramToHtmlView = new KramToHtmlView(state.kramToHtmlViewState);
    this.kramToHtmlPreview = new KramToHtmlPreview(state.kramToHtmlPreviewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.kramToHtmlView.getElement().children[0],
    //   visible: false
    // });

    this.textPanel = atom.workspace.addRightPanel({
      item: this.kramToHtmlView.getElement().children[0],
      visible: false
    });

    this.previewPanel = atom.workspace.addRightPanel({
      item: this.kramToHtmlPreview.getElement().children[0],
      visible: false
    });


    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

     this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
         return function(editor) {
           return _this.subscriptions.add(editor.onDidSave(function() {
             // return _this.kramToHtmlView.setText(editor.getText());
             _this.kramToHtmlView.getElement().children[0].textContent = "bunica";
           }));
         };
     })(this)));

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'kram-to-html:toggle': () => this.toggle(),
      'kram-to-html:togglePreview': () => this.togglePreview()
    }));
  },

  deactivate() {
    // this.modalPanel.destroy();
    this.textPanel.destroy();
    this.previewPanel.destroy();
    this.subscriptions.dispose();
    this.kramToHtmlView.destroy();
  },

  serialize() {
    return {
      kramToHtmlViewState: this.kramToHtmlView.serialize(),
      kramToHtmlPreviewState: this.KramToHtmlPreview.serialize()
    };
  },

  toggle() {
    console.log('KramToHtml was toggled!');
    return (
      this.textPanel.isVisible() ?
      this.textPanel.hide() :
      this.textPanel.show()
    );
  },

 togglePreview() {
    console.log('Preview was toggled!');
    return (
      this.previewPanel.isVisible() ?
      this.previewPanel.hide() :
      this.previewPanel.show()
    );
  }

};
