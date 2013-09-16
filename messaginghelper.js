var messaginghelper = function(messagesElement, ui, options) {
    var defaultOptions = {
        delayMs: 2000,
        escape: true,
        closeEvent: 'swipe'
    };
    for (var p in options)
        if (options.hasOwnProperty(p))
            defaultOptions[p] = options[p];

    var shownMessages = [];

    var ret = {
        addInfo: function(msg, options) { ret.addMsg('info', msg, options); },
        addWarn: function(msg, options) { ret.addMsg('warn', msg, options); },
        addError: function(msg, options) { ret.addMsg('error', msg, options); },

        addInfoOnce: function(msg, options) { ret.addMsgOnce('info', msg, options); },
        addWarnOnce: function(msg, options) { ret.addMsgOnce('warn', msg, options); },
        addErrorOnce: function(msg, options) { ret.addMsgOnce('error', msg, options); },

        addMsg: function(type, msg, options) {
            var opts = {};
            for (var p1 in defaultOptions)
                if (defaultOptions.hasOwnProperty(p1))
                    opts[p1] = defaultOptions[p1];
            for (var p2 in options)
                if (options.hasOwnProperty(p2))
                    opts[p2] = options[p2];

            var newmsg = messagesElement.ownerDocument.createElement('div');
            newmsg.setAttribute('class', type);
            if (opts.escape)
                newmsg.textContent = msg;
            else
                newmsg.innerHTML = msg;
            messagesElement.appendChild(newmsg);

            var close = function() {
                ui.hideAnimated(newmsg, function() { messagesElement.removeChild(newmsg); });
            };
            newmsg.addEventListener(opts.closeEvent, close);
            if (jQuery)
                jQuery(newmsg).on(opts.closeEvent, close);
            setTimeout(close, opts.delayMs);
        },

        addMsgOnce: function(type, msg, options) {
            if (shownMessages.indexOf(msg) == -1) {
                ret.addMsg(type, msg, options);
                shownMessages.push(msg);
            }
        }
    };
    return ret;
};