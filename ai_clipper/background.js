// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Product Clipper extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeComplete') {
    console.log('Scraping completed:', request.data);
  }
  return true;
});
