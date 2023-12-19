console.log('code in content.js');
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(`Got message: ${request.message}`);
    if (request.message === "FillInInputField") {
        const inputField = document.querySelector('.er8xn');
        if (inputField) {
            console.log('Got input field');
            inputField.value = request.selection;
        } else {
            console.log('input field not found');
        }
    }
});
