(function() {
    console.log('Align Dates Plugin Loaded');

    // Private variables - no longer in global scope
    const processedElements = new Set();
    let timeout = null;
    
    function processH3Elements() {
        document.querySelectorAll('h3').forEach((h3, index) => {
            // Skip if already processed
            const h3Id = h3.textContent.trim() + '-' + index;
            if (processedElements.has(h3Id)) return;
            
            // Date pattern that looks for MM/YYYY at the end, possibly with trailing "- Present" or "- MM/YYYY"
            const datePattern = /(.*?)(?:\s+)(\d{2}\/\d{4}(?:\s*\-\s*(?:Present|\d{2}\/\d{4}))?)$/i;
            const match = h3.textContent.match(datePattern);
            
            if (match) {
                const [_, content, date] = match;
                h3.innerHTML = `<span>${content.trim()}</span><span>${date.trim()}</span>`;
                h3.classList.add('date-aligned'); // Add class for CSS targeting
                processedElements.add(h3Id);
                console.log(`Processed h3: "${content.trim()}" with date "${date.trim()}"`);
            }
        });
    }
    
    // Initial processing
    processH3Elements();
    
    // Create observer
    const observer = new MutationObserver(() => {
        // Clear any existing timeout
        clearTimeout(timeout);
        
        // Set a new timeout to process elements after DOM settles
        timeout = setTimeout(() => {
            console.log("DOM changed, running align-dates");
            processH3Elements();
        }, 100);
    });
    
    // Start observing
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        characterData: false,
        attributes: false
    });
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        observer.disconnect();
    });
})();