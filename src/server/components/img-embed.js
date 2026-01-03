export function generate({ imgURL, alt = '' }) {
    return `
        <div class="img-embed">
            <span class="img-name">${alt}</span>
            <img src="${imgURL}" 
                 alt="${alt}" class="dynamic-img" style="display:none" onerror="this.style.display='none'"
                 onload="this.style.display='block' ; this.previousElementSibling.style.display='none'"
            >
        </div>
    `
}
