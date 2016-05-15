var KramPlug = function(root, options) {

    this.options = options || {};
    this.root = root;
    this.data = {};
    this.warnings = [];
    this.converters = {};
    this.toc = [];
    this.toc_code = null;
    this.indent = 2;
    this.stack = [];
    this.constants = constants;
    this.footnote_counter = this.options["footnote_nr"] ; //IS THIS THE RIGHT WAY?
    this.footnote_start = this.options["footnote_nr"]; //IS THIS THE RIGHT WAY?
    this.footnotes = [];
    this.footnotes_by_name = {};
    this.footnote_location = null;
    this.version = "1.11.1";

    
    //Util functions
    //
    
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }
    
    this.charFromAlphabet = function(num) {
        return num>=26? num-26: String.fromCharCode(num+97);
    }
    
    this.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    this.getRandomAlphabeticArray = function(values) {
        x = [];
        for(i = 0; i<=values; i++) {
            x.push( this.charFromAlphabet(getRandomInt(0,35)) );
        }
        return x;
    }
    
    this.escape_html = function(value, type) {
        type = type || "all";
        value = value || "";
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;'
          };
        value.replace(new RegExp(this.constants.ESCAPE_RE_FROM_TYPE[type]), "g");
        return String(value).replace(/[&<>"'\/]/g, function (s) {
          return entityMap[s];
        });
    }
    
    this.inner = function(el, indent) {
        var result = '';
        var indent = indent + this.indent;
        this.stack.push(el);
        el.children.forEach(function(entry) {
            result = result + this.converters["convert_" + entry.type](entry, indent);
        });
        this.stack.pop();
        return result;
    }
    
    this.html_attributes = function(attr) {
        mapp = [];
        attr.keys().forEach(function(k) {
            v = attr.val(k);
            if(v==null || (k == 'id' && k.trim()==="")) {
                mapp.push("");
            }
            else 
                mapp.push(" " + k + "\=" + this.escape_html(v.toString(), "attribute") + "\"");
        });
        return mapp.join("");
    }
   
    this.format_as_indented_block_html = function(name, attr, body, indent) {
        return " ".repeat(indent) + "<" + name + this.html_attributes(attr) + ">\n" + body + " ".repeat(indent) + "</" + name + ">\n"; 
    }
        
    this.format_as_block_html = function(name, attr, body, indent) {
        return " ".repeat(indent) + "<" + name + this.html_attributes(attr) + ">" + body + "</" + name + ">\n";    
    }
    
    this.format_as_span_html = function(name, attr, body) {
        return "<" + name + this.html_attributes(attr) + ">" + body + "</" + name + ">";
    }
    
    this.extract_code_language = function(attr) {
        if(attr.keys()["class"] && attr.keys()["class"].str.search(/\blanguage-\S+/)!=-1) {
            return /\blanguage-\S+/.exec(attr.keys()["class"])[0][0]; //?
        }
    }
    
    this.extract_code_language_exclamation = function(attr) {
        lang = this.extract_code_language(attr);
        if(lang) {
            attr.keys()["class"] = attr.keys()["class"].replace(/\blanguage-\S+/, '').trim();
            if(attr.keys()["class"] == null || attr.keys()["class"] == "") {
                //attr.delete('class');
            }
        }
    }
    
    this.highlight_code = function(text, lang, type, opts) {
        if (typeof opts === 'undefined') { opts = {}; }
        //TODO
    }
    
    this.add_syntax_highlighter_to_class_attr = function(attr, lang = nil) {
        //TODO
    }
    
    this.in_toc = function(el) {
        return this.options["toc_levels"].contains(el.options["level"]) && (el.attr.keys()["class"] || '').match(/\bno_toc\b/)==null;
    }
    
    this.output_header_level = function(level) {
        return Math.max(1, Math.min(6, level + this.options["header_offset"]));
    }
    
    this.generate_toc_tree = function(toc, type, attr) {
        sections = Element(type,null,attr);
        sections.attr["id"] = sections.attr["id"] == undefined? "markdown-toc" : sections.attr["id"];
        stack = [];
        toc.forEach(function(entry) {
            level = entry[0];
            id = entry[1];
            children = entry[2];
            li = Element("li", null, null, {"level" : level});
            li.children.push(Element("p",null,null, {"transparent" : true}));
            a = Element("a", null);
            a.attr["href"] = "#" + id; 
            a.attr["id"] = sections.attr["id"] + "-" + id;
            a.children.concat(this.remove_footnotes(children));//a.children.concat(remove_footnotes(Marshal.load(Marshal.dump(children))))
            li.children[li.children.length - 1].children.push(a);
            li.children.push(Element(type));
            
            success = false;
            while(!success) {
                if(stack.length==0) {
                    sections.children.push(li);
                    stack.push(li);
                    success = true;
                }
                else if(stack[stack.length-1].options["level"] < li.options["level"]) {
                    stack[stack.length - 1].children[stack[stack.length - 1].children.length - 1].children.push(li);
                    stack.push(li);
                    success = true;
                }
                else {
                    item = stack.pop();
                    if(!item.children.length > 0) item.children.pop(); //QUESTIONING
                }
            }});
        while(!stack.length==0) {
            item = stack.pop();
            if(!item.children.length > 0) item.children.pop(); //QUESTIONING
        }
        return sections;
    }
    
    this.remove_footnotes = function(elements) {
        elements.forEach(function(entry) {
            this.remove_footnotes(entry); //THIS MAY BE A PERFECT INFINITE LOOP
            if(entry.type == "footnote") {
                elements.splice(elements.indexOf(entry), 1);
            }
        });
    }
    
    this.obfuscate = function(text) {
        return text; //DON'T OBFUSCATE FOR NOW
    }
    
    this.footnote_content = function() {
        ol = Element("ol");
        if(this.footnote_start != -1) ol.attr["start"] = this.footnote_start;
        i = 0;
        backlink_text = this.escape_html(this.options["footnote_backlink"], "text");
        while(i < this.footnotes.length) {
            name = this.footnotes[i][0]; data = this.footnotes[i][1]; _ = this.footnotes[i][2], repeat = this.footnotes[i].slice(3);
            para = null;
            insert_space = null;
            li = Element("li", null, {"id" : "fn:" + name});
            li.children = data.children; //li.children = Marshal.load(Marshal.dump(data.children))
            if(li.children[li.children.length - 1].type == "p") {
                para = li.children[li.children.length - 1];
                insert_space = true;
            }
            else {
                para = Element("p");
                li.children.push(para);
                insert_space = false;
            }
            if(!this.options["footnote_backlink"].length==0) {
                para.children.push(Element("raw","%s<a href=\"#fnref:%s\" class=\"reversefootnote\">%s</a>".format(insert_space ? ' ' : '', name, backlink_text) ));
                repeat.forEach(function(index) {
                    para.children.push(Element("raw","%s<a href=\"#fnref:%s\" class=\"reversefootnote\">%s</a>".format(" ", name + ":" + index, backlink_text + "<sup>" + (index+1) + "</sup>" )));
                });
            }
            ol.children.push(Element("raw", this.convert(li, 4)));
            i++;
        }
        return (ol.children.length == 0 ? "" : this.format_as_indented_block_html('div', {"class" : "footnotes"}, this.convert(ol, 2), 0));
    }
    
    this.generate_id = function(str) {
        gen_id = str.replace(/^[^a-zA-Z]+/g, "");
        gen_id = gen_id == gen_id.replace(RegExp('^a-zA-Z0-9 -',"g"), "") ? null : gen_id.replace(RegExp('^a-zA-Z0-9 -',"g"), "");
        gen_id = gen_id == gen_id.replace(RegExp(' ', "g"), "-") ? null : gen_id.replace(RegExp(' ', "g"), "-");
        gen_id = gen_id == gen_id.toLowerCase()? null: gen_id.toLowerCase();
        if(gen_id.length == 0)
            gen_id = "section";
        this.used_id = this.used_id || {};
        if(this.used_id[gen_id] != undefined) {
            this.used_id[gen_id]++;
            gen_id = gen_id + "-" + (this.used_id[gen_id] - 1);
        }
        else {
            this.used_id[gen_id] = 0;
        }
        return this.options["auto_id_prefix"] + gen_id;
    }
    
    //
    //
    //
    //
    //

    this.convert = function(el, indent) {
        indent = -this.indent;
        return this.converters["convert_" + el.type](el, indent);
    }
    
    this.converters["convert_blank"] = function(el, indent) {
        return "\n";
    }
    
    this.converters["convert_text"] = function(el, indent) {
        return this.escape_html(el.value, "text");
    }
    
    this.converters["convert_p"] = function(el, indent) {
        if (el.options["transpart"]) {
          return this.inner(el, indent)
        }
        else {
          return format_as_block_html(el.type, el.attr, this.inner(el, indent), indent);
        }
    }
    
    this.converters["convert_codeblock"] = function(el, indent) {
        attr = el.attr;
        lang = this.extract_code_language_exclamation(attr);
        //TODO: More pls
    }
    
    this.converters["convert_blockquote"] = function(el, indent) {
        return this.format_as_indented_block_html(el.type, el.attr, this.inner(el, indent), indent);
    }
    
    this.converters["convert_header"] = function(el, indent) {
        attr = el.attr;
        if( this.options["auto_ids"] && !attr.val("id")) {
            attr.keys()["id"] = generate_id(el.options["raw_text"]);
        }
        if(attr.val("id") && this.in_toc(el)) {
            this.toc.push(el.options["level"]); this.toc.push(attr.val("id")); this.toc.push(el.children);
        }
        level = this.output_header_level(el.options["level"]);
        return this.format_as_block_html("h" + level, attr, this.inner(el, indent), indent);
    }
    
    this.converters["convert_hr"] = function(el, indent) {
        return " ".repeat(indent) + "<hr" + this.html_attributes(el.attr) + "/>\n";
    }
    
    this.ul_trycatch = function(el) {
        x = null;
        try {
            x = el.options["ial"]["refs"].contains("toc");
        } catch (e) {x = null;}
        return x;
    }
    
    this.converters["convert_ul"] = function(el, indent) {
        if (!this.toc_code && this.ul_trycatch(el)) {
            this.toc_code = [el.type, el.attr, this.getRandomAlphabeticArray(128).join("")];
            return this.toc_code[this.toc_code.length - 1];
        }
        else if(!this.footnote_location && el.options["ial"] && (el.options["ial"]["refs"] || []).contains("footnotes")) {
             return this.footnote_location = this.getRandomAlphabeticArray(128).join("");
        }
        else {
            return this.format_as_indented_block_html(el.type, el.attr, this.inner(el, indent), indent);
        }
    }
    
    this.converters["convert_ol"] = this.converters["convert_ul"];
    
    this.converters["convert_dl"] = function(el, indent) {
        return this.format_as_indented_block_html(el.type, el.attr, this.inner(el, indent), indent)
    }
    
    this.converters["convert_li"] = function(el, indent) {
        output = " ".repeat(indent) + "<" + el.type + this.html_attributes(el.attr) + ">";
        res = this.inner(el,indent);
        if(el.children.length==0 || (el.children[1].type == "p" && el.children[1].options["transparent"])) {
            output = output + res + (res.match(/\bno_toc\b/) ? " ".repeat(indent) : "");
        }
        else {
            output = output + "\n" + res + " ".repeat(indent);
        }
        return output = output + "</" + el.type + ">\n";
    }
    
    this.converters["convert_dd"] = this.converters["convert_li"];
    
    this.converters["convert_dt"] = function(el, indent) {
        return this.format_as_block_html(el.type, el.attr, this.inner(el, indent), indent);
    }
    
    this.converters["convert_html_element"] = function(el, indent) {
        res = this.inner(el,indent);
        if(el.options["category"] == "span") {
            return "<" + el.value + this.html_attributes(el.attr) + ((res.length == 0 && this.constants.HTML_ELEMENTS_WITHOUT_BODY.contains(el.value)) ? "/>" : ">" + res + "</" + el.value)
        }
        else {
            output = "";
            if(this.stack[this.stack.length - 1].type != "html_element" || this.stack[this.stack.length - 1].options["content_model"] != "raw") {
                output = output +  " ".repeat(indent);
            }
            output = output + "<" + el.value + this.html_attributes(el.attr);
            if(el.options["is_closed"] && el.options["content_model"] == "raw") {
                output = output + " />";
            }
            else if(!res.length==0 && el.options["content_model"] != "block") {
                output = output + ">" + res + "</" + el.value + ">";
            }
            else if(!res.length==0) {
                output = output + ">\n" + res.chomp + "\n" + " ".repeat(indent) + "</" + el.value + ">";
            }
            else if(this.constants.HTML_ELEMENTS_WITHOUT_BODY.contains(el.value)) {
                output = output + " />";
            }
            else {
                output = output + "></" + el.value + ">";
            }
            
            if(this.stack[this.stack.length-1].type != "html_element" || this.stack[this.stack.length-1].options["content_model"] != "raw") {
                output = output + "\n";
            }
            return output;
        }
    }
    
    this.converters["convert_xml_comment"] = function(el, indent) {
        if(el.options["category"] == "block" && (this.stack[stack.length-1].type != "html_element" || this.stack[this.stack.length-1].options["content_model"] != "raw")) {
            return " ".repeat(indent) + el.value + "\n";
        }
        else {
            return el.value;
        }
    }
    
    this.converters["convert_xml_pi"] = this.converters["convert_xml_comment"];

    this.converters["convert_table"] = function(el,indent) {
        return this.format_as_indented_block_html(el.type, el.attr, this.inner(el,indent), indent);
    }
    
    this.converters["convert_thead"] = this.converters["convert_table"];
    this.converters["convert_tbody"] = this.converters["convert_table"];
    this.converters["convert_tfoot"] = this.converters["convert_table"];
    this.converters["convert_tr"] = this.converters["convert_table"];
    
    this.converters["convert_td"] = function(el, indent) {
        res = this.inner(el, indent);
        type = (this.stack[this.stack.length - 2].type == "thead" ? "th" : "td");
        attr = el.attr;
        alignment = this.stack[this.stack.length - 3].options["alignment"][this.stack[this.stack.length].children.indexOf(el)];
        if(alignment != "default") {
            attr = el.attr;
            attr["style"] = (attr["style"] != undefined ? attr["style"] + "; " : "") + "text-align: " + alignment;
        }
        return this.format_as_block_html(type, attr, res.length==0? String.fromCodePoint(this.constants.ENTITY_TABLE["nbsp"]) : res, indent);
    }
    
    this.converters["convert_comment"] = function(el,indent) {
        if(el.options["category"] == "block") {
            return " ".repeat(indent) + "<!-- " + el.value + " -->\n";
        }
        else {
            return "<!-- " + el.value + " -->";
        }
    }
    
    this.converters["convert_br"] = function(el,indent) {
        return "<br />"
    }
    
    this.converters["convert_a"] = function(el, indent) {
        res = this.inner(el, indent);
        attr = el.attr;
        if( attr["href"].startsWith("mailto:")) {
            mail_addr = attr["href"].substring(7, attr["href"].length - 1);
            attr['href'] = this.obfuscate('mailto') + ":" + this.obfuscate(mail_addr);
            if(res == mail_addr) {
                res = this.obfuscate(res);
            }
        }
        return this.format_as_span_html(el.type, attr, res);
    }

    this.converters["convert_img"] = function(el, indent) {
        return "<img" + this.html_attributes(el.attr) + "/>"
    }
    
    this.converters["convert_codespan"] = function(el, indent) {
        attr = el.attr;
        lang = this.extract_code_language(attr);
        hl_opts = {};
        result = this.highlight_code(el.value, lang, "span", hl_opts);
        if(result) {
            this.add_syntax_highlighter_to_class_attr(attr, hl_opts["default_lang"])
        }
        else {
            result = this.escape_html(el.value);
        }
        return this.format_as_span_html("code", attr, result);
    }
    
    this.converters["convert_footnote"] = function(el, indent) {
        repeat = "";
        number = null;
        footnote = this.footnotes_by_name[el.options["name"]];
        if(footnote) {
            number = footnote[2];
            footnote[3] = footnote[3] + 1;
            repeat = ":" + footnote[3]
        }
        else {
            number = this.footnote_counter;
            this.footnote_counter = this.footnote_counter + 1;
            this.footnotes.push([el.options["name"], el.value, number, 0]);
            this.footnotes_by_name[el.options["name"]] = this.footnotes[this.footnotes.length - 1];
        }
        return "<sup id=\"fnref:" + el.options["name"] + repeat + "\"><a href=\"#fn:" + el.options["name"] + "\" class=\"footnote\">" + number + "</a></sup>"; //BLACK MAGIC, verify later I'm sure I did something wrong
    }
    
    this.converters["convert_raw"] = function(el, indent) {
        if(!el.options["type"] || el.options["type"].length==0 || el.options["type"].contains("html")) {
            return el.value + (el.options["category"] == "block" ? "\n" : "")
        }
        else {
            return "";
        }
    }
    
    this.converters["convert_em"] = function(el,indent) {
        return this.format_as_span_html(el.type, el.attr, this.inner(el, indent));
    }
    
    this.converters["convert_strong"] = this.converters["convert_em"];
    
    this.converters["convert_typographic_sym"] = function(el, indent) {
        return this.constants.TYPOGRAPHIC_SYMS[el.value];
    }
    
    this.converters["convert_math"] = function(el, indent) {
        return "MATH" //TODO
    }
    
    this.converters["convert_smart_quote"] = function(el, indent) {
        SMART_QUOTE_INDICES = {"lsquo" : 0, "rsquo" : 1, "ldquo" : 2, "rdquo" : 3};
        return String.fromCodePoint(this.constants[this.options["smart_quotes"][SMART_QUOTE_INDICES[el.value]]]);
    }
    
    this.converters["convert_abbreviation"] = function(el, indent) {
        title = this.root.options["abbrev_defs"][el.value];
        attr = this.root.options["abbrev_attr"][el.value];
        if(title.length!=0) {
            attr["title"] = title;
        }
        return this.format_as_span_html("abbr", attr, el.value);
    }
    
    this.converters["convert_root"] = function(el, indent) {
        result = this.inner(el, indent);
        if(this.footnote_location) {
            result.replace(new RegExp(this.footnote_location), this.footnote_content().replace(/\\/g, "\\\\\\\\"));
        }
        else {
            result = result + this.footnote_content();
        }
        if(this.toc_code) {
            toc_tree = generate_toc_tree(this.toc, this.toc_code[0], this.toc_code[1] || {});
            text = "";
            if(toc_tree.children.size > 0) {
                text = convert(toc_tree, 0);
            }
            result.replace(new RegExp(this.toc_code[this.toc_code.length - 1]), text.replace(/\\/g, "\\\\\\\\"));
        }
        return result;
    }
    
}
var krama = new KramPlug('This *is* some kramdown text');
console.log(krama.converters["convert_root"](krama.root));
console.log(krama);

//Check for attr.dup, was replaced with attr