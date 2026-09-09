const { isRunningInExpoGo } = require('expo')

if (!isRunningInExpoGo()) {
  require('./widgets/vita-streak-widget-task')
}

require('expo-router/entry')