var EveSRP;

if (!EveSRP) {
  EveSRP = {}
}

if (! ('ui' in EveSRP)) {
  EveSRP.ui = {}
}

EveSRP.ui.payouts = {

  markPaid: function markPaid(ev) {
    var $form = $(ev.target).closest('form'),
        paidRequest;
    paidRequest = $.ajax( {
      type: 'POST',
      url: $form.attr('action'),
      cache: false,
      data: $form.serialize(),
      success: EveSRP.ui.payouts.renderRequest
    });
    // Update entire list of requests (if within 10 second cooldown period)
    paidRequest.always(EveSRP.ui.payouts.getRequests);
    return false;
  },

  copyUpdate: function copyUpdate(client, args) {
    var $panel = $this.closest('.panel');
    EveSRP.ui.payouts.updateRequest($panel.data('request-id'));
  },

  renderRequest: function renderRequestPayout(request) {
    var $panelList = $('#requests'),
        $panel = $panelList.find('#request-' + request.id),
        //$newPanel = $(Handlebars.templates.payout_panel(request)),
        $copyButtons, $newPanel, $modifiers, $actions, $actionCount,
        $payoutButton, $newActions, $newModifiers, $oldStatus;
    if ($panel.length !== 0) {
      // Update Actions
      $actions = $panel.find('table.actions');
      $actionCount = $panel.find('.action-count');
      $actionCount.text(request.actions.length);
      $newActions = $(Handlebars.templates.payout_actions(request));
      if ($actions.hasClass('in')) {
        $newActions.addClass('in');
      }
      $actions.replaceWith($newActions);
      // Update the payout button text
      $payoutButton = $panel.find('.payout-btn');
      $payoutButton.attr('data-clipboard-text', request.payout_str);
      $payoutButton.text(request.payout_str);
      // Modifers can be hidden/revealed depending on if there are any.
      $modifiers = $panel.find('.modifiers.popover');
      $newModifiers = $(Handlebars.templates.payout_modifiers(request));
      $modifiers.replaceWith($newModifiers);
      if (request.modifiers) {
        $panel.find('dt.modifiers-title').removeClass('hidden');
      } else {
        $panel.find('dt.modifiers-title').addClass('hidden');
      }
      // Update the color of the header and disable buttons when not approved
      if ($panel.hasClass('panel-info')) {
        $oldStatus = 'approved';
      }
      $panel.removeClass('panel-success panel-info panel-warning panel-danger');
      $panel.addClass('panel-' + EveSRP.util.statusColor(request.status));
      // Remove/add clipboard integration
      $copyButtons = $panel.find('.copy-btn');
      if (request.status !== 'approved') {
        $copyButtons.tooltip('destroy');
        EveSRP.ui.clipboardClient.unclip($copyButtons);
        $panel.find('.small-popover').popover('destroy');
      } else if ($oldStatus !== 'approved') {
        EveSRP.ui.clipboardClient.clip($copyButtons);
        $copyButtons.tooltip({trigger: 'manual'});
        $panel.find('.small-popover').on('click', false).popover();
        $('.null-link').on('click', function(ev) {
          ev.preventDefault();
        });
      }
    } else {
      // Brand new request
      $panelList.append(Handlebars.templates.payout_panel(request));
      $panel = $panelList.find('#request-' + request.id);
      $copyButtons = $panel.find('.copy-btn');
      EveSRP.ui.clipboardClient.clip($copyButtons);
      $copyButtons.tooltip({trigger: 'manual'});
      $panel.find('.small-popover').on('click', false).popover();
      $('.null-link').on('click', function(ev) {
        ev.preventDefault();
      });
    }
  },

  getRequests: function getPayoutRequests() {
    var state = History.getState(),
        timeStamp = (new Date).getTime();
    // 7 second cooldown timer between list updates
    if ((timeStamp - EveSRP.ui.payouts.lastRefresh) <
          EveSRP.ui.payouts.refreshDelay) {
      return;
    } else {
      EveSRP.ui.payouts.lastRefresh = timeStamp;
      $.ajax( {
        type: 'GET',
        url: state.url,
        cache: false,
        success: function(data) {
          _.each(data.requests, function(request) {
            EveSRP.ui.payouts.renderRequest(request);
          });
        }
      });
    }
  },

  lastRequested: {},
  updatingRequests: [],

  updateRequest: function updatePayoutRequest(requestID) {
    // Restrict individual updates to every 3 seconds, and only one XHR per
    // request at a time.
    var xhr, currentTime = (new Date).getTime();
    if (_.contains(EveSRP.ui.payouts.updatingRequests, requestID)) {
      console.log(requestID + " is already updating");
      return;
    }
    if (_.has(EveSRP.ui.payouts.lastRequested, requestID)) {
      if (currentTime - EveSRP.ui.payouts.lastRequested[requestID] < 3000) {
        console.log("Skipping refresh of " + requestID);
        return;
      }
    }
    xhr = $.ajax( {
      type: 'GET',
      url: $SCRIPT_ROOT + '/request/' + requestID,
      success: EveSRP.ui.payouts.renderRequest
    });
    xhr.always( function() {
      EveSRP.ui.payouts.updatingRequests = _.without(
        EveSRP.ui.payouts.updatingRequests, requestID);
    });
    EveSRP.ui.payouts.lastRequested[requestID] = currentTime;
    EveSRP.ui.payouts.updatingRequests.push(requestID);
  },

  // Initialize to the parse time. This prevents trying to update the requests
  // immediately after loading the page (if refreshing a scrolled down page).
  lastRefresh: (new Date).getTime(),
  refreshDelay: 7000,

  didScroll: false,

  scrollUpdate: functionScrollUpdate() {
    if (EveSRP.ui.payouts.didScroll) {
      EveSRP.ui.payouts.didScroll = false;
      EveSRP.ui.payouts.infiniteScroll();
      EveSRP.ui.payouts.updateVisible();
    }
  },

  infiniteScroll: function infiniteScroll(ev) {
    var $window = $(window),
        $document = $(document);
    if ($window.scrollTop() > ($document.height() - $window.height() - 300)) {
      EveSRP.ui.payouts.getRequests();
    }
  },

  updateVisible: function updateVisible() {
    var $requestTitles;
    console.log("Updating visible requests");
    $requestTitles = $('.panel-title');
    $requestTitles.each( function(index, element) {
      var $element = $(element)
      if (EveSRP.util.isElementInViewport($element)) {
        console.log("Request " + $element.data('request-id') + " visible");
        EveSRP.ui.payouts.updateRequest(
          $element.closest('.panel').data('request-id'));
      }
    });
  },

  setupEvents: function setupRequestListEvents() {
    var $window = $(window);
    EveSRP.ui.setupClipboard();
    EveSRP.ui.clipboardClient.on('complete', EveSRP.ui.payouts.copyUpdate);
    /* Initialize tooltips */
    $('.copy-btn').tooltip({trigger: 'manual'});
    EveSRP.ui.clipboardClient.on('mouseover', function (ev) {
      $(this).tooltip('show');
    }).on('mouseout', function(ev) {
      $(this).tooltip('hide');
    });
    // Initialize popovers
    $('.small-popover').on('click', false).popover();
    /* Add paid button events */
    $('#requests').on('submit', EveSRP.ui.payouts.markPaid);
    // Watch the history for state changes
    $window.on('statechange', this.getRequests);
    // Prevent default action for Action expansion links. Note, this doesn't
    // prevent bubbling of events, which is used by the collapse extension.
    $('.null-link').on('click', function(ev) {
      ev.preventDefault();
    });
    // Update requests and add more as we scroll through the list
    $window.on('scroll', function(ev) {
      EveSRP.ui.payouts.didScroll = true;
    });
    setInterval(EveSRP.ui.payouts.scrollUpdate, 100);
  }
};
if ($('div#requests').length !== 0) {
  EveSRP.ui.payouts.setupEvents();
}
