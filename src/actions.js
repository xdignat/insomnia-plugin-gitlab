'use strict';

const GitLab = require('./gitlab.js');
const { htmlCreate } = require('./html.js');

class WorkSpaceActions {
    constructor() {
        this.gitlab = new GitLab();
    }

    configKey() {
        return `${this.models.workspace._id}:gitlab_config`;
    }

    async configLoad(context, models) {
        this.prepare(context, models);
        let config;
        try {
            const key = this.configKey();
            config = JSON.parse(await this.context.store.getItem(key));
        } catch (e) { }
        return this.config = { host: '', project: '', token: '', path: 'insomnia.json', branch: 'master', message: '', ...config, };
    }

    async configSave(config) {
        this.config = config;
        const key = this.configKey();
        await this.context.store.setItem(key, JSON.stringify(config));
    }

    prepare(context, models) {
        this.context = context;
        this.models = models;

    }

    async actionSetting(context, models) {
        const self = this;
        const config = await self.configLoad(context, models);
        let projects = await projectList();
        let branches = await branchList();

        const dialog = htmlCreate([
            {
                tag: 'form', class: 'pad', onsubmit,
                items: [
                    {
                        tag: 'div', class: 'form-control form-control--outlined',
                        items: [
                            {
                                tag: 'label', text: 'Базовый урл:',
                                items: { id: 'gitlab:host', tag: 'input', name: 'host', type: 'text', oninput, placeholder: 'https://gitlab.com', value: config.host, },
                            },
                            {
                                tag: 'label', text: 'Токен:',
                                items: { id: 'gitlab:token', tag: 'input', name: 'token', type: 'text', oninput, placeholder: 'accessToken123', value: config.token, },
                            },
                            {
                                tag: 'label', text: 'Id проекта:',
                                items: [{ id: 'gitlab:project', tag: 'select', name: 'project', oninput, value: config.project, items: projects, },],
                            },
                            {
                                tag: 'label', text: 'Ветка:',
                                items: [{ id: 'gitlab:branch', tag: 'select', name: 'branch', oninput, value: config.branch, items: branches, },],
                            },
                            {
                                tag: 'label', text: 'Имя файла:',
                                items: { id: 'gitlab:path', tag: 'input', name: 'path', type: 'text', oninput, placeholder: 'insomnia.json', value: config.path, },
                            },
                            {
                                tag: 'label', text: 'Сообщение для комита (не обязательно):',
                                items: { id: 'gitlab:message', tag: 'input', name: 'message', type: 'text', oninput, value: config.message, },
                            },
                        ],
                    },
                    {
                        tag: 'div', style: { 'display': 'flex' },
                        items: [
                            {
                                tag: 'div', class: 'margin-top', style: { 'display': 'flex', 'flex-direction': 'row', 'flex-basis': '50%', },
                                items: { tag: 'button', type: 'button', text: 'Новая ветка', onclick: branchNew, },
                            },
                            {
                                tag: 'div', class: 'margin-top',
                                style: { 'display': 'flex', 'flex-direction': 'row-reverse', 'flex-basis': '50%', },
                                items: { tag: 'button', type: 'submit', text: 'Сохранить', },
                            },
                        ],
                    },
                ],
            }
        ]);

        await context.app.dialog('GitLab - Настройки', dialog, {
            skinny: false,
            onHide: () => dialog.remove(),
        });


        async function oninput() {
            const { name, value } = this;


            if (name === 'project') {
                if (value === 'gitlab:projects:reload')
                    return await projectReload();
                config.project = value;
                await branchReload();
            }

            if (name === 'branch') {
                if (value === 'gitlab:branch:reload')
                    return await branchReload();
            }

            config[name] = value;
        }

        async function onsubmit() {
            config.host = byName('host').value;
            config.project = byName('project').value;
            config.token = byName('token').value;
            config.path = byName('path').value;
            config.branch = byName('branch').value;
            config.message = byName('message').value;

            await self.configSave(config);

            const btn = document.getElementsByClassName('btn btn--compact modal__close-btn');
            if (btn.length)
                btn[0].click();

        }

        function byName(name) {
            //return dialog.querySelector(`[name='${name}']`);
            return document.getElementById('gitlab:' + name);
        }


        async function projectList() {
            let result = [];
            try {
                const projects = await self.gitlab.projectList({ host: config.host, token: config.token });
                result = projects.map(project => {
                    return {
                        tag: 'option',
                        value: project.id,
                        text: `${project.name} (${project.id})`,
                    };
                });
            } catch (e) {
            }
            return [
                ...result,
                {
                    tag: 'option',
                    disabled: true,
                    style: {
                        'font-size': '1px',
                        'background-color': 'var(--color-font)',
                    },
                    text: '&nbsp;',
                },
                {
                    tag: 'option',
                    value: 'gitlab:projects:reload',
                    text: '< обновить >',
                },
            ];
        }

        async function projectReload() {
            const cursor = dialog.style.cursor;
            try {
                dialog.style.cursor = 'wait';
                const input = byName('project');
                const items = await projectList();
                input.innerHTML = '';
                htmlCreate(input, items);
                input.value = config.project;
            } finally {
                dialog.style.cursor = cursor;
            }
        }

        async function branchList() {
            let result = [];
            try {
                const branches = await self.gitlab.branchList({ host: config.host, token: config.token, project: config.project });
                result = branches.map(value => {
                    return {
                        tag: 'option',
                        value: value,
                        text: value,
                    };
                });
            } catch (e) {
            }
            return [
                ...result,
                {
                    tag: 'option',
                    disabled: true,
                    style: {
                        'font-size': '1px',
                        'background-color': 'var(--color-font)',
                    },
                    text: '&nbsp;',
                },
                {
                    tag: 'option',
                    value: 'gitlab:branch:reload',
                    text: '< обновить >',
                },
            ];

        }

        async function branchReload() {
            const cursor = dialog.style.cursor;
            try {
                dialog.style.cursor = 'wait';
                const input = byName('branch');
                const items = await branchList();
                input.innerHTML = '';
                htmlCreate(input, items);
                input.value = config.branch;
            } finally {
                dialog.style.cursor = cursor;
            }
        }


        async function branchNew() {
            let name = await context.app.prompt(
                `Создать ветку от "${config.branch}"`,
                {
                    label: 'Новая ветка:',
                    defaultValue: 'develop',
                    submitName: 'Подтвердить',
                    cancelable: true,
                }
            );
            if (name && (name = name.trim())) {
                const options = { host: config.host, token: config.token, project: config.project, branch: config.branch, name };
                try {
                    if (config.branch = await self.gitlab.branchNew(options))
                        await branchReload();
                } catch (e) {
                    context.app.alert('GitLab - Ошибка', e);
                }
            }
        }
    }


    // Сохранить коллекцию
    async actionPush(context, models) {
        const config = await this.configLoad(context, models);

        const content = await context.data.export.insomnia({
            includePrivate: false,
            format: 'json',
            workspace: models.workspace,
        });

        let message = config.message;

        while (!message || config.message.trim() === '')
            try {
                message = await context.app.prompt(
                    `GitLab - Сообщение для комита`,
                    {
                        label: 'Сообщение:',
                        defaultValue: '*',
                        submitName: 'Отправить',
                        cancelable: true,
                    }
                );
            } catch (e) {
                return;
            }

        try {
            await this.gitlab.push({
                message,
                content,
                ...config,
            });
            await context.app.alert('GitLab', 'Коллекция успешно сохранена!');
        } catch (e) {
            context.app.alert('GitLab - Ошибка', e.message);
        }
    }

    // Загрузить колекцию
    async actionPull(context, models) {
        const config = await this.configLoad(context, models);

        try {
            const content = await this.gitlab.pull(config);
            //const content = JSON.stringify(file);
            await context.data.import.raw(content);
            await context.app.alert('GitLab', 'Коллекция успешна загружена!');
        } catch (e) {
            context.app.alert('GitLab - Ошибка', e.message);
        }

    }

}

module.exports = WorkSpaceActions;