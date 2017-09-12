#!/usr/bin/env node

/* global require, process */

const pm2 = require('pm2');
const argv = require('minimist')(process.argv.slice(2));

function sendMessage(pm_id)
{
    // console.log("found", app);
    var arg;
    if (argv.number) {
        arg = parseInt(argv.number);
    } else if (argv.list) {
        arg = "list";
    } else {
        arg = -2;
    }
    pm2.sendDataToProcessId(pm_id, {
        topic: 'process:msg',
        data: arg,
        id: pm_id
    }, function(err, res) {
        pm2.disconnect();
        if (err)
            console.error("got error", err);
    });
}

pm2.connect((err) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    pm2.list((err, processes) => {
        if (err) {
            pm2.disconnect();
            console.error(err);
            process.exit(2);
            return;
        }
        for (let process of processes) {
            if (process.name == "i3windowstack" && process.pm2_env.status == 'online') {
                if (argv.restart) {
                    // console.log("restarting");
                    try {
                        pm2.stop(process.pm_id);
                        setTimeout(start, 1000);
                        return;
                    } catch (err) {
                        // console.log("GOT err", err);
                    }
                } else {
                    sendMessage(process.pm_id);
                    return;
                }
            }
        }

        function start()
        {
            pm2.start({
                script: 'lib/impl.js',
                name: "i3windowstack",
                env: process.env,
                exec_mode: 'fork'
            }, (err, apps) => {
                if (err) {
                    pm2.disconnect();
                    throw err;
                } else {
                    pm2.disconnect();
                }
            });
        }
        start();
    });
});

