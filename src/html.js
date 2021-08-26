'use strict';

class HtmlBuilder {
    constructor(options = {}) {
        this.prefix = options.prefix;
    }

    make(options) {
        let items;
        let owner;

        if (Array.isArray(options))
            items = options;
        else {
            owner = options.owner;
            if (options.tag) {
                items = options; 
            } else {
                items = options.items;
            }
        }

        this.owner = owner || (owner = this.div = document.createElement('div'));

        this._eSetItems(owner, items);

        return owner;
    }

    replace(owner, items) {
        owner.innerHTML = '';
        this._eSetItems(owner, items);
    }

    getById(value) {
        return this.ids ? this.ids[value] : undefined;
        //const id = this._getId(value);
        //return document.getElementById(id);
    }

    getByName(value) {
        return this.owner ? this.owner.querySelector(`[name='${value}']`) : undefined;
    }

    clear() {
        if (this.div) {
            this.div.remove();
            delete this.div;
            delete this.owner;
        } else {
            if (this.owner) {
                this.owner.replaceChildren();
                delete this.owner;
            }
        }
    }

    _eSetItems(owner, items) {
        if (items) {
            !Array.isArray(items) && (items = [items]);

            for (let src of items) {
                let dst;

                if (typeof src !== 'object')
                    dst = document.createTextNode('' + src);

                else {
                    const tag = src.tag;
                    dst = document.createElement(tag);
                    this._eSetId(dst, src.id);
                    this._eSetTagInit(dst, src);
                    this._eSetItems(dst, src.items);
                    this._eSetTagClose(dst, src);
                    this._eSetClass(dst, src.class);
                    this._eSetStyle(dst, src.style);
                }

                owner.appendChild(dst);
            }

        }
        return owner;
    }

    _getId(value) {
        return this.prefix ? `${this.prefix}:${value}` : value;
    }

    _eSetId(dst, value) {
        if (value) {
            const id = dst.id = this._getId(value);
            (this.ids || (this.ids = [])) && (this.ids[value] = dst);
        }
    }

    _eSetTagInit(dst, src) {
        const rule = this._eTagInit[src.tag];
        rule && rule(dst, src);
    }

    _eSetTagClose(dst, src) {
        const rule = this._eTagClose[src.tag];
        rule && rule(dst, src);
    }

    _eSetStyle(dst, style) {
        if (style) {
            if (typeof style === 'string')
                dst.style.cssText = style;
            else
                for (const name in style)
                    dst.style[name] = style[name];
        }
    }

    _eSetClass(dst, value) {
        value && (dst.className = value);
    }

    _eTagInit = {
        text: (dst, src) => {
            src.text && (dst.data = src.text);
        },
        label: (dst, src) => {
            src.text && (dst.textContent = src.text);
        },
        input: (dst, src) => {
            src.name && (dst.name = src.name);
            src.name && this._eSetId(dst, src.name);
            src.type && (dst.type = src.type);
            src.value && (dst.value = src.value);
            src.placeholder && (dst.placeholder = src.placeholder);
            src.onchange && (dst.onchange = src.onchange);
            src.oninput && (dst.oninput = src.oninput);
        },
        select: (dst, src) => {
            src.name && (dst.name = src.name);
            src.name && this._eSetId(dst, src.name);
            src.value && (dst.value = src.value);
            src.onchange && (dst.onchange = src.onchange);
            src.oninput && (dst.oninput = src.oninput);
        },
        option: (dst, src) => {
            dst.text = src.text ? src.text : src.value;
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

    _eTagClose = {
        select: (dst, src) => {
            src.name && (dst.name = src.name);
            src.name && this._eSetId(dst, src.name);
            src.value && (dst.value = src.value);
        },
    };

}

module.exports = HtmlBuilder;