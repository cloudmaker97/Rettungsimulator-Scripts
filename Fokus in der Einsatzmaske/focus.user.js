// ==UserScript==
// @name         Fokus in der Einsatzmaske
// @namespace    https://dennis-heinri.ch
// @version      0.1.1
// @description  Zum schnelleren Ausfüllen der Einsatzmaske, fokussiert das erste, sichtbare Feld
// @author       Dennis Heinrich, CloudMaker
// @match        https://rettungssimulator.online
// @match        https://rettungssimulator.online/missionNew/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rettungssimulator.online
// @grant        none
// ==/UserScript==


(async () => {
    let hadFirstFocus = false;
    document.querySelectorAll("input[type=text]").forEach(inputField => {
        if(hadFirstFocus) return;
        let parentElement = inputField.parentElement.parentElement;
        if(parentElement) {
            if(!parentElement.style.display.includes("none")) {
                inputField.focus();
                console.log(inputField)
                hadFirstFocus = true;
            }
            
        }
    });
})();