ttcli
=====

yet another time tracking app but this time in a cli written in nodejs

feel free to contribute

How to use
----------
* `log "[message]" in [time] for [project]`    param -s is optional, specifies to search for tickets in thirt-party software

e.g. `log "fixed ticket #RD-129" in 3h for My Project`

* `show log for [period]`                   generate logs (summaries, today, this week, this month, this year, yesterday, last week)

e.g. to get a summary for yesterdays log entries type: `show log for yesterday`

To display a summary for a date range you can use:
`show log from [start] to [end]`

* `help`                                    shows this help
* `exit`                                    `close` the cli (close also works)


![Lol](http://f.cl.ly/items/2l0B421H1v2B3S1L2M3j/Screen%20Shot%202013-04-11%20at%2010.11.38.png)
