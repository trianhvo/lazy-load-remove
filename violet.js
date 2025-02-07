// ==UserScript==
// @name         Lazy Load Remover
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Remove lazy loading from images with a toggle button
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isEnabled = false;
    let imageObserver = null;
    let mutationObserver = null;

    const LAZY_LOAD_ATTRIBUTES = [
        'data-original',
        'data-src',
        'data-lazy',
        'data-srcset',
        'data-load-src',
        'loading',
        'lazy',
        'file'
    ];

    function processImage(img) {
        if (!isEnabled) return;

        if (img.getAttribute('loading') === 'lazy') {
            img.removeAttribute('loading');
        }

        for (const attr of LAZY_LOAD_ATTRIBUTES) {
            const url = img.getAttribute(attr);
            if (url && !url.startsWith('data:') && url !== img.src) {
                img.src = url;
                const srcset = img.getAttribute('data-srcset');
                if (srcset) {
                    img.srcset = srcset;
                }
                img.classList.remove('lazy', 'lazyload');
                break;
            }
        }
    }

    function processContainer(container) {
        if (!isEnabled) return;

        const images = container.getElementsByTagName('img');
        for (const img of images) {
            processImage(img);
        }
    }

    function setupObservers() {
        if (imageObserver) {
            imageObserver.disconnect();
        }
        if (mutationObserver) {
            mutationObserver.disconnect();
        }

        if (!isEnabled) return;

        const observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.tagName === 'IMG') {
                    processImage(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('img').forEach(img => {
            imageObserver.observe(img);
        });

        mutationObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.tagName === 'IMG') {
                                processImage(node);
                                imageObserver.observe(node);
                            } else {
                                const images = node.getElementsByTagName('img');
                                for (const img of images) {
                                    processImage(img);
                                    imageObserver.observe(img);
                                }
                            }
                        }
                    });
                }
            });
        });

        mutationObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function toggleLazyLoadRemover() {
        isEnabled = !isEnabled;
        if (isEnabled) {
            processContainer(document);
            setupObservers();
            toggleButton.style.backgroundColor = "#4CAF50"; // Green when ON
        } else {
            if (imageObserver) imageObserver.disconnect();
            if (mutationObserver) mutationObserver.disconnect();
            toggleButton.style.backgroundColor = "#f44336"; // Red when OFF
        }
    }

    // Add toggle button
    const toggleButton = document.createElement("button");
    toggleButton.innerText = "Lazy Load Remover";
    toggleButton.style.position = "fixed";
    toggleButton.style.bottom = "20px";
    toggleButton.style.right = "20px";
    toggleButton.style.zIndex = "9999";
    toggleButton.style.padding = "10px";
    toggleButton.style.border = "none";
    toggleButton.style.borderRadius = "5px";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.backgroundColor = "#f44336"; // Red (OFF)
    toggleButton.style.color = "white";
    toggleButton.style.fontSize = "14px";
    document.body.appendChild(toggleButton);
    
    toggleButton.addEventListener("click", toggleLazyLoadRemover);
})();
