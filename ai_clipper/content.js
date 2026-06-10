// Content Script - Injected into web pages to scrape data

window.addEventListener("message", (event) => {
  if (
    event.source !== window ||
    event.data?.type !== "CHECK_EXTENSION"
  ) return;

  window.postMessage(
    {
      source: "MY_EXTENSION",
      type: "EXTENSION_INSTALLED",
      version: chrome.runtime.getManifest().version
    },
    "*"
  );
});



// Listen for scrape requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapePageData') {
    try {
      const scrapedData = scrapeCurrentPage();
      sendResponse({ success: true, data: scrapedData });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
});

function scrapeCurrentPage() {
  // Get current page URL
  const url = window.location.href;

  // Extract all text content
  const textContent = extractTextContent();

  // Extract all image URLs
  const images = extractImages();

  return {
    url,
    textContent,
    images,
    title: document.title,
  };
}

function extractTextContent() {
  // Get text content and clean up whitespace as requested
  const text = document.body.innerText
    .replace(/\s+/g, ' ')
    .trim();

  // Limit to reasonable size (first 10000 characters)
  return text.substring(0, 10000);
}

function extractImages() {
  const images = [];
  const imgElements = document.querySelectorAll('img');

  imgElements.forEach(img => {
    const src = img.src;

    // Filter out small images (likely icons/logos)
    if (src && img.naturalWidth > 100 && img.naturalHeight > 100) {
      images.push({
        url: src,
        alt: img.alt || '',
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  });

  // Also check for background images
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    const bgImage = window.getComputedStyle(el).backgroundImage;
    if (bgImage && bgImage !== 'none') {
      const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        const url = urlMatch[1];
        // Avoid duplicates
        if (!images.some(img => img.url === url)) {
          images.push({
            url: url,
            alt: '',
            width: 0,
            height: 0,
          });
        }
      }
    }
  });

  return images;
}
