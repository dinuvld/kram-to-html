
    Toptions = {};
    Troot = "";
    Tdata = {};
    Twarnings = [];
    Tconverters = {};
    Ttoc = [];
    Ttoc_code = null;
    Tindent = 2;
    Tstack = [];
    Tconstants = constants;
    Tfootnote_counter = Toptions["footnote_nr"] ; //IS THIS THE RIGHT WAY?
    Tfootnote_start = Toptions["footnote_nr"]; //IS THIS THE RIGHT WAY?
    Tfootnotes = [];
    Tfootnotes_by_name = {};
    Tfootnote_location = null;
    Tversion = "1.11.1";

    
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
    
    TcharFromAlphabet = function(num) {
        return num>=26? num-26: String.fromCharCode(num+97);
    }
    
    TgetRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    TgetRandomAlphabeticArray = function(values) {
        x = [];
        for(i = 0; i<=values; i++) {
            x.push( TcharFromAlphabet(getRandomInt(0,35)) );
        }
        return x;
    }
    
    Tescape_html = function(value, type) {
        value = value || "";
        type = type || "all";
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;'
          };
        value.replace(new RegExp(Tconstants.ESCAPE_RE_FROM_TYPE[type]), "g");
        return String(value).replace(/[&<>"'\/]/g, function (s) {
          return entityMap[s];
        });
    }
    
    Tinner = function(el, indent) {
        var result = '';
        var indent = indent + Tindent;
        Tstack.push(el);
        el.children.forEach(function(entry) {
            result = result + Tconverters["convert_" + entry.type](entry, indent);
        });
        Tstack.pop();
        return result;
    }
    
    Thtml_attributes = function(attr) {
        mapp = [];
        attr.keys().forEach(function(k) {
            v = attr.val(k);
            if(v==null || (k == 'id' && k.trim()==="")) {
                mapp.push("");
            }
            else 
                mapp.push(" " + k + "\=" + Tescape_html(v.toString(), "attribute") + "\"");
        });
        return mapp.join("");
    }
   
    Tformat_as_indented_block_html = function(name, attr, body, indent) {
        return " ".repeat(indent) + "<" + name + Thtml_attributes(attr) + ">\n" + body + " ".repeat(indent) + "</" + name + ">\n"; 
    }
        
    Tformat_as_block_html = function(name, attr, body, indent) {
        return " ".repeat(indent) + "<" + name + Thtml_attributes(attr) + ">" + body + "</" + name + ">\n";    
    }
    
    Tformat_as_span_html = function(name, attr, body) {
        return "<" + name + Thtml_attributes(attr) + ">" + body + "</" + name + ">";
    }
    
    Textract_code_language = function(attr) {
        if(attr.keys()["class"] && attr.keys()["class"].str.search(/\blanguage-\S+/)!=-1) {
            return /\blanguage-\S+/.exec(attr.keys()["class"])[0][0]; //?
        }
    }
    
    Textract_code_language_exclamation = function(attr) {
        lang = Textract_code_language(attr);
        if(lang) {
            attr.keys()["class"] = attr.keys()["class"].replace(/\blanguage-\S+/, '').trim();
            if(attr.keys()["class"] == null || attr.keys()["class"] == "") {
                //attr.delete('class');
            }
        }
    }
    
    Thighlight_code = function(text, lang, type, opts) {
        if (typeof opts === 'undefined') { opts = {}; }
        //TODO
    }
    
    Tadd_syntax_highlighter_to_class_attr = function(attr, lang = nil) {
        //TODO
    }
    
    Tin_toc = function(el) {
        return Toptions["toc_levels"].contains(el.options["level"]) && (el.attr.keys()["class"] || '').match(/\bno_toc\b/)==null;
    }
    
    Toutput_header_level = function(level) {
        return Math.max(1, Math.min(6, level + Toptions["header_offset"]));
    }
    
    Tgenerate_toc_tree = function(toc, type, attr) {
        sections = new Element(type,null,attr);
        sections.attr["id"] = sections.attr["id"] == undefined? "markdown-toc" : sections.attr["id"];
        stack = [];
        toc.forEach(function(entry) {
            level = entry[0];
            id = entry[1];
            children = entry[2];
            li = new Element("li", null, null, {"level" : level});
            li.children.push(new Element("p",null,null, {"transparent" : true}));
            a = new Element("a", null);
            a.attr["href"] = "#" + id; 
            a.attr["id"] = sections.attr["id"] + "-" + id;
            a.children.concat(Tremove_footnotes(children));//a.children.concat(remove_footnotes(Marshal.load(Marshal.dump(children))))
            li.children[li.children.length - 1].children.push(a);
            li.children.push(new Element(type));
            
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
    
    Tremove_footnotes = function(elements) {
        elements.forEach(function(entry) {
            Tremove_footnotes(entry); //THIS MAY BE A PERFECT INFINITE LOOP
            if(entry.type == "footnote") {
                elements.splice(elements.indexOf(entry), 1);
            }
        });
    }
    
    Tobfuscate = function(text) {
        return text; //DON'T OBFUSCATE FOR NOW
    }
    
    Tfootnote_content = function() {
        ol = new Element("ol");
        if(Tfootnote_start != -1) ol.attr["start"] = Tfootnote_start;
        i = 0;
        backlink_text = Tescape_html(Toptions["footnote_backlink"], "text");
        while(i < Tfootnotes.length) {
            name = Tfootnotes[i][0]; data = Tfootnotes[i][1]; _ = Tfootnotes[i][2], repeat = Tfootnotes[i].slice(3);
            para = null;
            insert_space = null;
            li = new Element("li", null, {"id" : "fn:" + name});
            li.children = data.children; //li.children = Marshal.load(Marshal.dump(data.children))
            if(li.children[li.children.length - 1].type == "p") {
                para = li.children[li.children.length - 1];
                insert_space = true;
            }
            else {
                para = new Element("p");
                li.children.push(para);
                insert_space = false;
            }
            if(!Toptions["footnote_backlink"].length==0) {
                para.children.push(new Element("raw","%s<a href=\"#fnref:%s\" class=\"reversefootnote\">%s</a>".format(insert_space ? ' ' : '', name, backlink_text) ));
                repeat.forEach(function(index) {
                    para.children.push(new Element("raw","%s<a href=\"#fnref:%s\" class=\"reversefootnote\">%s</a>".format(" ", name + ":" + index, backlink_text + "<sup>" + (index+1) + "</sup>" )));
                });
            }
            ol.children.push(new Element("raw", Tconvert(li, 4)));
            i++;
        }
        return (ol.children.length == 0 ? "" : Tformat_as_indented_block_html('div', {"class" : "footnotes"}, Tconvert(ol, 2), 0));
    }
    
    Tgenerate_id = function(str) {
        gen_id = str.replace(/^[^a-zA-Z]+/g, "");
        gen_id = gen_id == gen_id.replace(RegExp('^a-zA-Z0-9 -',"g"), "") ? null : gen_id.replace(RegExp('^a-zA-Z0-9 -',"g"), "");
        gen_id = gen_id == gen_id.replace(RegExp(' ', "g"), "-") ? null : gen_id.replace(RegExp(' ', "g"), "-");
        gen_id = gen_id == gen_id.toLowerCase()? null: gen_id.toLowerCase();
        if(gen_id.length == 0)
            gen_id = "section";
        Tused_id = Tused_id || {};
        if(Tused_id[gen_id] != undefined) {
            Tused_id[gen_id]++;
            gen_id = gen_id + "-" + (Tused_id[gen_id] - 1);
        }
        else {
            Tused_id[gen_id] = 0;
        }
        return Toptions["auto_id_prefix"] + gen_id;
    }
    
    //
    //
    //
    //
    //

    Tconvert = function(el, indent) {
        indent = -Tindent;
        console.log("convert_" + el.type);
        return Tconverters["convert_" + el.type](el, indent);
    }
    
    Tconverters["convert_blank"] = function(el, indent) {
        return "\n";
    }
    
    Tconverters["convert_text"] = function(el, indent) {
        return Tescape_html(el.value, "text");
    }
    
    Tconverters["convert_p"] = function(el, indent) {
        if (el.options["transpart"]) {
            return Tinner(el, indent)
        }
        else {
            return format_as_block_html(el.type, el.attr, Tinner(el, indent), indent);
        }
    }
    
    Tconverters["convert_codeblock"] = function(el, indent) {
        attr = el.attr;
        lang = Textract_code_language_exclamation(attr);
        //TODO: More pls
        return "CODEBLOCK PLS";
    }
    
    Tconverters["convert_blockquote"] = function(el, indent) {
        return Tformat_as_indented_block_html(el.type, el.attr, Tinner(el, indent), indent);
    }
    
    Tconverters["convert_header"] = function(el, indent) {
        attr = el.attr;
        if( Toptions["auto_ids"] && !attr.val("id")) {
            attr.keys()["id"] = generate_id(el.options["raw_text"]);
        }
        if(attr.val("id") && Tin_toc(el)) {
            Ttoc.push(el.options["level"]); Ttoc.push(attr.val("id")); Ttoc.push(el.children);
        }
        level = Toutput_header_level(el.options["level"]);
        return Tformat_as_block_html("h" + level, attr, Tinner(el, indent), indent);
    }
    
    Tconverters["convert_hr"] = function(el, indent) {
        return " ".repeat(indent) + "<hr" + Thtml_attributes(el.attr) + "/>\n";
    }
    
    Tul_trycatch = function(el) {
        x = null;
        try {
            x = el.options["ial"]["refs"].contains("toc");
        } catch (e) {x = null;}
        return x;
    }
    
    Tconverters["convert_ul"] = function(el, indent) {
        if (!Ttoc_code && Tul_trycatch(el)) {
            Ttoc_code = [el.type, el.attr, TgetRandomAlphabeticArray(128).join("")];
            return Ttoc_code[Ttoc_code.length - 1];
        }
        else if(!Tfootnote_location && el.options["ial"] && (el.options["ial"]["refs"] || []).contains("footnotes")) {
            return Tfootnote_location = TgetRandomAlphabeticArray(128).join("");
        }
        else {
            return Tformat_as_indented_block_html(el.type, el.attr, Tinner(el, indent), indent);
        }
    }
    
    Tconverters["convert_ol"] = Tconverters["convert_ul"];
    
    Tconverters["convert_dl"] = function(el, indent) {
        return Tformat_as_indented_block_html(el.type, el.attr, Tinner(el, indent), indent)
    }
    
    Tconverters["convert_li"] = function(el, indent) {
        output = " ".repeat(indent) + "<" + el.type + Thtml_attributes(el.attr) + ">";
        res = Tinner(el,indent);
        if(el.children.length==0 || (el.children[1].type == "p" && el.children[1].options["transparent"])) {
            output = output + res + (res.match(/\bno_toc\b/) ? " ".repeat(indent) : "");
        }
        else {
            output = output + "\n" + res + " ".repeat(indent);
        }
        return output = output + "</" + el.type + ">\n";
    }
    
    Tconverters["convert_dd"] = Tconverters["convert_li"];
    
    Tconverters["convert_dt"] = function(el, indent) {
        return Tformat_as_block_html(el.type, el.attr, Tinner(el, indent), indent);
    }
    
    Tconverters["convert_html_element"] = function(el, indent) {
        res = Tinner(el,indent);
        if(el.options["category"] == "span") {
            return "<" + el.value + Thtml_attributes(el.attr) + ((res.length == 0 && Tconstants.HTML_ELEMENTS_WITHOUT_BODY.contains(el.value)) ? "/>" : ">" + res + "</" + el.value)
        }
        else {
            output = "";
            if(Tstack[Tstack.length - 1].type != "html_element" || Tstack[Tstack.length - 1].options["content_model"] != "raw") {
                output = output +  " ".repeat(indent);
            }
            output = output + "<" + el.value + Thtml_attributes(el.attr);
            if(el.options["is_closed"] && el.options["content_model"] == "raw") {
                output = output + " />";
            }
            else if(!res.length==0 && el.options["content_model"] != "block") {
                output = output + ">" + res + "</" + el.value + ">";
            }
            else if(!res.length==0) {
                output = output + ">\n" + res.chomp + "\n" + " ".repeat(indent) + "</" + el.value + ">";
            }
            else if(Tconstants.HTML_ELEMENTS_WITHOUT_BODY.contains(el.value)) {
                output = output + " />";
            }
            else {
                output = output + "></" + el.value + ">";
            }
            
            if(Tstack[Tstack.length-1].type != "html_element" || Tstack[Tstack.length-1].options["content_model"] != "raw") {
                output = output + "\n";
            }
            return output;
        }
    }
    
    Tconverters["convert_xml_comment"] = function(el, indent) {
        if(el.options["category"] == "block" && (Tstack[stack.length-1].type != "html_element" || Tstack[Tstack.length-1].options["content_model"] != "raw")) {
            return " ".repeat(indent) + el.value + "\n";
        }
        else {
            return el.value;
        }
    }
    
    Tconverters["convert_xml_pi"] = Tconverters["convert_xml_comment"];

    Tconverters["convert_table"] = function(el,indent) {
        return Tformat_as_indented_block_html(el.type, el.attr, Tinner(el,indent), indent);
    }
    
    Tconverters["convert_thead"] = Tconverters["convert_table"];
    Tconverters["convert_tbody"] = Tconverters["convert_table"];
    Tconverters["convert_tfoot"] = Tconverters["convert_table"];
    Tconverters["convert_tr"] = Tconverters["convert_table"];
    
    Tconverters["convert_td"] = function(el, indent) {
        res = Tinner(el, indent);
        type = (Tstack[Tstack.length - 2].type == "thead" ? "th" : "td");
        attr = el.attr;
        alignment = Tstack[Tstack.length - 3].options["alignment"][Tstack[Tstack.length].children.indexOf(el)];
        if(alignment != "default") {
            attr = el.attr;
            attr["style"] = (attr["style"] != undefined ? attr["style"] + "; " : "") + "text-align: " + alignment;
        }
        return Tformat_as_block_html(type, attr, res.length==0? String.fromCodePoint(Tconstants.ENTITY_TABLE["nbsp"]) : res, indent);
    }
    
    Tconverters["convert_comment"] = function(el,indent) {
        if(el.options["category"] == "block") {
            return " ".repeat(indent) + "<!-- " + el.value + " -->\n";
        }
        else {
            return "<!-- " + el.value + " -->";
        }
    }
    
    Tconverters["convert_br"] = function(el,indent) {
        return "<br />"
    }
    
    Tconverters["convert_a"] = function(el, indent) {
        res = Tinner(el, indent);
        attr = el.attr;
        if( attr["href"].startsWith("mailto:")) {
            mail_addr = attr["href"].substring(7, attr["href"].length - 1);
            attr['href'] = Tobfuscate('mailto') + ":" + Tobfuscate(mail_addr);
            if(res == mail_addr) {
                res = Tobfuscate(res);
            }
        }
        return Tformat_as_span_html(el.type, attr, res);
    }

    Tconverters["convert_img"] = function(el, indent) {
        return "<img" + Thtml_attributes(el.attr) + "/>"
    }
    
    Tconverters["convert_codespan"] = function(el, indent) {
        attr = el.attr;
        lang = Textract_code_language(attr);
        hl_opts = {};
        result = Thighlight_code(el.value, lang, "span", hl_opts);
        if(result) {
            Tadd_syntax_highlighter_to_class_attr(attr, hl_opts["default_lang"])
        }
        else {
            result = Tescape_html(el.value);
        }
        return Tformat_as_span_html("code", attr, result);
    }
    
    Tconverters["convert_footnote"] = function(el, indent) {
        repeat = "";
        number = null;
        footnote = Tfootnotes_by_name[el.options["name"]];
        if(footnote) {
            number = footnote[2];
            footnote[3] = footnote[3] + 1;
            repeat = ":" + footnote[3]
        }
        else {
            number = Tfootnote_counter;
            Tfootnote_counter = Tfootnote_counter + 1;
            Tfootnotes.push([el.options["name"], el.value, number, 0]);
            Tfootnotes_by_name[el.options["name"]] = Tfootnotes[Tfootnotes.length - 1];
        }
        return "<sup id=\"fnref:" + el.options["name"] + repeat + "\"><a href=\"#fn:" + el.options["name"] + "\" class=\"footnote\">" + number + "</a></sup>"; //BLACK MAGIC, verify later I'm sure I did something wrong
    }
    
    Tconverters["convert_raw"] = function(el, indent) {
        if(!el.options["type"] || el.options["type"].length==0 || el.options["type"].contains("html")) {
            return el.value + (el.options["category"] == "block" ? "\n" : "")
        }
        else {
            return "";
        }
    }
    
    Tconverters["convert_em"] = function(el,indent) {
        return Tformat_as_span_html(el.type, el.attr, Tinner(el, indent));
    }
    
    Tconverters["convert_strong"] = Tconverters["convert_em"];
    
    Tconverters["convert_typographic_sym"] = function(el, indent) {
        return Tconstants.TYPOGRAPHIC_SYMS[el.value];
    }
    
    Tconverters["convert_math"] = function(el, indent) {
        return "MATH" //TODO
    }
    
    Tconverters["convert_smart_quote"] = function(el, indent) {
        SMART_QUOTE_INDICES = {"lsquo" : 0, "rsquo" : 1, "ldquo" : 2, "rdquo" : 3};
        return String.fromCodePoint(Tconstants[Toptions["smart_quotes"][SMART_QUOTE_INDICES[el.value]]]);
    }
    
    Tconverters["convert_abbreviation"] = function(el, indent) {
        title = Troot.options["abbrev_defs"][el.value];
        attr = Troot.options["abbrev_attr"][el.value];
        if(title.length!=0) {
            attr["title"] = title;
        }
        return Tformat_as_span_html("abbr", attr, el.value);
    }
    
    Tconverters["convert_root"] = function(el, indent) {
        result = Tinner(el, indent);
        console.log(result);
        if(Tfootnote_location) {
            result.replace(new RegExp(Tfootnote_location), Tfootnote_content().replace(/\\/g, "\\\\\\\\"));
        }
        else {
            result = result + Tfootnote_content();
        }
        if(Ttoc_code) {
            toc_tree = Tgenerate_toc_tree(Ttoc, Ttoc_code[0], Ttoc_code[1] || {});
            text = "";
            if(toc_tree.children.size > 0) {
                text = convert(toc_tree, 0);
            }
            result.replace(new RegExp(Ttoc_code[Ttoc_code.length - 1]), text.replace(/\\/g, "\\\\\\\\"));
        }
        console.log(result);
        return result;
    }

Troot = 'This *is* some kramdown text';
console.log(Tconvert(new Element("strong",'This *is* some kramdown text')));

//Check for attr.dup, was replaced with attr