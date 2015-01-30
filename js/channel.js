downloadCoebotData();
var channelCoebotData = getCoebotDataChannel(channel);
var isHighlightsLoaded = false;

function enableSidebar() {

	$('#navSidebar a.js-sidebar-link').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
        window.location.hash = "#" + $(this).attr("href").substr(5);

        $('#channelSidebarCollapse').collapse('hide');
	});

	$('#navSidebar a.js-sidebar-link').on('shown.bs.tab', function (e) {
		var tab = e.target;

        //TODO functionify tab updates!
        var tabIconHtml = $(tab).children('.sidebar-icon').html();
        var tabTitleHtml = $(tab).children('.sidebar-title').html();

        $(".js-channel-tab-icon").html(tabIconHtml);
        $(".js-channel-tab-title").html(tabTitleHtml);
	});

    $('#navSidebar a.js-sidebar-link[href="#tab_highlights"]').on('show.bs.tab', function (e) {
        if (!isHighlightsLoaded) {
            loadChannelHighlights();
        }
    })
}

function tabContentLoaded() {
    if (window.location.hash != "") {
        var jumpToTab = window.location.hash.substr(1);
        $('#navSidebar a[href="#tab_' + jumpToTab + '"]').click();
    }
}

// channel config data
var channelData = false;
var channelTwitchData = false;
var twitchEmotes = false;
var channelStreamData = false;
var highlightsStats = false;

function downloadChannelData() {
	$.ajax({
		async: false, // it's my json and i want it NOW!
		dataType: "json",
		url: "/configs/" + channel + ".json",
		success: function(json) {
            console.log("Loaded channel data");
			channelData = json;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert("Failed to load channel data!");
			window.location = "/";
		}
	});
}

downloadChannelData();

function displayChannelTitle() {
	var titleHtml = ((channelCoebotData.displayName&&channelCoebotData.displayName=="") ? channel : channelCoebotData.displayName);
    var tabIconHtml = $('#navSidebar a:first-child .sidebar-icon').html();
    var tabTitleHtml = $('#navSidebar a:first-child .sidebar-title').html();
    $(".js-channel-title").html(titleHtml);
    $(".js-channel-tab-icon").html(tabIconHtml);
    $(".js-channel-tab-title").html(tabTitleHtml);
}

function displayChannelOverview() {
    var html = "";
    html += '<p>';
    html += '<a class="btn btn-primary" href="http://www.twitch.tv/';
    html += channel + '" target="_blank"><i class="fa fa-twitch"></i> Twitch</a>';

    if (channelCoebotData.youtube && channelCoebotData.youtube != "") {
        html += ' <a class="btn btn-default" href="http://www.youtube.com/user/';
        html += channelCoebotData.youtube + '" target="_blank"><i class="fa fa-youtube-play"></i> YouTube</a>';
    }

    if (channelCoebotData.twitter && channelCoebotData.twitter != "") {
        html += ' <a class="btn btn-default" href="http://twitter.com/';
        html += channelCoebotData.twitter + '" target="_blank"><i class="fa fa-twitter"></i> Twitter</a>';
    }

    if (channelData.steamID && channelData.steamID != "") {
        html += ' <a class="btn btn-default" href="http://steamcommunity.com/profiles/';
        html += channelData.steamID + '" target="_blank"><i class="fa fa-steam"></i> Steam</a>';
    }

    if (channelData.lastfm && channelData.lastfm != "") {
        html += ' <a class="btn btn-default" href="http://www.last.fm/user/';
        html += channelData.lastfm + '" target="_blank"><i class="fa fa-lastfm"></i> last.fm</a>';
    }

    if (channelData.extraLifeID) {
        html += ' <a class="btn btn-default" href="http://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant&participantID=';
        html += channelData.extraLifeID + '" target="_blank">Extra Life</a>';
    }

    html += '</p>';

    $(".js-channel-overview").html(html);
}

function displayChannelCommands() {
	var tbody = $('.js-commands-tbody');
	var rows = "";
    var shouldSortTable = true;
	for (var i = 0; i < channelData.commands.length; i++) {
		var cmd = channelData.commands[i];
		var row = '<tr class="row-command row-command-access-' + cmd.restriction +'">';
		row += '<td><kbd class="command">' + cmd.key + '</kbd></td>';
        row += '<td class="row-command-col-access" data-order="' + cmd.restriction + '">' + prettifyAccessLevel(cmd.restriction) + '</td>';
        row += '<td>' + prettifyStringVariables(cmd.value) + '</td>';
		row += '<td>' + Humanize.intComma(cmd.count) + '</td>';
		row += '</tr>';
		rows += row;
	}
    if (rows == "") {
        rows = '<tr><td colspan="4" class="text-center">' + EMPTY_TABLE_PLACEHOLDER + '</td></tr>';
        shouldSortTable = false;
    }
	tbody.html(rows);

    if (shouldSortTable) {
        $('.js-commands-table').dataTable({
            "paging": false,
            "info": false
        });
    }
}

function displayChannelQuotes() {
	var tbody = $('.js-quotes-tbody');
	var rows = "";
    var shouldSortTable = true;
	for (var i = 0; i < channelData.quotes.length; i++) {
		var quote = channelData.quotes[i];
		var row = '<tr>';
		row += '<td>' + (i+1) + '</td>';
		row += '<td>' + quote + '</td>';
		row += '</tr>';
		rows += row;
	}
    if (rows == "") {
        rows = '<tr><td colspan="2" class="text-center">' + EMPTY_TABLE_PLACEHOLDER + '</td></tr>';
        shouldSortTable = false;
    }

	tbody.html(rows);


    if (shouldSortTable) {
        $('.js-quotes-table').dataTable({
            "paging": false,
            "info": false
        });
    }
}

function displayChannelAutoreplies() {
    var tbody = $('.js-autoreplies-tbody');
    var rows = "";
    var shouldSortTable = true;
    for (var i = 0; i < channelData.autoReplies.length; i++) {
        var reply = channelData.autoReplies[i];
        var row = '<tr>';
        row += '<td>' + (i+1) + '</td>';
        row += '<td title="RegEx: ' + cleanHtmlAttr(reply.trigger) + '">' + prettifyRegex(reply.trigger) + '</td>';
        row += '<td>' + prettifyStringVariables(reply.response) + '</td>';
        row += '</tr>';
        rows += row;
    }
    if (rows == "") {
        rows = '<tr><td colspan="3" class="text-center">' + EMPTY_TABLE_PLACEHOLDER + '</td></tr>';
        shouldSortTable = false;
    }

    tbody.html(rows);

    if (shouldSortTable) {
        $('.js-autoreplies-table').dataTable({
            "paging": false,
            "info": false,
            "searching": false
        });
    }
}

function displayChannelScheduled() {
    var tbody = $('.js-scheduled-tbody');
    var rows = "";
    var shouldSortTable = true;
    for (var i = 0; i < channelData.scheduledCommands.length; i++) {
        var cmd = channelData.scheduledCommands[i];
        if (cmd.active) {
            var row = '<tr>';
            row += '<td>' + channelData.commandPrefix + cmd.name + '</td>';
            row += '<td><span title="Cron command: ' + cmd.pattern + '">'
            row += prettyCron.toString(cmd.pattern) + '</td>';
            row += '</tr>';
            rows += row;
        }
    }
    for (var i = 0; i < channelData.repeatedCommands.length; i++) {
        var cmd = channelData.repeatedCommands[i];
        if (cmd.active) {
            var row = '<tr>';
            row += '<td>' + channelData.commandPrefix + cmd.name + '</td>';
            row += '<td><span title="Every ' + cmd.delay + ' seconds">Every '
            row += moment().subtract(cmd.delay, 'seconds').fromNow(true) + '</span></td>';
            row += '</tr>';
            rows += row;
        }
    }
    if (rows == "") {
        rows = '<tr><td colspan="2" class="text-center">' + EMPTY_TABLE_PLACEHOLDER + '</td></tr>';
        shouldSortTable = false;
    }
    
    tbody.html(rows);

    if (shouldSortTable) {
        $('.js-scheduled-table').dataTable({
            "paging": false,
            "info": false,
            "searching": false
        });
    }
}

function displayChannelRegulars() {
    var tbody = $('.js-regulars-tbody');
    var rows = "";
    var shouldSortTable = true;
    for (var i = 0; i < channelData.regulars.length; i++) {
        var reg = channelData.regulars[i];
        var row = '<tr>';
        row += '<td class="text-capitalize">' + reg + '</td>';
        row += '</tr>';
        rows += row;
    }
    if (rows == "") {
        rows = '<tr><td colspan="1" class="text-center">' + EMPTY_TABLE_PLACEHOLDER + '</td></tr>';
        shouldSortTable = false;
    }

    tbody.html(rows);

    if (shouldSortTable) {
        $('.js-regulars-table').dataTable();
    }


    var subsinfoText = 'On this channel, ';
    if (channelData.subcriberRegulars) {
        subsinfoText += 'subscribers are automatically given all the same privileges as regulars.';
    } else if (channelData.subsRegsMinusLinks) {
        subsinfoText += 'subscribers are automatically given the same privileges as regulars, except they cannot post links or use the <kbd class="command">urban</kbd> command.';
    } else {
        subsinfoText += 'subscribers do not automatically receive the same privileges as regulars.';
    }

    $('.js-regulars-subsinfo').html(subsinfoText);
}

function displayChannelChatrules() {
    // var html = ""
    // html += '<h3>Banned phrases</h3>'

    if (channelCoebotData.shouldShowOffensiveWords && channelData.filterOffensive) {
    
        var tbody = $('.js-chatrules_offensive-tbody');
        var rows = "";
        var shouldSortTable = true;
        for (var i = 0; i < channelData.offensiveWords.length; i++) {
            var word = channelData.offensiveWords[i];
            var row = '<tr>';
            row += '<td title="RegEx: ' + cleanHtmlAttr(word) + '">' + prettifyRegex(word) + '</td>';
            row += '</tr>';
            rows += row;
        }
        if (rows == "") {
            rows = '<tr><td colspan="1" class="text-center">' + EMPTY_TABLE_PLACEHOLDER + '</td></tr>';
            shouldSortTable = false;
        }
    
        tbody.html(rows);
    
        if (shouldSortTable) {
            $('.js-chatrules_offensive-table').dataTable({
                "paging": false,
                "info": false,
                "searching": false
            });
        }
    } else {
        $('.js-chatrules_offensive').addClass("hidden");
    }

    // console.log(channelData.useFilters);

    if (channelData.useFilters) {

        var miscHtml = '';
        miscHtml += '<h3>Filter rules</h3>';

        if (channelData.filterCaps) {
            miscHtml += '<p>Messages with excessive capital letters will be censored if the message contains at least ' + channelData.filterCapsMinCapitals + ' capital letters and consists more than ' + channelData.filterCapsPercent + '% of capital letters.</p>';
        }
        if (channelData.filterLinks) {
            miscHtml += '<p>All URLs linked to by non-regulars ';
            if (channelData.subscriberRegulars) {
                miscHtml += '(excluding subscribers) ';
            } else {
                miscHtml += '(including subscribers) ';
            }
            miscHtml += ' will be censored.';
            if (channelData.permittedDomains && channelData.permittedDomains.length != 0) {
                miscHtml += ' However, the following domains are exempt from censoring: ';
                miscHtml += Humanize.oxford(channelData.permittedDomains);
            }
            miscHtml += '</p>';
        }
        // if (channelData.filterSymbols) {
        //     miscHtml += '<p>All caps will be filtered if a message contains more than ' + channelData.filterCapsPercent + '% uppercase letters.</p>'
        // }

        $(".js-chatrules_misc").html(miscHtml);
    }


    // $(".js-chatrules-div").html(html);
}


function loadChannelHighlights() {

    $.ajax({
        dataType: "jsonp",
        jsonp: false,
        jsonpCallback: "loadChannelHighlightsCallback",
        url: "http://coebot.tv/highlights/api/stats/" + channel + "&callback=loadChannelHighlightsCallback",
        success: function(json) {
            console.log("Loaded highlights stats");
            highlightsStats = json;
            isHighlightsLoaded = true;
            showChannelHighlights();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Failed to load highlights!");
        }
    });
}

function showChannelHighlights() {

    var tbody = $('.js-highlights-tbody');
    var rows = "";
    var shouldSortTable = true;
    for (var i = 0; i < highlightsStats.streams.length; i++) {
        var strm = highlightsStats.streams[i];
        var row = '<tr>';
        row += '<td>' + strm.title + '</td>';

        var startMoment = moment.unix(strm.start);
        row += '<td title="' + cleanHtmlAttr(startMoment.format('LLLL')) + '">' + startMoment.calendar() + '</td>';

        var durationMoment = moment.duration(strm.duration, 'seconds');
        row += '<td title="' + cleanHtmlAttr(stringifyDuration(durationMoment)) + '">' + durationMoment.humanize() + '</td>';
        row += '<td>' + Humanize.intComma(strm.hlcount) + '</td>';
        row += '</tr>';
        rows += row;
    }
    if (rows == "") {
        rows = '<tr><td colspan="4" class="text-center">' + EMPTY_TABLE_PLACEHOLDER + '</td></tr>';
        shouldSortTable = false;
    }

    tbody.html(rows);

    if (shouldSortTable) {
        $('.js-highlights-table').dataTable({
            "paging": false,
            "info": false
        });
    }

    $('.js-highlights-loading').addClass('hidden');
    $('.js-highlights-table').removeClass('hidden');

}


// turns a Moment.js duration object into a totes professional string
function stringifyDuration(duration) {
    var str = "";

    if (duration.asDays() >= 1) {
        str += Math.floor(duration.asDays()) + " days, ";
        str += duration.hours() + " hours, ";

    } else if (duration.asHours() >= 1) {
        str += Math.floor(duration.asHours()) + " hours, ";
    }
    str += duration.minutes() + " minutes, ";
    str += duration.seconds() + " seconds";

    return str;
}


function prettifyAccessLevel(access) {
    if (access == 0) {
        return "All";
    }
    if (access == 1) {
        if (channelData.subsRegsMinusLinks||channelData.subscriberRegulars) {
            return "Subs";
        } else {
            return "Regs";
        }
    }
    if (access == 2) {
        return "Mods";
    }
    if (access == 3) {
        return "Owners";
    }
}

function colorifyAccessLevel(access) {
    if (access == 0) {
        return "#bdc3c7";
    }
    if (access == 1) {
        return "#8e44ad";
    }
    if (access == 2) {
        return "#27ae60";
    }
    if (access == 3) {
        return "#c0392b";
    }
}

function injectEmoticons(html) {
    html = htmlDecode(html);
    for (var i = 0; i < twitchEmotes.length; i++) {
        var emote = twitchEmotes[i];
        if (emote.state == "active") {
            var pattern = new RegExp(emote.regex);
            html = html.replace(pattern, htmlifyEmote(emote), 'g');
        }
    }
    return html;
}

function htmlDecode(input) {
    return String(input)
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

// generates HTML for an emote
function htmlifyEmote(emote) {
    var html = '';
    html += '<img src="' + emote.url;
    html += '" height="' + emote.height;
    html += '" width="' + emote.width;
    html += '" title="' + emote.regex;
    html += '" class="twitch-emote">';
    return html;
}

// displays info about the Twitch channel on the overview page
function injectTwitchData() {
    var oldHtml = $('.js-channel-overview').html();
    var html = '';
    html += '<p>Views: ' + Humanize.intComma(channelTwitchData.views) + '</p>';
    html += '<p>Followers: ' + Humanize.intComma(channelTwitchData.followers) + '</p>';
    html += '<p>Joined Twitch on ' + moment(channelTwitchData.created_at).format('LL') + '</p>';
    html += oldHtml;
    
    $('.js-channel-overview').html(html);
}

$(document).ready(function() {
    $.ajax({
        dataType: "jsonp",
        jsonp: "callback",
        url: "https://api.twitch.tv/kraken/channels/" + channel,
        success: function(json) {
            console.log("Loaded Twitch channel data");
            channelTwitchData = json;
            injectTwitchData();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Failed to load Twitch channel data!");
        }
    });

    $.ajax({
        cache: true,
        dataType: "jsonp",
        jsonp: "callback",
        url: "https://api.twitch.tv/kraken/chat/" + channel + "/emoticons",
        success: function(json) {
            console.log("Loaded Twitch emotes");
            twitchEmotes = json.emoticons;
            var commandsTbody = $('.js-commands-tbody');
            commandsTbody.html(injectEmoticons(commandsTbody.html()));
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Failed to load Twitch emotes!");
        }
    });

    checkIfLiveChannel();
    setInterval(checkIfLiveChannel, 30000);

    $(".command").prepend('<span class="command-prefix">' + channelData.commandPrefix + '</span>');

    var commandPrefixForUrl = channelData.commandPrefix == '+' ? 'plus' : channelData.commandPrefix;
    $(".js-link-commands").each(function() {
        var href = $(this).attr("href");
        $(this).attr("href", href + "/" + encodeURIComponent(commandPrefixForUrl));
    });
})


function checkIfLiveChannel() {
    checkIfLive(channel, handleChannelIsLive);
}

function handleChannelIsLive(json) {
    if (!json) {
        alert("Failed to load Twitch stream data!");
        channelStreamData = false;
    } else {
        channelStreamData = json.streams;
    }
    updateIsLive(json.streams);
}