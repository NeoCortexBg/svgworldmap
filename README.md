# svgworldmap

Displays a SVG world map.
You may click on a continent, which will zoom to the continent and show its countries and allow you to click on them.
You may defined a callback for clicking on a country.

Example Usage:

<html>
	<head>
		<link href="svgworldmap/css/style.css" media="screen" rel="stylesheet" type="text/css" />
		<script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
		<script src="svgworldmap/js/map.js"></script>
	</head>
	<body>
		<div id='map'></div>
		<script>
			$("#map").svgworldmap({
				onCountryClick: function(country){
					//do something with country
					alert("Clicked " + country.iso2);
				}
			});
		</script>
	</body>
</html>

