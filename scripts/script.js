  var map;
  var infowindow = new google.maps.InfoWindow();
  var markers = [];
  google.maps.Map.prototype.clearMarkers = function() {
	  if (this.markers == null) return;

  };

  $(document).ready(function() {
	  $('#footer-content').hide();
	  $('#footer-expander').click(function () {
		  $('#footer-content').toggle();
	  });
	  $('#username-input').placeHeld();
	  var latlng = new google.maps.LatLng(20, -20);
	  var myOptions = {
		  zoom: 3,
		  center: latlng,
		  mapTypeId: google.maps.MapTypeId.ROADMAP
	  };
	  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	  $("#lookup").click(function () {
		 $("#lookup-form").submit(); 
	  });
	  
	  $("#lookup-form").submit(function () { 
		  username = $('#username-input').val();
		  $("#message").text('Searching for: ' + username + '...');
		  $('.result').remove();

		   for(var i in markers) {
			   markers[i].setMap(null);
		   }
		   this.markers = new Array();

		   $.getJSON(
			   "/lookup", {'username':username}, function(result) {
				   var artistList = '';
				   if (result['failure']) {
					   $("#message").text('Sorry, we couldn\'t find the Last.FM user name: ' + username + '.');
					   return;
				   }
				   $(result).each(function (artistIndex) { 
					  artist = result[artistIndex];
					  if (artist.origin == null) return 1;
					  var origin = artist.origin[0];
					  var geo = origin.geolocation[0];
					  
					   var imageUrl = "http://img.freebase.com/api/trans/image_thumb/"+ artist["/common/topic/image"][0]["id"] +"?maxheight=100&mode=fit&maxwidth=100";

					   $('#results').append('<div class="result"><div class="image-space" style="background:url('+imageUrl + ') center no-repeat"></div><div class="description"><span class="artist">' + artist.name + '</span><span class="origin">'+origin.name + '</span></div></div>');
					  
					  
					  if (geo.latitude == null || geo.longitude == null) return 1;
					  
					  var point = new google.maps.LatLng(geo.latitude, geo.longitude);
					  var contentString = "<b>" + artist.name + "</b>,<br> " + origin.name;
					  var marker = new google.maps.Marker({
						   position: point,
						   title:artist.name,
						   map: map,
						   html: contentString
					  });						  
					  markers[artist.name] = marker;
					  
					  google.maps.event.addListener(marker, 'click', function() {
						  infowindow.setContent(this.html);
						  infowindow.open(map,this);
					  });
					 
				   });
				   $("#message").text('Results for ' + username + '. Found ' + result.length + ' artist origins.' );

			   } 
		   );
		return false;
	});
	
	$('.result').live('click', function() {
		var artistName = $(this).find('.artist').html();
		var marker = markers[artistName];
		infowindow.setContent(marker.html);
		infowindow.open(map, marker);
	});
});