export function generate(imgURL, displayText) {
    const id = 'img_' + Date.now() + Math.random().toString(36).substr(2, 9)
    return `
        <div style="margin: -15px 0 -11px">
            <span class="name-text" id="name_${id}">${displayText}</span>
            <img src="${imgURL}" 
                 alt="${displayText}" 
                 class="dynamic-image"
                 id="img_${id}"
                 onload="document.getElementById('img_${id}').style.display='block'; document.getElementById('name_${id}').style.display='none'"
                 onerror="this.style.display='none'"
                 style="display:none">
        </div>
    `
}
