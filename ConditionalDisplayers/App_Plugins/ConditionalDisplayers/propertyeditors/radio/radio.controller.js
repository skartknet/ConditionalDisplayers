"use strict";
angular.module("umbraco").controller("Our.Umbraco.ConditionalDisplayers.RadioController", function ($scope, validationMessageService, editorState, cdSharedLogic) {            

        $scope.viewItems = [];

        // propertyAlias is used in NestedContent properties. If we find we are in NC we
        // extract the parent alias to find later on only the property belonging to the same item where CD is included.
        if ($scope.model.propertyAlias) {
            var parentPropertyAlias = $scope.model.alias.slice(0, -$scope.model.propertyAlias.length);
        }

        if(!$scope.model.value && $scope.model.config.default) {
            $scope.model.value = $scope.model.config.default;
        }


        $scope.runDisplayLogic = function () {
            if (editorState.current.ModelState) {
                //init visible fields
                var item = _.findWhere($scope.model.config.items, { value: $scope.model.value });
                if (item) {
                    cdSharedLogic.displayProps(item.show, item.hide, parentPropertyAlias);
                }
            }
        };

        function init() {

            $scope.uniqueId = String.CreateGuid();

            //we can't really do anything if the config isn't an object
            if (Utilities.isObject($scope.model.config.items)) {

                // formatting the items in the dictionary into an array
                $scope.viewItems = [];
                var vals = _.values($scope.model.config.items);
                var keys = _.keys($scope.model.config.items);
                for (var i = 0; i < vals.length; i++) {
                    $scope.viewItems.push({ key: keys[i], value: vals[i].value });
                }
                              
            }

            // Set the message to use for when a mandatory field isn't completed.
            // Will either use the one provided on the property type or a localised default.
            validationMessageService.getMandatoryMessage($scope.model.validation).then(function (value) {
                $scope.mandatoryMessage = value;
            });

            $scope.runDisplayLogic();
        }

        init();
    
});
