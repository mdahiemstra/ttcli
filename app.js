const readline = require('readline')
    , clc      = require('cli-color')
    , table    = require('cli-table')
    , mongo    = require('./db')
    , moment   = require('moment')
    , _        = require('underscore')
    , rl       = readline.createInterface(process.stdin, process.stdout)
    , config   = require('./config');

console.log(clc.yellow('Hi %s!'), config.username);

rl.setPrompt('What? » ');
rl.prompt();

function cli_close() {
    console.log('Have a great day!');
    process.exit(0);
}

function cli_help() {
    var body = 'The commands below are availabe for usage of this time tracking interface.\n\n'
             + '    '+clc.underline('log')+' '+clc.blue('<project> <time> <message>')+' '+ clc.yellow('<date>')+'      log hours to a project, optionally you can specify a date\n'
             + '    '+clc.underline('summary')+' '+clc.blue('<period>')+'                           display a summary of hours this for period '+clc.bold('day/week/month/year')+'\n'
             + '    '+clc.underline('exit')+'                                       exit this application (alias close)'
             + '\n';
    console.log(body);
}

function cli_summary(command) {
    const period = command.match(/^summary.(.*)$/).pop();

    if (period === 'day') {
        var summary_table = new table({
            head: ['Project', 'Hours', 'Message']
          , colWidths: [15, 7, 15]
          , style : {compact : true, 'padding-left' : 1}
        });

        var hours_total = 0;

        mongo.Log.find({created: {$gte: moment().subtract('days', 1), $lt: moment().add('days', 1)}}, function (err, docs) {

            _.each(docs, function(record, index) {
                hours_total += parseInt(record.time.replace(/[A-Za-z$-]/g, ""));
                summary_table.push([record.project, record.time, record.message]);
            });

            console.log('You have logged %s hours today (%s)', clc.underline.yellow(hours_total), moment());

            console.log(summary_table.toString());
            rl.prompt();
        });
    } else if (period === 'week') {

        var summary_table = new table({
            head: ['Project', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            colWidths: [15, 5, 5, 5, 5, 5]
        });

        summary_table.push(
            ['Some Project', '8h', '4h', '', '2h', '5h'],
            ['Another project', '', '4h', '1h', '3h', '5h'],
            ['Just a project', '', '', '7h', '5h', ''],
            [clc.green.underline('Total'), '8h', '8h', '8h', '10h', '10h']
        );

        console.log('You have logged %s hours of a %s week', clc.yellow('44h'), clc.yellow('40h'));

        console.log(summary_table.toString());
    } else {
        console.log('summary not available');
    }
}

function cli_log(command) {
    const data = /log\s"(.*)"\sin\s(.*)\sfor\s(.*)/.exec(command).slice(1);

    var entry = new mongo.Log({ project: data[2], time: data[1], message: data[0] });

    entry.save(function (err, res) {
        console.log('Logged %s to %s with message %s', clc.yellow(data[1]), clc.underline(data[2]), clc.italic(data[0]));
        rl.prompt();
    });
}

rl.on('line', function(line) {
    const command = line.trim();

    switch(command) {
        case 'close': case 'exit':
            cli_close();
        break;
        default:
            if (command == '') {
                console.log('Hi there! I did not receive any command from you? Type `%s` for a list of commands', clc.blue('help'));
            } else if (command.match(/^summary.(.*)$/)) {
                cli_summary(command);
            } else if (command.match(/^log."(.*)".in.(.*).for.(.*)$/)) {
                cli_log(command);
            } else {
                // commands without arguments
                try {
                    eval('cli_'+command+'()');
                } catch (e) {
                    console.log('Say what? I might have heard `%s` but I don\'t know that command!\nType `%s` for a list of commands', clc.yellow(command), clc.blue('help'));
                }
            }
        break;
    }

    rl.prompt();
}).on('close', function() {
    cli_close();
});
