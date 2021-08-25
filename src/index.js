'use strict';

const WorkSpaceActions = require('./actions');
const actions = new WorkSpaceActions();


module.exports.workspaceActions = [
  {
    label: 'GitLab - Настройки',
    icon: 'fa-gitlab',
    action: async (context, models) => actions.actionSetting(context, models),
  },
  {
    label: 'GitLab - Получить',
    icon: 'fa-arrow-down',
    action: async (context, models) => actions.actionPull(context, models),
  },
  {
    label: 'GitLab - Отправить',
    icon: 'fa-arrow-up',
    action: async (context, models) => actions.actionPush(context, models),
  },
]
