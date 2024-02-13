// ==UserScript==
// @name         Wachenhelfer und Einsatzbereitschaft
// @namespace    http://dennis-heinri.ch
// @version      0.1.2
// @description  Schaltet die Statusmeldungen um oder setzt die Personalbesetzungen auf minimum / maximum.
// @author       Dennis Heinrich, CloudMaker
// @match        https://rettungssimulator.online/department/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rettungssimulator.online
// @updateURL    https://github.com/cloudmaker97/Rettungsimulator-Scripts/raw/main/Wachenhelfer%20und%20Einsatzbereitschaft/einsatzbereitschaft.user.js
// @downloadURL  https://github.com/cloudmaker97/Rettungsimulator-Scripts/raw/main/Wachenhelfer%20und%20Einsatzbereitschaft/einsatzbereitschaft.user.js
// @grant        none
// ==/UserScript==

(async function() {
    const STATUS_AVAILABLE_STATION = 2;
    const STATUS_UNAVAILABLE = 6;
    const REQUEST_THROTTLE = 100;

    /* Get the current building */
    function getCurrentBuildingId() {
        return document.querySelector(".detail-header > .detail-title").getAttribute("userdepartmentid");
    }

    /* Get all user vehicles */
    async function getUserVehicles() {
        const userVehiclesResponse = await fetch("https://rettungssimulator.online/api/userVehicles");
        const userVehiclesJson = await userVehiclesResponse.json();
        return userVehiclesJson;
    }

    /* Get all vehicles in a certain building */
    async function getVehiclesForBuilding(buildingId=null) {
        if(buildingId == null) buildingId = getCurrentBuildingId();
        const allVehicles = await getUserVehicles();
        let returnVehicles = [];
        allVehicles.forEach(singleVehicle => {
            if(singleVehicle.userBuildingID == buildingId) {
                returnVehicles.push(singleVehicle);
            }
        });
        console.debug(returnVehicles);
        return returnVehicles;
    }

    /* Set the availability for a certain vehicle by object */
    async function setAvailability(vehicle, isAvailable) {
        // Only when a vehicle is on station, otherwise return to stop execution
        if(!(vehicle.fms == STATUS_AVAILABLE_STATION || vehicle.fms == STATUS_UNAVAILABLE)) return;
        const newVehicleFms = (isAvailable ? 2 : 6);
        // Update visuals
        let statusElement = document.querySelector(`tr[uservehicleid='${vehicle.userVehicleID}'] .status`);
        if(isAvailable) {
            statusElement.classList.remove("s6");
            statusElement.classList.add("s2");
            statusElement.textContent = "2";
        } else {
            statusElement.classList.remove("s2");
            statusElement.classList.add("s6");
            statusElement.textContent = "6";
        }
        await fetch("https://rettungssimulator.online/api/editVehicle", {
            method: "POST",
            body: `userVehicleID=${vehicle.userVehicleID}&fms=${newVehicleFms}`,
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        });
    }

    /* Set the max amount of people on a vehicle for a certain vehicle by object */
    async function setWorkersOnVehicleMax(vehicle, peoples = 9) {
        await fetch("https://rettungssimulator.online/api/editVehicle", {
            method: "POST",
            body: `userVehicleID=${vehicle.userVehicleID}&maxVehiclePersonal=${peoples}`,
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        }).then(async response => {
            if(response.status == 400) {
                await setWorkersOnVehicleMax(vehicle, peoples-1);
            } else {
                updateVehicleWorkerAmountInTable(vehicle, peoples);
            }
        });
    }


    /* Set the min amount of people on a vehicle for a certain vehicle by object */
    async function setWorkersOnVehicleMin(vehicle) {
        await fetch("https://rettungssimulator.online/api/editVehicle", {
            method: "POST",
            body: `userVehicleID=${vehicle.userVehicleID}&maxVehiclePersonal=${vehicle.minPersonal}`,
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        });

        updateVehicleWorkerAmountInTable(vehicle, vehicle.minPersonal, true);
    }

    /* Update the worker amount in the vehicle table */
    function updateVehicleWorkerAmountInTable(vehicle, amount, isMinimum = false) {
        let workerElement = document.querySelector(`tr[uservehicleid='${vehicle.userVehicleID}'] > td:last-child`);

        if(isMinimum) {
            workerElement.innerHTML = `${amount} <span data-tooltip="Benutzerdefiniertes Limit gesetzt. Gehe zum Anpassen zu den Einstellungen des Fahrzeugs."><svg class="svg-inline--fa fa-tag" style="color: #707070; font-size: 11px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tag" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M0 80V229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7H48C21.5 32 0 53.5 0 80zm112 96c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"></path></svg><!-- <i class="fas fa-tag" style="color: #707070; font-size: 11px"></i> --></span>`;
        } else {
            workerElement.innerHTML = amount;
        }
    }

    /* Update all vehicles availabilty in station */
    async function updateVehiclesAvailabilty(available) {
        let currentIteration = 0;
        const vehicles = await getVehiclesForBuilding();
        vehicles.forEach(async (singleVehicle) => {
            setTimeout(async () => {
                await setAvailability(singleVehicle, available);
            }, currentIteration * REQUEST_THROTTLE);
            currentIteration++;
        });
    }

    /* Update all peoples on a vehicle to the minimum */
    async function updateVehiclesMinimumPersonal() {
        let currentIteration = 0;
        const vehicles = await getVehiclesForBuilding();
        vehicles.forEach(async (singleVehicle) => {
            setTimeout(async () => {
                await setWorkersOnVehicleMin(singleVehicle, false);
            }, currentIteration * REQUEST_THROTTLE);
            currentIteration++;
        });
    }

    /* Update all peoples on a vehicle to the maximum */
    async function updateVehiclesMaximumPersonal() {
        let currentIteration = 0;
        const vehicles = await getVehiclesForBuilding();
        vehicles.forEach(async (singleVehicle) => {
            setTimeout(async () => {
                await setWorkersOnVehicleMax(singleVehicle);
            }, currentIteration * REQUEST_THROTTLE);
            currentIteration++;
        });
    }

    /* Create the controls */
    function createExtensionControls() {
        // Do not add for schools
        let headline = document.querySelector("#tab_department_vehicles .tab-headline");
        if(headline.textContent.trim() == "Laufende Lehrgänge") { return };

        const attachToElement = document.querySelector("div.detail-panel > table > tbody");

        let buttonVehicleAvailable = document.createElement("a");
        buttonVehicleAvailable.textContent = "Einsatzbereit";
        buttonVehicleAvailable.addEventListener("click", async () => { await updateVehiclesAvailabilty(true); });

        let buttonVehicleUnavailable = document.createElement("a");
        buttonVehicleUnavailable.textContent = "Außer Dienst";
        buttonVehicleUnavailable.addEventListener("click", async () => { await updateVehiclesAvailabilty(false); });

        let buttonVehiclePersonalMax = document.createElement("a");
        buttonVehiclePersonalMax.textContent = "Maximale Besetzung";
        buttonVehiclePersonalMax.addEventListener("click", async () => { await updateVehiclesMaximumPersonal(); });

        let buttonVehiclePersonalMin = document.createElement("a");
        buttonVehiclePersonalMin.textContent = "Minimale Besetzung";
        buttonVehiclePersonalMin.addEventListener("click", async () => { await updateVehiclesMinimumPersonal(); });

        let tableRow = document.createElement("tr");
        let tableColumnTitle = document.createElement("td");
        let tableColumnActions = document.createElement("td");
        tableColumnActions.style = "gap: .5em; display: flex;";

        const allButtons = [buttonVehicleAvailable, buttonVehicleUnavailable, buttonVehiclePersonalMax, buttonVehiclePersonalMin];
        allButtons.forEach(singleButton => {
            singleButton.classList.add("button", "button-round", "button-success");
            tableColumnActions.appendChild(singleButton);
        });
        tableRow.appendChild(tableColumnTitle);
        tableRow.appendChild(tableColumnActions);
        attachToElement.appendChild(tableRow);

        document.querySelectorAll(".status-big").forEach(el => {
            el.style = "cursor: pointer;";
            el.addEventListener("click", async (el2) => {
                let targetElement = el2.target;
                let pseudoFms = 0;
                if(targetElement.classList.contains("s2")) {
                    pseudoFms = 2;
                } else if (targetElement.classList.contains("s6")) {
                    pseudoFms = 6;
                }
                let vehicleObject = {
                    fms: pseudoFms,
                    userVehicleID: targetElement.parentElement.parentElement.getAttribute("uservehicleid"),
                }
                await setAvailability(vehicleObject, pseudoFms == 2 ? false : true);
            });
        });
    }


    createExtensionControls();
})();