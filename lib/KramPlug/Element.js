function Element(type, value, attr, options) {
    if (typeof value === 'undefined') { value = null; }
    if (typeof attr === 'undefined') { attr = null; }
    if (typeof options === 'undefined') { options = null; }
    
    this.type = type;
    this.value = value;
    if(attr!=null) {
        temp = orderedHash();
        attr.forEach(function(entry) {
            temp.push(entry, temp.length());
        });
        this.attr = temp;
    }
    else {
        this.attr = orderedHash();
    }
    //(Utils::OrderedHash.new.merge!(attr) if attr);
    this.children = [];
    this.options = options || {};
        
        
        
//    this.inspect = function() {
//       return "<kd:" + this.type + (this.value==null?"":" " + this.value.inspect) + this.attr.inspect + (this.options.empty? "" : " " + options.inspect) + (this.children.empty? "" : " " + this.children.inspect);
//    }
        
    var CATEGORY = {};
    var blocks = ["blank", "p", "header", "blockquote", "codeblock", "ul", "ol", "li", "dl", "dt", "dd", "table", "td", "hr"];
    blocks.forEach(function(entry) {
        CATEGORY[entry] = "block";
    });
    var spans = ["text", "a", "br", "img", "codespan", "footnote", "em", "strong", "entity", "typographic_sym", "smart_quote", "abbreviation"];
    spans.forEach(function(entry) {
        CATEGORY[entry] = "span";
    })
    
    this.category = function(el) {
        return CATEGORY[el] || el.options["category"];
    }
}