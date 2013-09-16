var xmlhelper = function() {
    var toArray = function(obj) {
        var ret = [];
        for (var i = 0; i < obj.length; ++i) {
            ret.push(obj[i]);
        }
        return ret;
    };

    var ownPropertyNames = function(obj) {
        var ret = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p))
                ret.push(p);
        return ret;
    };

    var nodeToObject = function(node) {
        var ret = {_attributes: {}};

        (toArray(node.attributes)).forEach(function(_) {
            ret._attributes[_.nodeName] = _.nodeValue;
        });

        var children = toArray(node.childNodes);
        if (children.every(function(_) { return _.nodeType == 3; /* single-text-child */ })) {
            return children.map(function(_) { return _.nodeValue; }).join('');
        }

        children.forEach(function(_) {
            var content = nodeToObject(_);
            if (ret[_.nodeName] instanceof Array)
                ret[_.nodeName].push(content);
            else if (ret[_.nodeName])
                ret[_.nodeName] = [ret[_.nodeName], content];
            else
                ret[_.nodeName] = content;
        });
        
        return ret;
    };

    var objectToXML = function(obj) {
        var ret = '';
        if (obj instanceof Object) {
            ownPropertyNames(obj).forEach(function(p) {
                if (p != '_attributes') {
                    if (obj[p] instanceof Array) {
                        ret += obj[p].map(function(_) { return makeElement(p, _._attributes, objectToXML(_)); })
                                     .join('');
                    } else {
                        ret += makeElement(p, obj[p]._attributes, objectToXML(obj[p]));
                    }
                }
            });
        } else {
            ret = escape('' + obj);
        }
        return ret;
    };

    var makeElement = function(name, attributes, content) {
        var attrs = ownPropertyNames(attributes).map(function(_) { return _ + '="' + escape(attributes[_]) + '"'; });
        return '<' + [name].concat(attrs).join(' ') + '>' + content + '</' + name + '>';
    };

    var escape = function(text) {
        return text.replace('&', '&amp;')
                   .replace('"', '&quot;')
                   .replace("'", '&apos;')
                   .replace('<', '&lt;')
                   .replace('>', '&gt;');
    };

    return {
        toObject: function(doc) {
            var ret = {};
            ret[doc.documentElement.nodeName] = nodeToObject(doc.documentElement);
            return ret;
        },

        toXML: function(obj, version, encoding) {
            var ver = version || '1.0';
            var enc = encoding || 'UTF-8';
            return '<?xml version="' + ver + '" encoding="' + enc + '"?>' + objectToXML(obj);
        }
    };
};