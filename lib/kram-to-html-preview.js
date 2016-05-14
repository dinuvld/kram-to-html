'use babel';

export default class KramToHtmlPreview {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('kram-to-html');
    this.element.style = "overflow-y: auto;background-color: #ffffff;";

    text = document.createElement('iframe');
    text.style.border = "none";
    text.style.backgroundColor = "#ffffff";
    text.style.width = window.innerWidth/3 + "px";
    text.style.height = "auto"
    window.onresize = function() {
      text.style.width = window.innerWidth/3 + "px";
    }

    var editor = atom.workspace.getActiveTextEditor();
    var words = editor.getText();
    text.setAttribute("srcdoc",words);
    this.element.appendChild(text);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
