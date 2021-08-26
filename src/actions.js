'use strict';

const GitLab = require('./gitlab.js');
const HtmlBuilder = require('./html.js');

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

        const html = new HtmlBuilder({ prefix: 'gitlab' });

        html.make(
            {
                tag: 'form', class: 'form-control form-control--outlined', onsubmit,
                items: [
                    {
                        tag: 'div', class: 'pad',
                        items: [
                            {
                                tag: 'label', text: 'Базовый урл:',
                                items: { id: 'host', tag: 'input', type: 'text', placeholder: 'https://gitlab.com', value: config.host, oninput: onHost },
                            },
                            {
                                tag: 'label', text: 'Токен:',
                                items: { id: 'token', tag: 'input', type: 'text', placeholder: 'accessToken123', value: config.token, oninput: onToken },
                            },
                            {
                                tag: 'label', text: 'Id проекта:',
                                items: { id: 'project', tag: 'select', value: config.project, items: projects, oninput: onProject },
                            },
                            {
                                tag: 'label', text: 'Ветка:',
                                items: { id: 'branch', tag: 'select', value: config.branch, items: branches, oninput: onBranch },
                            },
                            {
                                tag: 'label', text: 'Имя файла:',
                                items: { id: 'path', tag: 'input', type: 'text', placeholder: 'insomnia.json', value: config.path, oninput: onPath },
                            },
                            {
                                tag: 'label', text: 'Сообщение для комита (не обязательно):',
                                items: { id: 'message', tag: 'input', type: 'text', value: config.message, oninput: onMessage },
                            },
                        ],
                    },
                    {
                        tag: 'div', class: 'modal__footer',
                        items: [
                            { tag: 'button', type: 'button', class: 'btn', text: 'Новая ветка', onclick: branchNew },
                            { tag: 'button', type: 'submit', class: 'btn', text: 'Сохранить' },
                        ],
                    },
                ],
            }
        );

        await context.app.dialog(`GitLab - Настройки - ${this.models.workspace.name}`, html.owner, {
            skinny: true,
            onHide: () => html.clear(),
        });


        async function onProject() {
            const value = this.value;
            if (value === 'gitlab:projects:reload')
                return await projectReload();
            config.project = value;
            await branchReload();
        }

        async function onBranch() {
            const value = this.value;
            if (value === 'gitlab:branch:reload')
                return await branchReload();
            config.branch = value;
        }

        async function onToken() {
            config.token = this.value;
        }

        async function onHost() {
            config.host = this.value;
        }

        async function onPath() {
            config.path = this.value;
        }

        async function onMessage() {
            config.message = this.value;
        }

        async function onsubmit() {
            config.host = html.getById('host').value;
            config.project = html.getById('project').value;
            config.token = html.getById('token').value;
            config.path = html.getById('path').value;
            config.branch = html.getById('branch').value;
            config.message = html.getById('message').value;

            await self.configSave(config);

            const btn = document.getElementsByClassName('modal__close-btn');
            if (btn.length)
                btn[0].click();
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
            const cursor = document.body.style.cursor;
            try {
                document.body.style.cursor = 'wait';
                const input = html.getById('project');
                const items = await projectList();
                html.replace(input, items);
                input.value = config.project;
            } finally {
                document.body.style.cursor = cursor;
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
            const cursor = document.body.style.cursor;
            try {
                document.body.style.cursor = 'wait';
                const input = html.getById('branch');
                const items = await branchList();
                html.replace(input, items);
                input.value = config.branch;
            } finally {
                document.body.style.cursor = cursor;
            }
        }


        async function branchNew() {
            try {
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
            } catch (e) {
                return;
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