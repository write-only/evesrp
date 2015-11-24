jQuery = require 'jquery'
Handlebars = require 'handlebars/runtime'
_ = require 'underscore'
capitalize = require 'underscore.string/capitalize'
sprintf = require 'underscore.string/sprintf'
util = require './util'


csrf = () -> 
    token = jQuery "meta[name='csrf_token']"
    token.attr "content"


capitalizeHelper = (str) ->
    # TODO: I8N-ize, maybe?
    capitalize str


datefmt = (date) ->
    # TODO: I8N-ize
    if typeof date == "string"
        date = new Date date
    day = date.getUTCDate()
    month = util.monthAbbr date.getUTCMonth()
    year = date.getUTCFullYear()
    sprintf "%02d %s %d", day, month, year


timefmt = (date) ->
    # TODO: I8N-ize
    if typeof date == "string"
        date = new Date date
    sprintf "%02d:%02d", date.getUTCHours(), date.getUTCMinutes()


statusColor = (status) ->
    util.statusColor status


compare = (left, right, options) ->
    handlebarsThis = this
    call = (bool) ->
        if bool
            return options.fn handlebarsThis
        else
            return options.inverse handlebarsThis

    op = options.hash.operator ? "==="
    switch op
        # coffeescript converts == to ===
        when "==", "===" then call (left == right)
        when "!=", "!==" then call (left != right)
        when "<" then call (left < right)
        when ">" then call (left > right)
        when "<=" then call (left <= right)
        when ">=" then call (left >= right)
        when "in" then call (left in right)
        when "of" then call (left of right)
        else call (left == right)


count = (collection) ->
    collection.length


transformed = (request, attr) ->
    # TODO: I8N-ize
    if attr of request.transformed
        return new Handlebars.SafeString \
        "<a href=\"#{ request.transformed[attr] }\"
            target=\"_blank\">#{ request[attr] }
         <i class=\"fa fa-external-link\"></i></a>"
    request[attr]


registerHelpers = (handlebars) ->
    handlebars.registerHelper({
        csrf: csrf,
        capitalize: capitalizeHelper,
        datefmt: datefmt,
        timefmt: timefmt,
        status_color: statusColor,
        compare: compare,
        count: count,
        transformed: transformed,
    })
    return handlebars


exports.registerHelpers = registerHelpers