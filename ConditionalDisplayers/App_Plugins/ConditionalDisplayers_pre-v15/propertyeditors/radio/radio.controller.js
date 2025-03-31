"use strict";
angular.module("umbraco").controller("Our.Umbraco.ConditionalDisplayers.RadioController", function ($scope, $element, validationMessageService, editorState, cdSharedLogic) {

    $scope.viewItems = [];

    // Getting the parent umbraco element.
    let parentBlockListBlock = $element[0].closest('umb-block-list-block');
    let parentBlockListItemId = undefined;

    // Setting data-cd-ancestor-id if radio placed into blockListItem
    // to hide or show only child elements of it.
    if (parentBlockListBlock) {
        parentBlockListItemId = `radio-cd-ancestor-id-${$scope.$id}`;
        parentBlockListBlock.setAttribute('data-cd-ancestor-id', parentBlockListItemId);
    }

    // Get Labels Position with a default fallback of 'right'
    $scope.labelsPos = $scope.model.config.labelsPos !== undefined && $scope.model.config.alignHrz === '1' && $scope.model.config.asBtn !== '1' ? "cd-labels-" + $scope.model.config.labelsPos : 'cd-labels-right';

    // propertyAlias is used in NestedContent properties. If we find we are in NC we
    // extract the parent alias to find later on only the property belonging to the same item where CD is included.
    if ($scope.model.propertyAlias) {
        var parentPropertyAlias = $scope.model.alias.slice(0, -$scope.model.propertyAlias.length);
    }

    if (!$scope.model.value && $scope.model.config.default) {
        $scope.model.value = $scope.model.config.default;
    }

     // update the visible fields on changes from NestedContent     
     $(document).on("click", ".umb-nested-content__header-bar", $scope.runDisplayLogic);
 
     $(document).on("click", "umb-tabs-nav", $scope.runDisplayLogic);

    $scope.runDisplayLogic = function () {
        if (editorState.current.ModelState) {
            //init visible fields
            var itemByValue = _.findWhere($scope.model.config.items, { value: $scope.model.value })
            var itemBykey = _.findWhere($scope.model.config.items, { key: $scope.model.value });
            var item = itemByValue || itemBykey;
            if (item) {
                cdSharedLogic.displayProps(item.show, item.hide, parentPropertyAlias, parentBlockListItemId);
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
                $scope.viewItems.push({ id: keys[i], value: vals[i].value, key: vals[i].key || vals[i].value });
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
