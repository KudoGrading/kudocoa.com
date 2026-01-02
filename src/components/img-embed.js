export function generate({ imgURL, alt }) {
    const id = 'img_' + Date.now() + Math.random().toString(36).slice(2, 11)
    return `
        <div class="img-embed">
            <span class="name-text" id="name_${id}">${alt}</span>
            <img src="${imgURL}" 
                 alt="${alt}" class="dynamic-image" id="img_${id}"
                 onload="document.getElementById('img_${id}').style.display='block'; document.getElementById('name_${id}').style.display='none'"
                 onerror="this.style.display='none'" style="display:none">
        </div>
    `
}
