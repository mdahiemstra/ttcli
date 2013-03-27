const readline = require('readline'),
      clc = require('cli-color'),
      table = require('cli-table'),
      rl = readline.createInterface(process.stdin, process.stdout);

const error = clc.red.bold, warn = clc.yellow, notice = clc.blue;

rl.setPrompt('OHAI » ');
rl.prompt();

const cli_close = function() {
    console.log('Have a great day!');
    process.exit(0);
}

const cli_help = function() {
    var body = 'The commands below are availabe for usage of this time tracking interface.\n\n'
             + '    '+clc.underline('log')+' '+clc.blue('<project> <time> <message>')+' '+ clc.yellow('<date>')+'      log hours to a project, optionally you can specify a date\n'
             + '    '+clc.underline('summary')+' '+clc.blue('<period>')+'                           display a summary of hours this for period '+clc.bold('day/week/month/year')+'\n'
             + '    '+clc.underline('exit')+'                                       exit this application (alias close)'
             + '\n';
    console.log(body);
}

const cli_summary_week = function() {

    var summary_table = new table({
        head: ['Project', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        colWidths: [15, 5, 5, 5, 5, 5]
    });

    summary_table.push(
        ['Speeleiland', '8h', '4h', '', '2h', '5h'],
        ['NDC', '', '4h', '1h', '3h', '5h'],
        ['Mary', '', '', '7h', '5h', ''],
        [clc.green.underline('Total'), '8h', '8h', '8h', '10h', '10h']
    );

    console.log('You have logged %s hours of a %s week', clc.yellow('44h'), clc.yellow('40h'));

    console.log(summary_table.toString());
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
            else if (command == 'summary week')
                cli_summary_week();
            else
                console.log('Say what? I might have heard `%s` but I don\'t know that command!\nType `%s` for a list of commands', warn(command), notice('help'));
        break;
    }

    rl.prompt();
}).on('close', function() {
    cli_close();
});