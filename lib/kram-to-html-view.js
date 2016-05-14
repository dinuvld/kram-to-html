'use babel';

import { CompositeDisposable } from 'atom';

export default class KramToHtmlView {

  constructor(serializedState) {
    // Create root element

    this.subscriptions = new CompositeDisposable();

    this.element = document.createElement('div');
    this.element.classList.add('kram-to-html');
    this.element.style = "overflow-y: auto;";


    text = document.createElement('atom-text-editor');
    text.style = "overflow-y: auto;"
    text.style.width = window.innerWidth/3 + "px";
    text.style.height = "auto"
    text.classList.add('atom-text-editor');
    text.setAttribute('id', 'text');
    window.onresize = function() {
      text.style.width = window.innerWidth/3 + "px";
    }

    var editor = atom.workspace.getActiveTextEditor();
    var words = editor.getText();
    text.textContent = words;
    this.setText("Muie garda");
    console.log(words);
    // text.removeAttribute('tabindex');

    this.element.appendChild(text);

    // this.subscriptions.add(atom.workspace.getActiveTextEditor().onDidChange(function() {
    //   this.element.children[0].textContent = "bunica";
    // }))

       this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
           return function(_editor) {
             return _this.subscriptions.add(_editor.onDidChange(function() {
               console.log("IT ACTUALLY WORKS");
               _this.setText("bunica");
             }));
           };
       })(this)));


  }


  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  setText(text) {
    //this.element.children[0].textContent = text;
    text.textContent = text;
  }

  getElement() {
    return this.element;
  }

}
