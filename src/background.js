chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ isEnabled: false });
  chrome.action.setIcon({ path: "icons/toggle_off.png" });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get('isEnabled', (data) => {
    const newState = !data.isEnabled;
    chrome.storage.sync.set({ isEnabled: newState });
    
    const iconPath = newState ? 'icons/toggle_on.png' : 'icons/toggle_off.png';
    chrome.action.setIcon({ path: iconPath });
    
    chrome.action.setTitle({
      title: newState ? 'Lazy Load Remover (ON)' : 'Lazy Load Remover (OFF)'
    });
    
    chrome.tabs.sendMessage(tab.id, { isEnabled: newState });
  });
});