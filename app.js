const readline = require('readline'),
      clc = require('cli-color'),
      JaguarDb = require('jaguarDb').JaguarDb,
      db = new JaguarDb(),
      rl = readline.createInterface(process.stdin, process.stdout);

const error = clc.red.bold, warn = clc.yellow, notice = clc.blue;

rl.setPrompt('OHAI » ');
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

function cli_summary() {

    const options = command.split(' ');

    if (options[1] == 'week') {

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
        console.log('summary not ready');
    }
}

function cli_log(command) {
    const options = command.split(' ');
    console.log(options);

    db.connect('./db', function(err) {
        if(err) {
            console.log('DB error %s', err);
            return;
        }

        var data = {project: options[1], time: options[2], message: options[3]};
        db.insert(data, function(err, insertedData) {
            console.log(insertedData);
        });
    });
}

rl.on('line', function(line) {

    const command = line.trim();

    switch(command) {
        case 'close': case 'exit':
            cli_close();
        break;
        case 'help':
            cli_help();
        break;
        default:
            if (command == '')
                console.log('Hi there! I did not receive any command from you? Type `%s` for a list of commands', notice('help'));
            else if (command.indexOf('summary') != -1)
                cli_summary_week(command);
            else if (command.indexOf('log') != -1)
                cli_log(command);
            else
                console.log('Say what? I might have heard `%s` but I don\'t know that command!\nType `%s` for a list of commands', warn(command), notice('help'));
        break;
    }

    rl.prompt();
}).on('close', function() {
    cli_close();
});
