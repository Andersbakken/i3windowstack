/* global require, process */
const i3 = require('i3').createClient();
const pm2 = require('pm2');

var stack = [];
i3.on('window', (w) => {
    if (w.change == 'focus' && (!stack.length || w.container.id != stack[stack.length - 1].con_id)) {
        while (stack.length >= 10)
            stack.splice(0, 1);
        stack.push({con_id: w.container.id, class: w.container.window_properties.class, title: w.container.window_properties.title});
    }
});

process.on('message', (msg) => {
    if (msg.topic == 'process:msg') {
        if (typeof msg.data === 'number') {
            var num;
            if (msg.data < 0) {
                num = stack.length + msg.data;
            } else {
                num = msg.data;
            }
            if (num >= 0 && num < stack.length) {
                i3.command(`[con_id="${stack[num].con_id}"] focus`);
            }
        } else {
            console.error("Bad arg");
            return;
        }
    }
});
