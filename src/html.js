'use strict';

const rulesBefore = {
    text: (dst, src) => {
        dst.data = src.text;
    },
    label: (dst, src) => {
        src.text && (dst.textContent = src.text);
    },
    input: (dst, src) => {
        src.name && (dst.name = src.name);
        src.type && (dst.type = src.type);
        src.value && (dst.value = src.value);
        src.placeholder && (dst.placeholder = src.placeholder);
        src.onchange && (dst.onchange = src.onchange);
        src.oninput && (dst.oninput = src.oninput);
    },
    select: (dst, src) => {
        dst.name = src.name;
        dst.value = src.value;
        dst.onchange = src.onchange;
        dst.oninput = src.oninput;
    },
    option: (dst, src) => {
        dst.text = src.text;
        src.value !== undefined && (dst.value = src.value);
        src.disabled && (dst.setAttribute('disabled', true));
    },
    form: (dst, src) => {
        dst.onsubmit = src.onsubmit;
    },
    button: (dst, src) => {
        src.text && (dst.textContent = src.text);
        src.type && dst.setAttribute('type', src.type);
        src.onclick && (dst.onclick = src.onclick);
    },
};

const rulesAfter = {
    select: (dst, src) => {
        dst.name = src.name;
        dst.value = src.value;
    },
};


function htmlCreate(parent, items) {
    if (!items) {
        items = parent;
        parent = document.createElement('div');
    }
    !Array.isArray(items) && (items = [items]);
    for (let src of items) {
        if (typeof src !== 'object') {
            const dst = document.createTextNode('' + src);
            parent.appendChild(dst);
            continue;
        }
        
        let rule;

        const dst = document.createElement(src.tag);
        src.id !==undefined && (dst.id = src.id);
        (rule = rulesBefore[src.tag]) && rule(dst, src);

        src.items && htmlCreate(dst, src.items);

        (rule = rulesAfter[src.tag]) && rule(dst, src);

        src.class && (dst.className = src.class);
        if (src.style)
            for (const name in src.style)
                dst.style[name] = src.style[name];
        parent.appendChild(dst);
    }
    return parent;
}


module.exports.htmlCreate = htmlCreate;