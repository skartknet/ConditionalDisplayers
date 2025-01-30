angular.module("umbraco").controller("Our.Umbraco.ConditionalDisplayers.DropdownController",
    function ($scope, $element, editorState, cdSharedLogic) {

        // Getting the parent umbraco element.
        let parentBlockListBlock = $element[0].closest('umb-block-list-block');
        let parentBlockListItemId = undefined;

        // Setting data-cd-ancestor-id if dropdown placed into blockListItem
        // to hide or show only child elements of it.
        if (parentBlockListBlock) {
            parentBlockListItemId = `dropdown-cd-ancestor-id-${$scope.$id}`;
            parentBlockListBlock.setAttribute('data-cd-ancestor-id', parentBlockListItemId);
        }

        // propertyAlias is used in NestedContent properties. If we find we are in NC we
        // extract the parent alias to find later on only the property belonging to the same item where CD is included.
        if ($scope.model.propertyAlias) {
            var parentPropertyAlias = $scope.model.alias.slice(0, -$scope.model.propertyAlias.length);
        }

        //setup the default config
        var config = {
            items: [],
            multiple: false,
            default: ''
        };

        //map the user config
        angular.extend(config, $scope.model.config);

        //map back to the model
        $scope.model.config = config;

        $scope.runDisplayLogic = function () {
            if (editorState.current.ModelState) {
                //init visible fields
                //legacy
                var itemByValue = _.findWhere(config.items, { value: $scope.model.value })
                var itemBykey = _.findWhere(config.items, { key: $scope.model.value });
                var item = itemByValue || itemBykey;

                if (item) {
                    cdSharedLogic.displayProps(item.show, item.hide, parentPropertyAlias, parentBlockListItemId);
                }
            }
        };

        // update the visible fields on changes from NestedContent
        var formSubmittingUnsubscribe = $scope.$on("formSubmitting", $scope.runDisplayLogic);
        var ncSyncValUnsubscribe = $scope.$on("ncSyncVal", $scope.runDisplayLogic);
        $(document).on("click", ".umb-nested-content__header-bar", $scope.runDisplayLogic)

        function convertArrayToDictionaryArray(model) {
            //now we need to format the items in the dictionary because we always want to have an array
            var newItems = [];
            for (var i = 0; i < model.length; i++) {
                newItems.push({ id: model[i], sortOrder: 0, value: model[i] });
            }

            return newItems;
        }


        function convertObjectToDictionaryArray(model) {
            //now we need to format the items in the dictionary because we always want to have an array
            var newItems = [];
            var vals = _.values($scope.model.config.items);
            var keys = _.keys($scope.model.config.items);

            for (var i = 0; i < vals.length; i++) {
                var label = vals[i].value ? vals[i].value : vals[i];
                newItems.push({ id: keys[i], sortOrder: vals[i].sortOrder, value: label });
            }

            return newItems;
        }



        if (angular.isArray($scope.model.config.items)) {
            //PP: I dont think this will happen, but we have tests that expect it to happen..
            //if array is simple values, convert to array of objects
            if (!angular.isObject($scope.model.config.items[0])) {
                $scope.model.config.items = convertArrayToDictionaryArray($scope.model.config.items);
            }
        }
        else if (angular.isObject($scope.model.config.items)) {
            $scope.model.config.items = convertObjectToDictionaryArray($scope.model.config.items);
        }
        else {
            throw "The items property must be either an array or a dictionary";
        }


        //sort the values
        $scope.model.config.items.sort(function (a, b) { return (a.sortOrder > b.sortOrder) ? 1 : ((b.sortOrder > a.sortOrder) ? -1 : 0); });

        //now we need to check if the value is null/undefined, if it is we need to set it to "" so that any value that is set
        // to "" gets selected by default
        if (!$scope.model.value) {
            if ($scope.model.config.multiple) {
                $scope.model.value = [];
            }
            else {
                $scope.model.value = config.default ?? ''
            }
        }
        $scope.runDisplayLogic();

        $scope.$on("$destroy", function () {
            formSubmittingUnsubscribe();
            ncSyncValUnsubscribe();
            $(document).off("click", ".umb-nested-content__header-bar", $scope.runDisplayLogic);
        });
    });

