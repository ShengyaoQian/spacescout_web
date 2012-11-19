var detailsLat, detailsLon;
var requests = new Array();

// Handlebars helpers
Handlebars.registerHelper('carouselimages', function(spacedata) {
    var space_id = spacedata.id;
    var elements = new Array;
    for (i=0; i < spacedata.images.length; i++) {
        image_id = spacedata.images[i].id;
        image_url = "background:url(/space/" + space_id + "/image/" + image_id + "/thumb/constrain/width:500)";
        div_string = "<div class='carousel-inner-image item'><div class='carousel-inner-image-inner' style='" + image_url + "'>&nbsp;</div></div>"
        elements.push(div_string);
    }
    return new Handlebars.SafeString(elements.join('\n'));
});

Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

Handlebars.registerHelper('formatHours', function(hours) {
    //tomorrow_starts_at_midnight = true;
    //tomorrow_is_24_hours =
    //if (start_time[0] == 0 && start_time[1] == 0 && end_time[0] == 23 && end_time[1] == 59 && tomorrow_starts_at_midnight && !tomorrow_is_24_hours && tomorrows_hour > 3) {
        //dsf
    //}
    var formatted = [];
    $.each(hours, function(day) {
        if (hours[day].length > 0) {
            dayMarker = day.charAt(0);
            dayMarker = dayMarker.toUpperCase();
            // Show two characters for Th, Sa, Su
            if (dayMarker == 'T' && day.charAt(1) == 'h' || dayMarker == 'S' && day.charAt(1) == 'a' || dayMarker == 'S' && day.charAt(1) == 'u') {
                dayMarker += day.charAt(1);
            }
            formatted[dayMarker] = to12Hour(hours[day]);
        }
    });
    formatted = sortDays(formatted);
    return new Handlebars.SafeString(formatted.join("<br/>"));
});

function to12Hour(day) {
    var data = [ day[0][0], day[0][1] ];
    for (var i=0; i<data.length; i++) {
        time = data[i].split(":");
        if(time[0]=="23" & time[1] == "59") {
            data[i] = "Midnight";
        }
        else if (time[0] =="12" & time[1] =="00") {
            data[i] = "Noon";
        }else {
            if (time[0] > 12) {
                time[0] -= 12;

                time[1] += "PM";
            }
            else if (time[0] < 1) {
                time[0] = 12;
                time[1] += "AM";
            }
            else {
                time[1] += "AM";
            }
            if (time[1] == "00AM") {
                data[i] = time[0];
                data[i] += "AM";
            } else if (time[1] == "00PM") {
                data[i] = time[0];
                data[i] += "PM"
            }else {
                data[i] = time.join(":");
            }
        }
    }
    if(data[0]=="12AM" & data[1]=="Midnight") {
        return "Open 24 Hours";
    }else {
        return data[0] +" - " +data[1];
    }
}

function sortDays(days) {
    var ordered = [];
    order = ["M", "T", "W", "Th", "F", "Sa", "Su"];
    $.each(order, function(day) {
        if (days[order[day]]) {
            ordered.push(order[day] +": " +days[order[day]] );
        }
    });
    return ordered;
}

function default_open_at_filter() {
    // set the default open_at filter to close to now
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var date = new Date();
    var hour = date.getHours();
    var min = date.getMinutes();

    if (min < 16) {
        min = "00";
    }else if (min < 46) {
        min = "30";
    }else {
        min = "00";
        hour++;
    }

    if (hour > 11) {
        $("#ampm-from").val("PM");
    }else {
        $("#ampm-from").val("AM");
    }
    if (hour > 12) {
        hour = hour-12;
    }
    hour = ""+hour+":"+min;
    $("#day-from").val(weekdays[date.getDay()]);
    $("#hour-from").val(hour);
}

// Found at http://stackoverflow.com/questions/476679/preloading-images-with-jquery
function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
        // Alternatively you could use:
        // (new Image()).src = this;
    });
}

(function(g){

	$(document).ready(function() {

        var pinimgs = ['/static/img/pins/pin00.png', '/static/img/pins/pin01.png'];
        preload(pinimgs);

        // handle changing of the location select
        $('#location_select').change(function() {
            window.default_latitude = $(this).val().split(',')[0];
            window.default_longitude = $(this).val().split(',')[1];
            // in case a new location gets selected before the map loads
            if (window.spacescout_map != null) {
                window.spacescout_map.setCenter(new google.maps.LatLng(window.default_latitude, window.default_longitude));
            }
        });

    	// handle clicking on map centering buttons
        $('#center_all').live('click', function(e){

            e.preventDefault();
            if (window.spacescout_map.getZoom() != window.default_zoom) {
                window.spacescout_map.setZoom(window.default_zoom);
            }
            window.spacescout_map.setCenter(new google.maps.LatLng(window.default_latitude, window.default_longitude));
        });

        // handle clicking on the "done" button for filters
        $("#view_results_button").click(function() {
            $('.count').hide();
            $('.spaces').hide();
            run_custom_search();
        });

        default_open_at_filter();

	});

})(this);

function getSpaceMap(lat, lon) {

  if (window.space_latitude) {
    lat = window.space_latitude
  }

  if (window.space_longitude) {
    lon = window.space_longitude
  }

  var mapOptions = {
    zoom: 17,
    center: new google.maps.LatLng(lat , lon),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false
  }

  var map = new google.maps.Map(document.getElementById("spaceMap"), mapOptions);

  var image = '/static/img/pins/pin00.png';

  var spaceLatLng = new google.maps.LatLng(lat , lon);
  var spaceMarker = new google.maps.Marker({
      position: spaceLatLng,
      map: map,
      icon: image
  });

}

function replaceUrls(){
    // Replace urls in reservation notes with actual links.
    var text = $("#ei_reservation_notes").html();
    var patt = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
    var url = patt.exec(text);
    if (url != null) {
        text = text.replace(url, "<a href='" + url + "'>" + url + "</a>");
        $("#ei_reservation_notes").html(text);
    }
}
