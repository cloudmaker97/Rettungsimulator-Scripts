// ==UserScript==
// @name         Anrufinformationen ausklappen
// @namespace    http://dennis-heinri.ch
// @version      0.1.0
// @description  Klappt die Anrufinformationen automatisch aus
// @author       Dennis Heinrich, CloudMaker
// @match        https://rettungssimulator.online
// @updateURL    
// @downloadURL  
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rettungssimulator.online
// @grant        none
// ==/UserScript==

(function() {
    'use strict'

    /* Load the style to hide the useless call buttons */
    function addStyleElement() {
        const styleContent = `.card.call > .card-body > .button-group { display: none; }`;
        let styleElement = document.createElement("style");
        styleElement.textContent = styleContent;
        document.head.appendChild(styleElement);
    }

    /* Collapse all present call informations */
    function collapseCallDetails() {
        let callsSlide = document.querySelector(".calls-slide")
        let cardButtons = callsSlide.querySelectorAll("button:not(.button-active)");
        cardButtons.forEach(e => {
            e.click()
        });
    }

    /* Start the script on page load */
    addStyleElement();
    collapseCallDetails();

    /* Collapse when a new call is loaded */
    socket.on("newCall", obj => {
        collapseCallDetails();
    });
})();