var url = "https://docs.google.com/spreadsheets/d/1erUQnjwP14WdJA4pz0xqbkyMOtKMWiVsZmuUEhB4b20/pubhtml"
var g1_url = g1.url.parse(location.href)
var sheets_global

/**
  * hide subset of state cards based on URL param or search param
  * @param {string} val
*/
function toggle_state_cards(val, param) {
  $(".state-card, h4").hide()
  if(param === 'cat') {
    // partial matches of categories should work
    $(".state-card[data-category*='" + val + "']").show()
    $(".state-card[data-category*='" + val + "']").siblings("h4").show()
    $('.events-counter').html($('.state-card[data-category*="'+ val + '"]').length + ' updates')
  } else {
    $('.events-counter').html($(".state-card[data-labeltarget='" + val + "']").length + ' updates')
    $(".state-card[data-labeltarget='" + val + "']").show()
    $(".state-card[data-labeltarget='" + val + "']").siblings("h4").show()
  }
}

/**
  * Prepare the page
  * @param {string} arrange_by
*/
function render_page(arrange_by) {
  $('.events-counter').html(sheets_global.length + ' updates')
  if(arrange_by === 'date') {
    filtered_elements_dates = _.sortBy(
      _.each(sheets_global, function(item) { return item['dt'] = new Date(Number(Date.parse(item.when).toString()))
    }), 'dt').reverse()
    by_date = _.groupBy(filtered_elements_dates, "when")
    data = {data: by_date, _by: 'date'}
  } else {  // state
    by_location = _.groupBy(sheets_global, "City")
    g_sorted = _(by_location).toPairs().sortBy(0).fromPairs().value()
    data = {data: g_sorted, _by: 'City'}
  }
  var tmpl = _.template($("#item-template").html())
  $('#updates').html(tmpl(data))
}

function render_static_content() {
  var tmpl = _.template($("#static-content").html())
  console.log("config", config)
  $("#content").html(tmpl({config: config}))
}

/**
  * fetch data from google spreadsheet
*/
function init(arrange_by) {
  render_static_content()
  Tabletop.init({
    key: url,
    callback: function(sheets_data, tabletop) {
      sheets_global = _.filter(sheets_data, function(each_row) {
        return each_row['Timestamp'] !== undefined;
      })
      render_page()
    },
    simpleSheet: true
  })

  $('body').urlfilter({target: 'pushState'})

  var elems = document.querySelectorAll('.sidenav')
  M.Sidenav.init(elems)
}
window.addEventListener('DOMContentLoaded', init)

// brand font on mobile overflows, this is a hack to identify that and reset the font-size
if (typeof window.orientation !== 'undefined') {
  $('.brand-logo').css('font-size', '4vw')
} else {
  $('.brand-logo').css('font-size', '2.1rem')
}

$('body').on('click', 'a.btn', function() {
  // reset
  $(".state-card, h4").show()
  $('.state-card').siblings("h4").show()
  $("#autocomplete").val('')
  $("[data-label]").removeClass('border-selected')
  $('.events-counter').html($('.state-card').length + ' updates')
  g1_url.update({cat: null, view: null}, 'del')
  history.pushState({}, '', g1_url.toString())
}).on('click', '[data-label]', function() {
  // government orders or welfare measures
  var label = $(this).data("label")
  $("[data-label]").removeClass('border-selected')
  $("#autocomplete").val('')
  $(this).addClass('border-selected')
  toggle_state_cards(label, 'view')
  g1_url.update({view: label, cat: null}, 'view=toggle&cat=del')
  history.pushState({}, '', g1_url.toString())
})
