# kram-to-html package


KramPlug este un plug-in de atom care converteste fisiere scrise in kramdown in HTML. Ceea ce face KramPlug special e ca face asta prin intermediul unuei functii Javascript portata din sursa oficiala (scrisa in Ruby) a convertorului, in timp real. Pana in momentul asta am portat aprox. 70% din codul Ruby, dar nu si parserul care transforma textul brut din Kramdown intr-un obiect de tip TOC.

Plugin-ul de atom ar trebui sa aiba doua parti, functionale dupa ce este implementata complet functia de convertire, dar care pot fi vazute ca prototip si aici accesand ctrl-alt-o pentru preview-ul codului html brut si ctrl-alt-p pentru preview-ul paginii randate (se pot testa din fisierul index.html aflat in folderul KramPlug). In cazul in care feresterele de plugin nu se updateaza cu continutul din fisierul deschis atunci Atom trebuie reloadat (alt-ctrl-r) si deschis preview-ul cu fisierul dorit in editor.
