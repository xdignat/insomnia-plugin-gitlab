'use strict';

const local = require('./local');
const WorkSpaceActions = require('./actions');
const actions = new WorkSpaceActions();


module.exports.workspaceActions = [
  {
    //label: 'GitLab - Настройки',
    label: local.actions.settings,
    icon: 'fa-gitlab',
    action: async (context, models) => actions.actionSetting(context, models),
  },
  {
    //label: 'GitLab - Получить',
    label: local.actions.pull,
    icon: 'fa-arrow-down',
    action: async (context, models) => actions.actionPull(context, models),
  },
  {
    //label: 'GitLab - Отправить',
    label: local.actions.push,
    icon: 'fa-arrow-up',
    action: async (context, models) => actions.actionPush(context, models),
  },
]
