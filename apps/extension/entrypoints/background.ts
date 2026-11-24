export default defineBackground(() => {
  // Listen for extension icon click in Chrome toolbar
  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SKIN" });
    } catch {
      // If content script was not already loaded on this tab, inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content-scripts/content.js"],
        });
      } catch (err) {
        console.error("Failed to inject SKIN content script:", err);
      }
    }
  });

  // Handle runtime messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_SKIN_STATUS") {
      sendResponse({ status: "ready" });
    }
    return true;
  });
});
