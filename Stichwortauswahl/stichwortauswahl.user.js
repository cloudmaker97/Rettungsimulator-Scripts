// ==UserScript==
// @name         Stichwortauswahl
// @namespace    https://dennis-heinri.ch
// @version      1.0.0
// @description  Stichwortauswahl in der Einsatzmaske um den Text zu setzen
// @author       Dennis Heinrich, CloudMaker
// @match        https://rettungssimulator.online/missionNew/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rettungssimulator.online
// @updateURL    https://github.com/cloudmaker97/Rettungsimulator-Scripts/raw/main/Stichwortauswahl/stichwortauswahl.user.js
// @downloadURL  https://github.com/cloudmaker97/Rettungsimulator-Scripts/raw/main/Stichwortauswahl/stichwortauswahl.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // The groups and keywords for dispatching
    const emergencyCodes = [
        { name: 'Feuerwehr (Brand)', singleSelect: true, children: [
            { name: 'B1', lifeInDanger: true, isSpacer: false },
            { name: 'B2', lifeInDanger: true, isSpacer: false },
            { name: 'B3', lifeInDanger: true, isSpacer: false },
            { name: 'B4', lifeInDanger: true, isSpacer: false },
            { name: 'BMA', lifeInDanger: false, isSpacer: false },
        ] },
        { name: 'Feuerwehr (Hilfeleistung)', singleSelect: true, children: [
            { name: 'H1', lifeInDanger: true, isSpacer: false },
            { name: 'H2', lifeInDanger: true, isSpacer: false },
            { name: 'H3', lifeInDanger: true, isSpacer: false },
            { name: 'H4', lifeInDanger: true, isSpacer: false },
            { name: 'W', lifeInDanger: true, isSpacer: false },
        ] },
        { name: 'Feuerwehr (Waldbrand)', singleSelect: true, children: [
            { name: 'WB1', lifeInDanger: false, isSpacer: false },
            { name: 'WB2', lifeInDanger: false, isSpacer: false },
            { name: 'WB3', lifeInDanger: false, isSpacer: false },
            { name: 'WB4', lifeInDanger: false, isSpacer: false },
        ] },
        { name: 'Feuerwehr (Gefahrgut)', singleSelect: true, children: [
            { name: 'ABC1', lifeInDanger: false, isSpacer: false },
            { name: 'ABC2', lifeInDanger: false, isSpacer: false },
            { name: 'ABC3', lifeInDanger: false, isSpacer: false },
        ] },
        { name: 'Funktionsfahrzeuge', singleSelect: false, children: [
            { name: 'POL-L', lifeInDanger: false, isSpacer: false },
            { name: 'POL-B', lifeInDanger: false, isSpacer: false },
            { name: 'DLK', lifeInDanger: false, isSpacer: false },
            { name: 'RW', lifeInDanger: false, isSpacer: false },
            { name: 'FWK', lifeInDanger: false, isSpacer: false },
            { name: 'ELW2', lifeInDanger: false, isSpacer: false },
        ] },
        { name: 'Rettungsdienst', singleSelect: false, children: [
            { name: 'RD', lifeInDanger: false, isSpacer: false },
            { name: 'MANV', lifeInDanger: false, isSpacer: false },
        ] },
    ];

    // Important HTML fields for further usage
    let bodyPanel = document.querySelector(".new-mission.panel-body");
    let inputField = document.querySelector("#newMissionNameInput");
    let inputFieldCaller = document.querySelector("#newNameInput");
    let inputFieldExtra = document.querySelector("#newMissionCustomText");

    // Hide a certain input field from the game
    function hideGameInputField(inputField) {
        inputField.parentElement.parentElement.style = "display: none;";
    }

    // Hide the default game fields that aren't needed
    hideGameInputField(inputField);
    hideGameInputField(inputFieldCaller);
    hideGameInputField(inputFieldExtra);

    // Create a new button panel for the keywords and groups
    let buttonPanel = document.createElement("div");
    buttonPanel.style = "margin-bottom: 1em;"
    bodyPanel.prepend(buttonPanel);

    // Create the groups and keywords in the group
    emergencyCodes.forEach(group => {
        // Create a group element
        let codeGroup = document.createElement("div");
        codeGroup.style = "display: flex; gap: .3em; flex-wrap: wrap;"

        // Create a group name element
        let dividerText = document.createElement("p");
        dividerText.style = "min-width: 200px; padding: 0; margin: 0;";
        dividerText.textContent = group.name;
        codeGroup.appendChild(dividerText);

        // Reset all fields inside a group (single-select)
        function resetGroup(codeGroup) {
            let inputFields = codeGroup.querySelectorAll("input");
            let buttons = codeGroup.querySelectorAll("button");
            inputFields.forEach(input => {
                input.removeAttribute("checked");
            });
            buttons.forEach(button => {
                button.classList.remove("button-success");
                button.classList.add("button-gray");
            });
        }

        // Get the active checkbox field
        function getActiveCheckboxFieldInSingleGroup(groupElement) {
            return groupElement.querySelector(`input[type='checkbox']:checked`);
        }

        // Set the generated text for the scene
        function buildText() {
            let outputArray = [];
            let allInputs = buttonPanel.querySelectorAll("input[type='checkbox']");
            allInputs.forEach(input => {
                if(input.checked) {
                    outputArray.push(input.getAttribute('data-name'));
                }
            });
            inputField.value = outputArray.join(', ');
            console.debug(inputField.value);
        }

        // Create a button in a button group
        function createButton(name, group) {
            // Create a button in the group
            let button = document.createElement("button");
            button.classList.add("button", "button-gray");
            button.style = "max-height: 2.5em;";
            button.textContent = name;
            codeGroup.appendChild(button);

            // Create a hidden input field for holding the state
            let checkboxSelected = document.createElement("input");
            checkboxSelected.style = "display: none;"
            checkboxSelected.setAttribute("type", "checkbox");
            checkboxSelected.setAttribute("data-name", name);
            codeGroup.appendChild(checkboxSelected);

            // Add a event listener to toggle the keyword selection
            button.addEventListener("click", () => {
                // Reset the whole group when only single-select is allowed
                let currentSelectedField = getActiveCheckboxFieldInSingleGroup(codeGroup);
                if(group.singleSelect && currentSelectedField != checkboxSelected) {
                    resetGroup(codeGroup);
                }

                // Toggle the hidden input field state
                if(checkboxSelected.getAttribute("checked") == "on") {
                    checkboxSelected.removeAttribute("checked");
                } else {
                    checkboxSelected.setAttribute("checked", "on");
                }

                // Toggle the button style depending on the state
                if(checkboxSelected.checked) {
                    button.classList.remove("button-gray");
                    button.classList.add("button-success");
                } else {
                    button.classList.add("button-gray");
                    button.classList.remove("button-success");
                }

                // Change the text for the dispatch
                buildText();

                // Set focus on the input field: address
                document.querySelector("#newMissionRoadInput").focus();
            })
        }

        // Create the buttons from the array
        group.children.forEach(children => {
            createButton(children.name, group);
            // Add a extra field when life is in danger
            if(children.lifeInDanger) {
                createButton(children.name+"Y", group);
            }
        });

        // Add the keywords group to the dispatch field
        buttonPanel.appendChild(codeGroup);

        // Add a divider after each group
        let dividerElement = document.createElement("hr");
        buttonPanel.appendChild(dividerElement);
    });
})();
