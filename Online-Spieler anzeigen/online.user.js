// ==UserScript==
// @name         Online-Status anzeigen
// @namespace    https://dennis-heinri.ch
// @version      0.1.2
// @description  Zeigt den Online-Status von bestimmten Spielern im Werbefeld an
// @author       Dennis Heinrich, CloudMaker
// @match        https://rettungssimulator.online
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rettungssimulator.online
// @updateURL    https://github.com/cloudmaker97/Rettungsimulator-Scripts/raw/main/Online-Spieler%20anzeigen/online.user.js
// @downloadURL  https://github.com/cloudmaker97/Rettungsimulator-Scripts/raw/main/Online-Spieler%20anzeigen/online.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Settings
    const userConfig = {
        whitelist: ["Keks19222", "Goose"],
        blacklist: ["luftimanu"]
    };

    // Application Constants
    const checkIntervalSeconds = 60;
    const targetElementSelector = "#ad";
    const newElementId = "online-player-list";
    const userAssociations = [];

    // Add an association object for an user
    function addAssociation(playerName, isWhitelist, isOnline) {
        userAssociations[playerName] = {
            playerName: playerName,
            isOnline: isOnline,
            isWhitelist: isWhitelist
        };
    }

    // Get the custom element for the online player list
    function getCustomElement() {
        return document.querySelector(`#${newElementId}`);
    }

    // Create the custom element for the online player list
    function createCustomElement() {
        let masterElement = document.createElement("div");
        masterElement.setAttribute("id", newElementId);
        masterElement.setAttribute("style", "display: flex; flex-direction: column");
        document.querySelector(targetElementSelector).appendChild(masterElement)
    }

    // Get if the user is online or not
    async function isUserOnline(name) {
        const response = await fetch(`https://rettungssimulator.online/profile/${name}`);
        const body = await response.text();
        if(body.includes("label label-danger")) {
            return false;
        } else {
            return true;
        }
    }

    // Update all users in the player list and write it to the association array
    function updateUserList() {
        userConfig.blacklist.forEach(async user => {
            let status = await isUserOnline(user);
            addAssociation(user, false, status);
        });

        userConfig.whitelist.forEach(async user => {
            let status = await isUserOnline(user);
            addAssociation(user, true, status);
        });

    }

    // Update the player list from the association array and put it in the DOM
    function updateCustomElement() {
        let customElement = getCustomElement();
        customElement.innerHTML = "";

        for(let user in userAssociations) {
            let userObject = userAssociations[user];
            let newElement = document.createElement("span");
            newElement.textContent = `${user}`;
            if(userObject.isWhitelist) {
                newElement.style.color = "#1abc9c";
            } else {
                newElement.style.color = "#db1111";
            }
            newElement.style.display = "flex";
            newElement.style.gap = ".4em";
            newElement.style.alignItems = "center";

            let onlineDot = document.createElement("div");
            onlineDot.style.height = "10px";
            onlineDot.style.width = "10px";
            onlineDot.style.borderRadius = "50%";
            if(userObject.isOnline) {
                onlineDot.style.backgroundColor = "green";
            } else {
                onlineDot.style.backgroundColor = "red";
            }
            newElement.appendChild(onlineDot);
            customElement.appendChild(newElement);
        }
    }

    createCustomElement();
    updateUserList();
    setInterval(function() {
        updateCustomElement();
    }, 1000);
    setInterval(function() {
        updateUserList();
    }, checkIntervalSeconds*1000);
})();