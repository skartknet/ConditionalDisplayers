angular.module('cd.resources', []);

angular.module('umbraco').requires.push('cd.resources');
angular.module('cd.resources').factory('cdSharedLogic', cdSharedLogic);

function cdSharedLogic() {
    return {
        //the properties with alias in 'show' and 'hide' will be affected when the value is triggered.
        displayProps: function (show, hide, parentPropertyAlias, parentBlockListItemId) {
            //Elements to show
            if (show) {
                var showEls = show.split(',');

                if (showEls && showEls.length > 0) {
                    var s = elSelectors(showEls, parentPropertyAlias);
                    $(s).each(function () {

                        // Checking if we have parent-id.
                        if (parentBlockListItemId) {
                            let parent = $(this).closest(`[data-cd-ancestor-id=${parentBlockListItemId}]`)[0];

                            // Checking whether the element belongs to the parent or not.
                            if (parent) {
                                $(this).show("slow");
                            }
                        } else {
                            $(this).show("slow");
                        }
                    });
                }
            }

            if (hide) {
                //Elements to hide
                var hideEls = hide.split(',');

                if (hideEls && hideEls.length > 0) {
                    var h = elSelectors(hideEls, parentPropertyAlias);
                    $(h).each(function () {

                        // Checking if we have parent-id.
                        if (parentBlockListItemId) {
                            let parent = $(this).closest(`[data-cd-ancestor-id=${parentBlockListItemId}]`)[0];

                            // Checking whether the element belongs to the parent or not.
                            if (parent) {
                                $(this).hide("slow");
                            }
                        } else {
                            $(this).hide("slow");
                        }
                    });
                }
            }

            function elSelectors(els, parentPropertyAlias) {
                var h = "";
                let prop;

                for (var i = 0; i < els.length; i++) {
                    if (h !== "") {
                        h += ",";
                    }

                    if (parentPropertyAlias) {
                        prop = "[data-element='property-" + parentPropertyAlias + els[i].trim() + "']";
                    }
                    else {
                        prop = "[data-element='property-" + els[i].trim() + "']";
                    }

                    h += prop;
                }

                return h;
            }
        }
    }
}
