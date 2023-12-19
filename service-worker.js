chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        title: "Translate Selection",
        contexts: ["selection"],
        id: "translateContextMenu"
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "translateContextMenu") {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].url.toLowerCase().includes('translate.google.')) {
                    console.log(`Send message to tab id = ${tabs[i].id}`);
                    fillText(tabs[i].id, info.selectionText);
                    focusOnGoogleTranslateTab(tabs[i].id);
                    return;
                }
            }
            console.log('Create a new google translate tab');
            chrome.tabs.create({ url: "https://translate.google.com" }, function (newTab) {
                const listener = function (tabId, changeInfo, tab) {
                    if (tabId === newTab.id && changeInfo.status === "complete") {
                        fillText(newTab.id, info.selectionText);
                        focusOnGoogleTranslateTab(newTab.id);
                        chrome.tabs.onUpdated.removeListener(listener);
                    }
                };
                chrome.tabs.onUpdated.addListener(listener);
            });
        });

        function fillText(tabId, text) {
            chrome.tabs.sendMessage(tabId, { message: "FillInInputField", selection: text });
        }

        function focusOnGoogleTranslateTab(tabId) {
            var updateProperties = { 'active': true };
            chrome.tabs.update(tabId, updateProperties, (tab) => { });
        }
    }
});
