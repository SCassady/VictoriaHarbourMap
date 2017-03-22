var markers = [
  {
    title: "Noonday Gun",
    coordinates: {lat: 22.2826, lng: 114.1838}
  },
  {
    title: "Chungking Mansions",
    coordinates: {lat: 22.2964, lng: 114.1727}
  },
  {
    title: "Lascar Row",
    coordinates: {lat: 22.284711, lng: 114.150003}
  },
  {
    title: "Bank of China Tower (Hong Kong)",
    coordinates: {lat: 22.2793, lng: 114.1615}
  },
  {
    title: "Lippo Centre (Hong Kong)",
    coordinates: {lat: 22.2797, lng: 114.1632}
  },
  {
    title: "Hong Kong Museum of Art",
    coordinates: {lat: 22.2938, lng: 114.1722}
  },
  {
    title: "Hong Kong Zoological and Botanical Gardens",
    coordinates: {lat: 22.2779, lng: 114.1563}
  },
  {
    title: "Man Mo Temple",
    coordinates: {lat: 22.2840, lng: 114.1502}
  },
  {
    title: "Shun Tak Centre",
    coordinates: {lat: 22.2879, lng: 114.1516}
  },
  {
    title: "Happy Valley Racecourse",
    coordinates: {lat: 22.2722, lng: 114.1811}
  }
];

function ViewModel() {
  var self = this;

  // Create observableArray from markers. Add filter observable to each.
  self.markerList = ko.observableArray(markers);
  for (i = 0; i < self.markerList().length; i++) {
    self.markerList()[i].filter = ko.observable(true);
  }

  self.hideSidebar = ko.observable(false);
  self.filterText = ko.observable("");

  self.performFilterEnter = function(data, event) {
    // When enter is pressed while using the filter input, call performFilter.
    if (event.keyCode == 13) {
      self.performFilter();
    }
  };

  self.performFilter = function() {
    // Set filter to true for all markers whose title includes the given string.
    for (i = 0; i < self.markerList().length; i++) {
      var currentMarker = self.markerList()[i];
        if (currentMarker.title.includes(self.filterText())) {
          console.log('currentMarker =' + currentMarker);
          currentMarker.filter(true);
          markerInstances[currentMarker.title].setVisible(true);
        } else {
          currentMarker.filter(false);
          markerInstances[currentMarker.title].setVisible(false);
        }
    }
  };

  self.toggleLeftBar = function() {
    // Hide sidebar and reset styles and map size accordingly.
    if (self.hideSidebar() == false) {
      self.hideSidebar(true);
    } else {
      self.hideSidebar(false);
    }
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
  };

  self.displayMarker = function(modelMarker, event) {
    OpenInfoWindow(markerInstances[modelMarker.title], infoWindow)
  };

  // Instantiate window and markers.
  var infoWindow = new google.maps.InfoWindow({
    content: ""
  });

  var markerInstances = {};
  for (var i = 0; i < self.markerList().length; i++) {
    // Create markers and add click listener.
    var currentMarker = self.markerList()[i];
    markerInstances[currentMarker.title] = new google.maps.Marker({
        position: currentMarker.coordinates,
        map: map,
        title: currentMarker.title,
        animation: google.maps.Animation.DROP
    });
    markerInstances[currentMarker.title].addListener('click', function() {
      StopBouncing();
      OpenInfoWindow(this, infoWindow);
    });
  };
  console.log(markerInstances);

  function OpenInfoWindow(marker, iWindow) {
    // Open infoWindow and populate with information from the Wikipedia and Flickr APIs if possible.
    StopBouncing();
    marker.setAnimation(google.maps.Animation.BOUNCE);
    iWindow.setContent('');
    var content = '<h4>' + marker.title + '</h4>';
    var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    var flickrURL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4decdc94dd4d30bed04feb6accae35ca&format=json&text=' + marker.title + '&nojsoncallback=1';

    var ajaxSettingsWiki = {
      dataType: 'jsonp',
      success: function(wikiData) {
        var wikiContent = '<p>' + wikiData[2][0] +' (<a href="' + wikiData[3][0] + '" target="_blank">Wikipedia</a>)</p><br>';
        content += wikiContent;

        clearTimeout(wikiRequestTimeout);
        FlickrAPICall();
      }
    };

    var wikiRequestTimeout = setTimeout(function(){
      content += "<p>Wikipedia URL search failed.</p><br>";
      FlickrAPICall();
    }, 2000)

    var ajaxSettingsFlickr = {
      dataType: 'json',
      success: function(flickrData) {
        var flickrContent = '';
        for (var i = 0; i < 4; i++) {
          var photo = flickrData.photos.photo[i];
          var photoURL = 'https://farm'+ photo.farm + '.staticflickr.com/'+ photo.server + '/'+ photo.id + '_' + photo.secret + '_q.jpg'
          flickrContent += '<a target="_blank" href="' + 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id + '"><img src="'+ photoURL + '"></a>';
        }
        flickrContent += '<span> (<a href="https://www.flickr.com/">flickr</a>)</span>';

        iWindow.setContent(content + flickrContent);
      }
    };

    function FlickrAPICall() {
      $.ajax(flickrURL, ajaxSettingsFlickr).fail(function(){
        iWindow.setContent(content + '<br><p>The flickr API failed to load.</p>');
      });
    }

    $.ajax(wikiURL, ajaxSettingsWiki);
    iWindow.open(map, marker);
  }

  function StopBouncing() {
    for (var markerInstance in markerInstances) {
      if (markerInstances.hasOwnProperty(markerInstance)) {
          markerInstances[markerInstance].setAnimation(null);
      }
    }
  }

  infoWindow.addListener('closeclick', function() {
    StopBouncing();
    infoWindow.setContent("");
  });
  infoWindow.setMap(null);
}

var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 22.2850, lng: 114.1700},
    zoom: 15
  });
  ko.applyBindings(new ViewModel());
}
