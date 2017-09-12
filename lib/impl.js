/* global require, process */
const i3 = require('i3').createClient();
const pm2 = require('pm2');

console.log("GOT ENV", process.env);
var stack = [];
i3.on('window', (w) => {
    if (w.change == 'focus') {
        while (stack.length >= 10)
            stack.splice(0, 1);
        stack.push({con_id: w.container.id, class: w.container.window_properties.class, title: w.container.window_properties.title});
        console.log("STACK IS NOW", process.pid, stack);
    }
    console.log('window event!', w);
});

process.on('message', (msg) => {
    console.log("shitty", msg, process.pid);
    if (msg.topic == 'process:msg') {
        console.log("here", typeof msg.data);
        if (typeof msg.data === 'number') {
            console.log("here");
            var num;
            if (msg.data < 0) {
                num = stack.length + msg.data;
            } else {
                num = msg.data;
            }
            console.log("num", num, stack);
            if (num >= 0 && num < stack.length) {
                console.log("balle", "i3.command(", `[con_id="${stack[num].con_id}`, "] focus);");
                i3.command(`[con_id="${stack[num].con_id}"] focus`);
            }
        } else if (msg.data == 'list') {

        } else {
            console.error("Bad arg");
            return;
        }
    }
});
    // console.log("got a message", packet);
 //  process.send({
 //    type : 'process:msg',
 //    data : {
 //     success : true
 //    }
 // });
          // });

// pm2.launchBus(function(err, bus) {
//     bus.on('process:msg', function(e) {
//         console.log("GOT E", e);
//         //do something with your process e
//     });
// });

// process.on('message', (packet) => {
//     console.log("GOT PACKAGE", packet);
//     // process.send({
//     //     type : 'process:msg',
//     //     data : {
//     //         success : true
//     //     }
//     // });
// });
