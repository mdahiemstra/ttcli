const readline = require('readline')
    , clc      = require('cli-color')
    , table    = require('cli-table')
    , mongo    = require('./db')
    , moment   = require('moment')
    , _        = require('underscore')
    , config   = require('./config')
    , rl       = readline.createInterface(process.stdin, process.stdout);

console.log(clc.yellow('Hi %s!'), config.username);

rl.setPrompt('What? » ');
rl.prompt();

const CLI = {
    log: function(command) {
        const data = /log\s"(.*)"\sin\s(.*)\sfor\s(.*)/.exec(command).slice(1)

        var log_project = data[2]
          , log_time = data[1]
          , log_message = data[0]
          , seconds = 0;

        var t = /^(\d+h)\s(\d+m)|^(\d+h)$|^(\d+m)$/.exec(log_time);

        if (!t) {
            console.log('Invalid time format, allowed format example: %s or %s', clc.yellow('1h'), clc.yellow('1h 30m'));
            return;
        }

        if (t[1] || t[3])
            seconds += (t[1] ? t[1] : t[3]).replace('h', '')*60*60;
        if (t[2] || t[4])
            seconds += (t[2] ? t[2] : t[4]).replace('m', '')*60;

        var entry = new mongo.Log({ project: data[2], time: seconds, message: data[0] });

        entry.save(function (err, res) {
            console.log('Logged %s to %s with message %s', clc.yellow(data[1]), clc.underline(data[2]), clc.bold(data[0]));
            rl.prompt();
        });
    },

    summary: function(command) {
        const period = command.match(/^show\slog\sfor\s(.*)$/).pop();

        if (period === 'today') {
            var summary_table = new table({
                head: [clc.green('Project'), clc.green('Time'), clc.green('Message')]
              , colWidths: [20, 7, 40]
              , style : {compact : true, 'padding-left' : 1}
            });

            var total_time = 0;

            mongo.Log.find({created: {$gte: moment().subtract('days', 1), $lt: moment().add('days', 1)}}, function (err, docs) {

                _.each(docs, function(record, index) {
                    total_time += record.time;
                    var time = moment().hour(0).minute(0).seconds(record.time).format('HH:mm');
                    summary_table.push([record.project, time, record.message]);
                });

                console.log('You have logged %s hours today (%s)'
                          , clc.underline.yellow(moment().hour(0).minute(0).seconds(total_time).format('HH:mm'))
                          , moment());

                console.log(summary_table.toString());
                rl.prompt();
            });
        } else if (period === 'this week') {

            var summary_table = new table({
                head: ['Project', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                colWidths: [15, 7, 7, 7, 7, 7]
            });

            var total_time = 0;
            var total_aday = [0,0,0,0,0];

            mongo.Log.find({created: {$gte: moment().startOf('week'), $lt: moment().endOf('week')}}, function (err, docs) {

                _.each(docs, function(record, index) {
                    total_time += record.time;
                    total_aday[moment(record.created).day()-1] += record.time;

                    var time = moment().hour(0).minute(0).seconds(record.time).format('HH:mm');
                    var log = [record.project, '', '', '', '', ''];
                        log[moment(record.created).day()] = time;

                    summary_table.push(log);
                });

                summary_table.push([clc.green.underline('Total')
                                 , moment().hour(0).minute(0).seconds(total_aday[0]).format('HH:mm')
                                 , moment().hour(0).minute(0).seconds(total_aday[1]).format('HH:mm')
                                 , moment().hour(0).minute(0).seconds(total_aday[2]).format('HH:mm')
                                 , moment().hour(0).minute(0).seconds(total_aday[3]).format('HH:mm')
                                 , moment().hour(0).minute(0).seconds(total_aday[4]).format('HH:mm')]);

                console.log('You have logged %s hours this week'
                          , clc.underline.yellow(moment().hour(0).minute(0).seconds(total_time).format('HH:mm')));

                console.log(summary_table.toString());
                rl.prompt();
            });
        } else {
            console.log('summary not available');
        }
    },

    close: function() {
        console.log('Have a great day!');
        process.exit(0);
    },

    help: function() {

        var body = 'The command line time tracking interface was build for fun.\n'
                 + 'The following commands are available at the moment:\n\n'
                 + 'log "'+clc.blue('<message>')+'" in '+clc.blue('<time>')+' for '+clc.blue('<project>')+'    param '+clc.blue('-s')+' is optional, specifies to search for tickets in thirt-party software\n\n'
                 + 'show log for '+clc.blue('<period>')+'                   generate logs (summaries)\n'
                 + 'Available periods:\n'
                 + '    today\n    this week\n    this month\n    this year\n    yesterday\n    last week\n'
                 + 'e.g. to get a summary for yesterdays log entries type:\n'
                 + '    show log for yesterday\n\n'
                 + 'To display a summary for a date range you can use\n'
                 + '    show log from '+clc.blue('<start>')+' to '+clc.blue('<end>')+'\n\n'
                 + 'help                                    shows this help\n'
                 + 'exit                                    close the cli (close also works)\n'
                 + '\n';

        console.log(body);
    }
}

rl.on('line', function(line) {
    const command = line.trim();

    switch(command) {
        case 'close': case 'exit':
            CLI.close();
        break;
        default:
            if (command == '') {
                console.log('Hi there! I did not receive any command from you? Type `%s` for a list of commands', clc.blue('help'));
            }
            else if (command.match(/^show\slog\sfor\s(.*)$/)) {
                CLI.summary(command);
            }
            else if (command.match(/^log."(.*)".in.(.*).for.(.*)$/)) {
                CLI.log(command);
            }
            else {
                try {
                    eval('CLI.'+command+'()');
                } catch (e) {
                    console.log('Say what? I might have heard `%s` but I don\'t know that command!\nType `%s` for a list of commands', clc.yellow(command), clc.blue('help'));
                }
            }
        break;
    }

    rl.prompt();
}).on('close', function() {
    CLI.close();
});
