const fs = require('fs');
const path = require('path');

class Config {
    constructor() {
        this.data = {};
        this.filename = path.resolve(__dirname, 'config.json');
        this.load();
    }

    load() {
        try {
            this.data = JSON.parse(fs.readFileSync(this.filename));
        } catch (error) {
        }
    }

    save() {
        try {
            fs.writeFileSync(this.filename, JSON.stringify(this.data));
        } catch (error) {
        }
    }

    get(name, def) {
        try {
            const names = name.split('.');
            let value = this.data;
            for (const name of names)
                value = value[name];
            return value;
        } catch (error) {
            return def;
        }
    }

    set(name, value) {
        try {
            const names = name.split('.');
            const last = names.pop();
            let owner = this.data;
            for (const name of names)
                owner = owner[name] || (owner[name] = {});
            owner[last] = value;
        } catch (error) {
        }
    }
}

module.exports = new Config();
