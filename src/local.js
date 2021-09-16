'use strict';

const ru = {
    name: 'Русский',
    actions: {
        settings: 'GitLab - Настройки',
        pull: 'GitLab - Получить',
        push: 'GitLab - Отправить',
    },
    error: {
        head: 'GitLab - Ошибка',
    },
    buttons: {
        confirm: 'Подтвердить',
        new_branch: 'Новая ветка',
        save: 'Сохранить',
    },
    settings: {
        head: 'GitLab - Настройки',
        labels: {
            local: 'Язык интерфейса:',
            host: 'Базовый урл:',
            token: 'Токен:',
            project: 'Id проекта:',
            branch: 'Ветка:',
            path: 'Имя файла:',
            message: 'Сообщение для комита (не обязательно):',
        },
        option: {
            reload: '< обновить >',
        },
        alerts: {
            local: 'Для измения языка интерфейса необходимо перезагрузить плагин или программу!',
        },
    },
    new_branch: {
        head: 'Создать ветку от',
        label: 'Новая ветка:',
    },
    push: {
        head:  'GitLab - Сообщение для комита',
        label: 'Сообщение:',
        submit: 'Отправить',
        alert: 'Коллекция успешно сохранена!',
    },
    pull: {
        alert: 'Коллекция успешно загружена!',
    },
};

const en = {
    name: 'English',
    actions: {
        settings: 'GitLab - Settings',
        pull: 'GitLab - Pull',
        push: 'GitLab - Push',
    },
    error: {
        head: 'GitLab - Error',
    },
    buttons: {
        confirm: 'Confirm',
        new_branch: 'New Branch',
        save: 'Save',
    },
    settings: {
        head: 'GitLab - Settings',
        labels: {
            local: 'Interface language:',
            host: 'Base url:',
            token: 'API token:',
            project: 'Project ID:',
            branch: 'Branch:',
            path: 'File name:',
            message: 'Message to commit (optional):',
        },
        option: {
            reload: '< refresh >',
        },
        alerts: {
            local: 'To change the interface language, you need to restart the plugin or program!',
        },
    },
    new_branch: {
        head: 'Create branch from',
        label: 'New Branch:',
    },
    push: {
        head:  'GitLab - Commit Message',
        label: 'Message:',
        submit: 'Send',
        alert: 'Collection saved successfully!',
    },
    pull: {
        alert: 'Collection loaded successfully!',
    },
};

const config = require('./config');

const LOCAL_DEF = 'en';

class Local {
    constructor() {
        this.locals = { en, ru };
        this.load();
    }

    load(value) {
        value || (value = config.get('local') || LOCAL_DEF);
        let local = this.locals[value];
        if (!local) {
            value = LOCAL_DEF;
            local = this.locals[value];
        }
        this.value = value;
        Object.assign(this, local);
    }

    save(value) {
        if (this.value !== value) {
            this.value = value;
            const local = this.locals[value];
            Object.assign(this, local);
            config.set('local', value);
            config.save();
        }
    }
}

module.exports = new Local();
