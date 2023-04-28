angular.module("umbraco").controller("Our.Umbraco.ConditionalDisplayers.CheckboxController", cdCheckboxController);


function cdCheckboxController($scope, $element, editorState, cdSharedLogic) {
    // Getting the parent umbraco element.
    let parentBlockListBlock = $element[0].closest('umb-block-list-block');
    let parentBlockListItemId = undefined;

    // Setting data-cd-ancestor-id if checkbox placed into blockListItem
    // to hide or show only child elements of it.
    if (parentBlockListBlock) {
        parentBlockListItemId = `checkbox-cd-ancestor-id-${$scope.$id}`;
        parentBlockListBlock.setAttribute('data-cd-ancestor-id', parentBlockListItemId);
    }

    // propertyAlias is used in NestedContent properties. If we find we are in NC we
    // extract the parent alias to find later on only the property belonging to the same item where CD is included.
    if ($scope.model.propertyAlias) {
        var parentPropertyAlias = $scope.model.alias.slice(0, -$scope.model.propertyAlias.length);
    }

    // Define prevalues for labelOff and labelOn
    $scope.labelOff = $scope.model.config.labelOff;
    $scope.labelOn = $scope.model.config.labelOn;

    // Set initial toggle label and visibility based on the showLabels config option
    $scope.toggleLabel = $scope.model.config.showLabels ? $scope.labelOff : "";
    $scope.showLabels = $scope.model.config.showLabels;

    $scope.clicked = function () {
        $scope.renderModel.value = !$scope.renderModel.value;
        // Update the toggle label based on the new value
        $scope.toggleLabel = $scope.showLabels ? ($scope.renderModel.value ? $scope.labelOn : $scope.labelOff) : "";
        $scope.cdToggleEditor.dirty = true;
    };

    $scope.runDisplayLogic = function () {
        if (editorState.current.ModelState) {
            //init visible fields
            if ($scope.renderModel.value) {
                cdSharedLogic.displayProps($scope.model.config.showIfChecked, $scope.model.config.showIfUnchecked, parentPropertyAlias, parentBlockListItemId);
            } else {
                cdSharedLogic.displayProps($scope.model.config.showIfUnchecked, $scope.model.config.showIfChecked, parentPropertyAlias, parentBlockListItemId);
            }
        }
    };

    var renderModelWatchUnsubscribe = $scope.$watch("renderModel.value", function (newVal) {
        $scope.model.value = newVal === true ? "1" : "0";
        // Set Correct Label on first load
        $scope.toggleLabel = $scope.showLabels ? ($scope.model.value === "1" ? $scope.labelOn : $scope.labelOff) : "";
        $scope.runDisplayLogic();
    });

    // update the visible fields on changes from NestedContent
    var formSubmittingUnsubscribe = $scope.$on("formSubmitting", $scope.runDisplayLogic);
    var ncSyncValUnsubscribe = $scope.$on("ncSyncVal", $scope.runDisplayLogic);
    $(document).on("click", ".umb-nested-content__header-bar", $scope.runDisplayLogic)

    function setupViewModel() {
        $scope.renderModel = {
            value: false
        };

        if ($scope.model.config && $scope.model.config.default && $scope.model.config.default.toString() === "1" && $scope.model && !$scope.model.value) {
            $scope.renderModel.value = true;
        }

        if ($scope.model && $scope.model.value && ($scope.model.value.toString() === "1" || $scope.model.value.toLowerCase() === "true")) {
            $scope.renderModel.value = true;
        }

        $scope.runDisplayLogic();
    }


    //here we declare a special method which will be called whenever the value has changed from the server
    //this is instead of doing a watch on the model.value = faster
    $scope.model.onValueChanged = function (newVal, oldVal) {
        //update the display val again if it has changed from the server
        setupViewModel();
    };


    setupViewModel();

    $scope.$on("$destroy", function () {
        renderModelWatchUnsubscribe();
        formSubmittingUnsubscribe();
        ncSyncValUnsubscribe();
        $(document).off("click", ".umb-nested-content__header-bar", $scope.runDisplayLogic);
    });
}
