var logger = function() {
	return {
        log: function(msg) {
            if (console && console.log)
                console.log(msg);
        }
    };
};