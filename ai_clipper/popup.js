// Popup functionality
let scrapedData = null;
let extractedData = null;
let selectedImages = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const isAuth = await api.isAuthenticated();
  if (!isAuth) {
    window.location.href = 'login.html';
    return;
  }

  // Check if we're on a valid page
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url || '';
    
    // Check if it's a valid URL (http or https)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showInvalidPageError();
      return;
    }
  } catch (error) {
    console.error('Error checking page URL:', error);
    showInvalidPageError();
    return;
  }

  // Initialize UI
  initializeUI();
});

function showInvalidPageError() {
  // Hide the main container content
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 500px;
      padding: 40px;
      text-align: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="94" height="94" viewBox="0 0 24 24" fill="none" stroke="#e07a57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert-icon lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
      <h2 style="font-size: 18px; font-weight: 600; color: #262d3d; margin-bottom: 8px; margin-top: 12px;">
        Invalid Page
      </h2>
      <p style="font-size: 14px; color: #718096; line-height: 1.6;">
        Please, open app in tab with real url.
      </p>
    </div>
  `;
}

function initializeUI() {
  const smartFillBtn = document.getElementById('smartFillBtn');
  const clipBtn = document.getElementById('clipBtn');
  const clearBtn = document.getElementById('clearBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  // Smart fill button
  smartFillBtn.addEventListener('click', handleSmartFill);

  // Clip button
  clipBtn.addEventListener('click', handleClip);

  // Clear button
  clearBtn.addEventListener('click', handleClear);

  // Settings button
  settingsBtn.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
}

async function handleSmartFill() {
  showLoading(true);

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to scrape page
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrapePageData' });

    if (response.success) {
      scrapedData = response.data;

      // Extract image URLs
      const imageUrls = scrapedData.images.map(img => img.url);

      // Send to AI for extraction
      extractedData = await api.extractProductDetails(
        scrapedData.textContent,
        imageUrls
      );

      // Display data in UI
      displayExtractedData(extractedData, scrapedData.url);
    } else {
      showError('Failed to scrape page data');
    }
  } catch (error) {
    console.error('Smart fill error:', error);
    showError(error.message || 'Failed to extract data from page');
  } finally {
    showLoading(false);
  }
}

function displayExtractedData(data, url) {
  console.log('Extracted data from API:', data);
  
  // Fill all form fields with extracted data
  document.getElementById('name').value = data.name || '';
  document.getElementById('supplier_name').value = data.supplier_name || '';
  document.getElementById('description').value = data.description || '';
  document.getElementById('currency').value = data.currency || '';
  document.getElementById('trade_price').value = data.trade_price || '';
  document.getElementById('regular_price').value = data.regular_price || '';
  document.getElementById('materials').value = data.materials || '';
  document.getElementById('dimension').value = data.dimension || '';
  document.getElementById('weight').value = data.weight || '';
  document.getElementById('box_dimension').value = data.box_dimension || '';
  document.getElementById('seat_width').value = data.seat_width || '';
  document.getElementById('seat_depth').value = data.seat_depth || '';
  document.getElementById('seat_height').value = data.seat_height || '';
  document.getElementById('composition').value = data.composition || '';
  document.getElementById('construction').value = data.construction || '';
  document.getElementById('feet').value = data.feet || '';
  document.getElementById('filling').value = data.filling || '';
  document.getElementById('frame').value = data.frame || '';
  document.getElementById('type').value = data.type || '';
  
  // Set checkboxes
  document.getElementById('assembly_required').checked = data.assembly_required || false;
  document.getElementById('removeable_cushion').checked = data.removeable_cushion || false;
  document.getElementById('removeable_legs').checked = data.removeable_legs || false;

  // Set URL
document.getElementById('url').value = url;




  // Display images from API response
  if (data.images && data.images.length > 0) {
    console.log('Displaying images from API response:', data.images);
    displayImages(data.images);
  } else if (scrapedData && scrapedData.images && scrapedData.images.length > 0) {
    // Fallback to scraped images if API doesn't return any
    console.log('No images from API, using scraped images');
    displayImages(scrapedData.images);
  }
}

function displayImages(images) {
  const imageGrid = document.getElementById('imageGrid');
  const imageCount = document.getElementById('imageCount');

  // Clear existing images
  imageGrid.innerHTML = '';

  if (images.length === 0) {
    imageGrid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p>No images found</p>
      </div>
    `;
    imageCount.textContent = '0';
    return;
  }

  // Display images (limit to first 9)
  const displayImagesArray = images.slice(0, 9);
  displayImagesArray.forEach((img) => {
    const imageUrl = typeof img === 'string' ? img : img.url;
    const imageAlt = typeof img === 'string' ? 'Product image' : (img.alt || 'Product image');
    
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.innerHTML = `<img src="${imageUrl}" alt="${imageAlt}">`;
    
    // Toggle selection on click
    imageItem.addEventListener('click', () => {
      imageItem.classList.toggle('selected');
      if (imageItem.classList.contains('selected')) {
        selectedImages.push(imageUrl);
      } else {
        selectedImages = selectedImages.filter(url => url !== imageUrl);
      }
    });

    imageGrid.appendChild(imageItem);
  });

  imageCount.textContent = images.length.toString();

  // Auto-select all images
  selectedImages = displayImagesArray.map(img => typeof img === 'string' ? img : img.url);
  const imageItems = imageGrid.querySelectorAll('.image-item');
  imageItems.forEach(item => item.classList.add('selected'));
}

async function handleClip() {
  // Get user data for supplier_id
  const result = await chrome.storage.local.get(['user']);
  const user = result.user;

  if (!user || !user.studio || !user.studio.id) {
    showError('User profile not found. Please login again.');
    return;
  }

  // Validate required fields
  const name = document.getElementById('name').value.trim();
  if (!name) {
    showError('Please enter a product name');
    return;
  }

  showLoading(true, false); // false = static "Loading..." message

  try {
    // Prepare product data matching API schema
    const productData = {
      name: name,
      description: document.getElementById('description').value.trim() || '',
      currency: document.getElementById('currency').value.trim() || '',
      trade_price: parseFloat(document.getElementById('trade_price').value) || 0,
      regular_price: parseFloat(document.getElementById('regular_price').value) || 0,
      measurement: '', // Not in form, set empty
      is_fav: false,
      materials: document.getElementById('materials').value.trim() || '',
      dimension: document.getElementById('dimension').value.trim() || '',
      weight: document.getElementById('weight').value.trim() || '',
      box_dimension: document.getElementById('box_dimension').value.trim() || '',
      assembly_required: document.getElementById('assembly_required').checked,
      seat_width: document.getElementById('seat_width').value.trim() || '',
      seat_depth: document.getElementById('seat_depth').value.trim() || '',
      seat_height: document.getElementById('seat_height').value.trim() || '',
      composition: document.getElementById('composition').value.trim() || '',
      construction: document.getElementById('construction').value.trim() || '',
      feet: parseInt(document.getElementById('feet').value) || 0,
      filling: document.getElementById('filling').value.trim() || '',
      removeable_cushion: document.getElementById('removeable_cushion').checked,
      removeable_legs: document.getElementById('removeable_legs').checked,
      frame: document.getElementById('frame').value.trim() || '',
      type: document.getElementById('type').value.trim() || '',
      instruction: '', // Not in form, set empty
      supplier_id: extractedData?.supplier?.id || 0, // Get supplier_id from extractedData
      image_urls: selectedImages,
      url: document.getElementById('url').value
    };

    // Save product via API
    const result = await api.saveProduct(productData);

    // Show success with checkmark animation
    showSuccess('Product clipped successfully!');

  } catch (error) {
    console.error('Clip error:', error);
    showLoading(false);
    showError(error.message || 'Failed to save product');
  }
}

function handleClear() {
  // Clear all form fields
  document.getElementById('productForm').reset();
  document.getElementById('url').value = '';

  // Clear images
  const imageGrid = document.getElementById('imageGrid');
  imageGrid.innerHTML = `
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <p>No images yet</p>
    </div>
  `;
  document.getElementById('imageCount').textContent = '0';

  // Reset state
  scrapedData = null;
  extractedData = null;
  selectedImages = [];
}

let loadingInterval = null;

function showLoading(show, animated = true) {
  const overlay = document.getElementById('loadingOverlay');
  const aiText = document.querySelector('.ai-text');
  
  if (show) {
    overlay.classList.add('show');
    
    if (animated) {
      // Start cycling through messages (for Smart Fill)
      const messages = ["Analyzing…", "Generating…"];
      let i = 0;
      
      // Set initial message
      if (aiText) {
        aiText.textContent = messages[0];
      }
      
      // Clear any existing interval
      if (loadingInterval) {
        clearInterval(loadingInterval);
      }
      
      // Start new interval
      loadingInterval = setInterval(() => {
        if (aiText) {
          aiText.textContent = messages[i++ % messages.length];
        }
      }, 1200);
    } else {
      // Static message (for Clip button)
      if (aiText) {
        aiText.textContent = "Loading...";
      }
      
      // Clear any existing interval
      if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
      }
    }
  } else {
    overlay.classList.remove('show');
    
    // Stop cycling
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    
    // Reset to default message
    if (aiText) {
      aiText.textContent = "Loading...";
    }
  }
}

function showError(message) {
  alert('Error: ' + message);
}

function showSuccess(message) {
  const overlay = document.getElementById('loadingOverlay');
  
  // Stop any loading animation
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
  
  // Update overlay to show success
  overlay.innerHTML = `
    <div class="success-checkmark">
      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
      </svg>
    </div>
    <p class="success-text">${message}</p>
  `;
  
  overlay.classList.add('show');
  
  // Hide after 2 seconds and reset form
  setTimeout(() => {
    overlay.classList.remove('show');
    
    // Restore original loading content
    setTimeout(() => {
      overlay.innerHTML = `
        <div class="ai-loader"></div>
        <p class="ai-text">Loading...</p>
      `;
      
      // Reset form after overlay is hidden
      handleClear();
    }, 300); // Wait for fade out
  }, 2000);
}

