var uihelper = function(options) {
    var defaultOptions = {
        animationDurationMs: 750,
        hiddenClassName: 'hidden',
        hiddenByAnimationClassName: 'hideAnimated'
    };
    for (var p in options)
        if (options.hasOwnProperty(p))
            defaultOptions[p] = options[p];

    var ret = {
        show: function(element) {
            element.classList.remove(defaultOptions.hiddenClassName);
            element.classList.remove(defaultOptions.hiddenByAnimationClassName);
            return element;
        },

        hide: function(element) {
            element.classList.add(defaultOptions.hiddenClassName);
            return element;
        },

        hideAnimated: function(element, onFinished) {
            element.classList.add(defaultOptions.hiddenByAnimationClassName);
            setTimeout(function() {
                ret.hide(element);
                if (onFinished)
                    onFinished();
            }, defaultOptions.animationDurationMs);
            return element;
        },

        visible: function(element) {
            return !ret.hidden(element);
        },

        hidden: function(element) {
            return element.classList.contains(defaultOptions.hiddenClassName);
        }
    };
    return ret;
};