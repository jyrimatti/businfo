var domhelper = function(matcher, defaultDirective) {
    var keysToAccessElement = matcher || function(element) {
        var keys = [];
        keys.push(element.nodeName.toLowerCase());
        if (element.nodeName != element.nodeName.toLowerCase())
            keys.push(element.nodeName);
        if (element.id)
            keys.push(element.id);
        if (element.hasAttribute('name'))
            keys.push(element.getAttribute('name'));
        if (element.hasAttribute('data-bind'))
            keys.push(element.getAttribute('data-bind'));
        if (element.classList) {
            for (var c = 0; c < element.classList.length; ++c) {
                keys.push(element.classList.item(c));
            }
        }
        return keys;
    };

    var defaultDirectives = defaultDirective || function(value) {
        return escape(value.toString());
    };

    var toRichElementTree = function(elem) {
        var domtree = function(dataToBind, directives) {
            if (dataToBind) {
                var deepClone = elem.cloneNode(true);
                var wrapper = elem.ownerDocument.createElement('div');
                wrapper.appendChild(deepClone);
                render(toRichElementTree(deepClone), dataToBind, directives);
                return wrapper.innerHTML;
            } else {
                return elem;
            }
        };

        var childProperties = childrenToObject(elem);
        for (var p in childProperties) {
            if (childProperties.hasOwnProperty(p)) {
                domtree[p] = childProperties[p];
            }
        }
        return domtree;
    };

    var childElements = function(node) {
        var ret = [];
        for (var i = 0; i < node.childNodes.length; ++i) {
            var childNode = node.childNodes.item(i);
            if (childNode.nodeType == 1 /* element */)
                ret.push(childNode);
        }
        return ret;
    };

    var childrenToObject = function(element) {
        var ret = {};
        childElements(element).forEach(function(_) {
            var richChildTree = toRichElementTree(_);
            keysToAccessElement(_).forEach(function(key) {
                var previousValue = ret[key];
                if (!previousValue) {
                    ret[key] = richChildTree;
                } else if (previousValue instanceof Array) {
                    previousValue.push(richChildTree);
                } else {
                    ret[key] = [previousValue, richChildTree];
                }
            });
        });
        return ret;
    };

    var renderNode = function(node, data, directives) {
        if (directives instanceof Function)
            node.innerHTML = directives(data);
        else if (!(directives instanceof Object))
            node.innerHTML = directives;
        else
            node.innerHTML = data;
        if (directives instanceof Object)
            for (var prop in directives)
                if (directives.hasOwnProperty(prop))
                    node.setAttribute(prop, directives[prop] instanceof Function ? directives[prop](data) : directives[prop]);
    };

    var render = function(tree, data, directives) {
        var node = tree();
        if (data instanceof Array) {
            for (var j = data.length-1; j >= 0; --j) {
                var newNode;
                if (j < data.length-1) {
                    newNode = node.cloneNode();
                    if (newNode.id) {
                        newNode.id = null;
                    }
                    node.parentNode.insertBefore(newNode, node);
                } else {
                    newNode = node;
                }
                renderNode(newNode, data[j], directives || defaultDirectives);
            }
        } else if (data instanceof Object) {
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    var dataForProperty = data[prop];
                    var rulesForProperty = directives ? directives[prop] : undefined;
                    var matchingChildren = tree[prop];
                    if (matchingChildren) {
                        if (matchingChildren instanceof Array)
                            matchingChildren.forEach(function(_) {
                                render(_, dataForProperty, rulesForProperty || undefined);
                            });
                        else
                            render(matchingChildren, dataForProperty, rulesForProperty || undefined);
                    }
                }
            }
        } else {
            renderNode(node, data, directives || defaultDirectives);
        }
    };

    var escape = function(text) {
        return text.replace('&', '&amp;')
                   .replace('"', '&quot;')
                   .replace("'", '&apos;')
                   .replace('<', '&lt;')
                   .replace('>', '&gt;');
    };

    return {
        process: toRichElementTree
    };
};