// PWA Registration Script for Graceland Royal Academy
// This script registers the service worker and handles PWA installation

(function() {
  'use strict';

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('🎓 GRA Service Worker registered successfully:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 New service worker found, updating...');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('✅ New content available, please refresh');
                  // Optionally show update notification
                  showUpdateNotification();
                } else {
                  console.log('✅ Content cached for offline use');
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Message from Service Worker:', event.data);
    });
  }

  // PWA Install Prompt
  let deferredPrompt = null;
  let installButton = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    console.log('📱 PWA install prompt available');
    
    // Update UI to notify the user they can install the PWA
    showInstallPromotion();
  });

  // Handle PWA installation
  window.addEventListener('appinstalled', (evt) => {
    console.log('🎉 GRA app was installed successfully');
    
    // Hide install promotion
    hideInstallPromotion();
    
    // Log install to analytics (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'app_installed', {
        'event_category': 'pwa',
        'event_label': 'graceland_royal_academy'
      });
    }
  });

  // PWA Installation Functions
  function showInstallPromotion() {
    // Create install button if it doesn't exist
    if (!installButton) {
      installButton = document.createElement('button');
      installButton.textContent = '📱 Install GRA App';
      installButton.className = 'pwa-install-button';
      installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1e40af;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transition: all 0.2s ease;
        display: none;
      `;
      
      installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'scale(1.05)';
      });
      
      installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'scale(1)';
      });
      
      installButton.addEventListener('click', installPWA);
      document.body.appendChild(installButton);
    }
    
    // Show install button on mobile devices
    if (window.innerWidth <= 768) {
      installButton.style.display = 'block';
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (installButton) {
          installButton.style.opacity = '0.7';
        }
      }, 10000);
    }
  }

  function hideInstallPromotion() {
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  async function installPWA() {
    if (!deferredPrompt) {
      console.log('❌ No install prompt available');
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt
      deferredPrompt = null;
      hideInstallPromotion();
      
    } catch (error) {
      console.error('❌ Error during PWA installation:', error);
    }
  }

  function showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e40af;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1001;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 12px;
      ">
        <span>📱 New version available!</span>
        <button onclick="window.location.reload()" style="
          background: white;
          color: #1e40af;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        ">Update</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Later</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Handle network status changes
  function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    console.log(isOnline ? '🌐 Back online' : '📵 Gone offline');
    
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('networktatus', { 
      detail: { isOnline } 
    }));
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Expose PWA functions globally
  window.GRA_PWA = {
    install: installPWA,
    isInstallable: () => !!deferredPrompt,
    isInstalled: () => window.matchMedia('(display-mode: standalone)').matches
  };

  console.log('🎓 Graceland Royal Academy PWA initialized');
})();