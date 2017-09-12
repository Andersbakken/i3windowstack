#!/usr/bin/env node

/* global require, process */

const pm2 = require('pm2');
const argv = require('minimist')(process.argv.slice(2));
// console.log(argv);
pm2.connect((err) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    pm2.start({
        script: 'lib/impl.js',
        name: "i3windowstack",
        env: process.env,
        exec_mode: 'fork'
    }, (err, apps) => {
        if (err) {
            pm2.disconnect();   // Disconnects from PM2
            throw err;
        } else {
            // console.log(apps);
            for (let app of apps) {
                if (app.name == 'i3windowstack') {
                    // console.log("found", app);
                    var arg;
                    if (argv.number) {
                        arg = parseInt(argv.number);
                    } else if (argv.list) {
                        arg = "list";
                    } else {
                        arg = -1;
                    }
                    pm2.sendDataToProcessId(app.pm_id, {
                        topic: 'process:msg',
                        data: arg,
                        id: app.pm_id
                    }, function(err, res) {
                        pm2.disconnect();   // Disconnects from PM2
                        console.log("GOT STUFF BACK", err, res);
                    });
                    return;
                }
            }
            pm2.disconnect();   // Disconnects from PM2
        }
    });
});

