chrome.storage.local.set({ lastTabId: 0 }, function () {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
    }
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        title: "Translate Selection",
        contexts: ["selection"],
        id: "translateContextMenu"
    });
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            if (tab.url.toLowerCase().includes('translate.google.')) {
                chrome.tabs.reload(tab.id);
            }
        });
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "translateContextMenu") {
        chrome.storage.local.set({ lastTabId: tab.id }, function () {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
        });
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

chrome.commands.onCommand.addListener(async function (command) {
    if (command === "go_back") {
        const obj = await chrome.storage.local.get('lastTabId');
        if (obj.lastTabId) {
            console.log(`go back to ${obj.lastTabId}`);
            chrome.tabs.update(obj.lastTabId, { active: true });
            await chrome.storage.local.set({lastTabId: 0});
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
        } else {
            console.log('no lastTab');
        }
    }
});
