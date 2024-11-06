// ==UserScript==
// @name         Remove Lazy Load
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically loads images without lazy loading.
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

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
        const images = container.getElementsByTagName('img');
        for (const img of images) {
            processImage(img);
        }
    }

    processContainer(document);

    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.tagName === 'IMG') {
                processImage(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });

    const mutationObserver = new MutationObserver(mutations => {
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
})();
