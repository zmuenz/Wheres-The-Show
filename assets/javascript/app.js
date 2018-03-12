$(document).ready(function () {
	$('select').formSelect();
	$('.datepicker').datepicker();

	// Collapses modal
	$('.modal').modal();

	$('#modalTrigger').on('click', function () {
		$('#modal1').modal('open');
	});

	// Collapsible for main content
	$('.collapsible').collapsible();

	// For Parallax BKG
	$('.parallax').parallax();
});

$("#copyright-year").text(moment().year());


$('#btn-primary').on('shown.bs.modal', function () {

	$('#myInput').focus();
});

var artistArray = [];
var youtubeKey = "AIzaSyD507r0h_zioKfSsE3U407o7pwH85aK3pg";
var ticketmasterKey = "GMb9kWGBfHFrWOyKbZNww60Bsf54F5LU";
var userLocation = "empty";
var ticketmasterQuery = "";
var reqLocation = "";
var cityInput  = document.getElementById('location');
var autocomplete = new google.maps.places.Autocomplete(cityInput, {types: ['geocode']});
var lat = "";
var long = "";

google.maps.event.addListener(autocomplete, 'place_changed', function() {
	reqLocation = autocomplete.getPlace();
	lat = reqLocation.geometry.location.lat();
	lng = reqLocation.geometry.location.lng();
})

// function logPosition(o) {
// 	userLocation = o;
// 	console.log(userLocation);
// }

// function logError(o) {
// 	console.log("failed to get user location");
// }

// navigator.geolocation.getCurrentPosition(logPosition, logError);

$("#add_artist").on('click', function (event) {
	event.preventDefault();
	reqLocation = $("#location").val().trim();
	reqLocation = reqLocation.replace(/\s+/g, "+");
	var date = $("#date").val();
	var startDate = moment(date).format('YYYY-MM-DD') + "T00:00:00Z";
	var endDate = moment(date).add(7, 'days').format('YYYY-MM-DD') + "T00:00:00Z"
	console.log(date);
	if (userLocation === "empty" || reqLocation !== "") {
		ticketmasterQuery = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=" + ticketmasterKey + "&classificationName=music&latlong=" + lat + "," + lng + "&radius=30&startDateTime=" + startDate + "&endDateTime=" + endDate + "&size=50&sort=date,desc";
	}
	else {
		ticketmasterQuery = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=" + ticketmasterKey + "&latlong=" + userLocation.coords.latitude + "," + userLocation.coords.longitude + "&radius=50&classificationName=music&startDateTime=" + startDate + "&endDateTime=" + endDate + "&size=50&sort=date,desc";
	}

	console.log(ticketmasterQuery);

	$.ajax({
		url: ticketmasterQuery,
		method: 'GET'
	}).then(function (object) {
		console.log(object);
		for (var i = 0; i < object._embedded.events.length; i++) {
			var event = object._embedded.events[i].name;
			//var artist = object._embedded.events[i]._embedded.attractions[0].name;
			// console.log("Artist Name: " + artist);
			var artistForSearch = event.replace(/\s+/g, "+");
			var newArtist = {
				eventName: event,
				artistName: event,
				artistSearch: event.replace(/\s+/g, "+") + "+music",
				eventDate: object._embedded.events[i].dates.start.localDate,
				eventTime: object._embedded.events[i].dates.start.localTime,
				eventVenue: object._embedded.events[i]._embedded.venues[0].name,
				ticketmasterLink: object._embedded.events[i].url
			};
			// console.log(newArtist);
			artistArray.push(newArtist);
		};
		console.log(artistArray);

		if (artistArray.length > 0) {
			$("#showHolder").html("");
			for (var i = 0; i < artistArray.length; i++) {
				var artistBlock = "<li id='" + artistArray[i].artistSearch + "' class='artist-name'><div class='collapsible-header valign-wrapper'><i class='material-icons md-36'>queue_music</i><h5>" + artistArray[i].eventName + "</h5></div><div class='collapsible-body'><div class=row><div class='col m4 s12 center'><a class='vid-link' href='' target=''><div class='video-container'><img class='thumbnail responsive-img' src=''></img><img class='playBtn' src='assets/images/ic_play_circle_outline_white_48dp_2x.png'></img></div></a></div><div class='col m8 s12'><dl><dt class='info'><h6>Info</h6></dt><dd><a href='" + artistArray[i].ticketmasterLink + "' target='_blank'>Event Details at TicketMaster</a></dd><br><dt class='dates'><h6>When</h6></dt><dd>" + moment(artistArray[i].eventDate + " " + artistArray[i].eventTime).format("dddd, MMMM Do YYYY, h:mm a") + "</dd><br><dt class='venue'><h6>Venue</h6></dt><dd>" + artistArray[i].eventVenue + "</dd></dl></div></div></div></li>";
				$("#showHolder").prepend(artistBlock);
			};
		};

	});
});

$("body").on('click', ".artist-name", function (event) {
	$(".thumbnail").attr("src", "");
	var currentArtist = $(this).attr("id");
	var listItem = $(this);
	console.log(currentArtist);
	var youtubeDataQuery = "https://www.googleapis.com/youtube/v3/search/?q=" + currentArtist + "&key=" + youtubeKey + "&part=snippet&type=video&videoCategoryId=10&maxResults=1";
	console.log(youtubeDataQuery);
	$.ajax({
		url: youtubeDataQuery,
		method: 'GET'
	}).then(function (object) {
		console.log(object);
		var vidId = object.items[0].id.videoId;
		var vidLink = "https://youtu.be/" + vidId;
		var vidThumb = object.items[0].snippet.thumbnails.medium.url;
		console.log(vidThumb);
		$(".vid-link").attr("href", vidLink);
		$(".vid-link").attr("target", '_blank');
		$(".thumbnail").attr("src", vidThumb);
	});
});

