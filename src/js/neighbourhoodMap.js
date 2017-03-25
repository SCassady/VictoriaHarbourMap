var markers = [
  {
    title: 'Noonday Gun',
    coordinates: {lat: 22.2826, lng: 114.1838}
  },
  {
    title: 'Chungking Mansions',
    coordinates: {lat: 22.2964, lng: 114.1727}
  },
  {
    title: 'Lascar Row',
    coordinates: {lat: 22.284711, lng: 114.150003}
  },
  {
    title: 'Bank of China Tower (Hong Kong)',
    coordinates: {lat: 22.2793, lng: 114.1615}
  },
  {
    title: 'Lippo Centre (Hong Kong)',
    coordinates: {lat: 22.2797, lng: 114.1632}
  },
  {
    title: 'Hong Kong Museum of Art',
    coordinates: {lat: 22.2938, lng: 114.1722}
  },
  {
    title: 'Hong Kong Zoological and Botanical Gardens',
    coordinates: {lat: 22.2779, lng: 114.1563}
  },
  {
    title: 'Man Mo Temple',
    coordinates: {lat: 22.2840, lng: 114.1502}
  },
  {
    title: 'Shun Tak Centre',
    coordinates: {lat: 22.2879, lng: 114.1516}
  },
  {
    title: 'Happy Valley Racecourse',
    coordinates: {lat: 22.2722, lng: 114.1811}
  }
];

function viewModel() {
  var self = this;

  // Create observableArray from markers. Add filter observable to each.
  self.markerList = ko.observableArray(markers);
  for (i = 0; i < self.markerList().length; i++) {
    self.markerList()[i].filter = ko.observable(true);
  }

  self.hideSidebar = ko.observable(false);
  self.filterText = ko.observable('');

  self.filteredMarkers = ko.computed(function() {
    // return self.markerList;
    if (self.filterText === '') {
      return self.markerList;
    } else {
      var filterTextLower = self.filterText().toLowerCase();

      return ko.utils.arrayFilter(self.markerList(), function(marker) {
        return marker.title.toLowerCase().includes(filterTextLower);
      });
    }
  }, this);

  self.toggleLeftBar = function() {
    // Hide sidebar and reset styles and map size accordingly.
    if (self.hideSidebar() === false) {
      self.hideSidebar(true);
    } else {
      self.hideSidebar(false);
    }
    var center = map.getCenter();
    google.maps.event.trigger(map, 'resize');
    map.setCenter(center);
  };

  self.displayMarker = function(modelMarker, event) {
    openInfoWindow(markerInstances[modelMarker.title], infoWindow);
  };

  // Instantiate window and markers.
  var infoWindow = new google.maps.InfoWindow({
    content: ''
  });

  // Create markers and add click listeners.
  var markerInstances = {};
  for (var i = 0; i < self.markerList().length; i++) {
    var currentMarker = self.markerList()[i];
    markerInstances[currentMarker.title] = new google.maps.Marker({
        position: currentMarker.coordinates,
        map: map,
        title: currentMarker.title,
        animation: google.maps.Animation.DROP
    });
    markerInstances[currentMarker.title].addListener('click', function() {
      stopBouncing();
      openInfoWindow(this, infoWindow);
    });
  }
  console.log(markerInstances);

  function openInfoWindow(marker, iWindow) {
    // Open infoWindow and populate with information from the Wikipedia and Flickr APIs if possible.
    stopBouncing();
    marker.setAnimation(google.maps.Animation.BOUNCE);
    iWindow.setContent('');
    var content = '<div class="infoWindow"><h4>' + marker.title + '</h4>';
    var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    var flickrURL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4decdc94dd4d30bed04feb6accae35ca&format=json&text=' + marker.title + '&nojsoncallback=1';

    $.ajax({
      dataType: 'jsonp',
      url: wikiURL
    }).done(function(wikiData) {
      var wikiContent = '<p>' + wikiData[2][0] +' (<a href="' + wikiData[3][0] + '" target="_blank">Wikipedia</a>)</p><br>';

      content += wikiContent;
      FlickrAPICall();
    }).fail(function(){
      content += '<p>Wikipedia URL search failed.</p><br>';
      FlickrAPICall();
    });

    function FlickrAPICall() {
      $.ajax({
        dataType: 'json',
        url: flickrURL
      }).done(function(flickrData) {
        var flickrContent = '';

        // Append the first 3 returned images, linking to their sources.
        for (var i = 0; i < 3; i++) {
          var photo = flickrData.photos.photo[i];
          var photoURL = 'https://farm'+ photo.farm + '.staticflickr.com/'+ photo.server + '/'+ photo.id + '_' + photo.secret + '_s.jpg';
          flickrContent += '<a target="_blank" href="' + 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id + '"><img src="'+ photoURL + '"></a>';
        }
        flickrContent += '<span> (<a href="https://www.flickr.com/">flickr</a>)</span></div>';

        iWindow.setContent(content + flickrContent);
      }).fail(function(){
        iWindow.setContent(content + '<br><p>The flickr API failed to load.</p></div>');
      });
    }

    iWindow.open(map, marker);
    // Set map center slightly north of the marker to make it easier to view the infoWindow on mobile (especially landscape.)
    var windowPos = marker.getPosition();
    map.setCenter({lat: windowPos.lat() + 0.0065, lng: windowPos.lng()});
  }

  function stopBouncing() {
    for (var markerInstance in markerInstances) {
      if (markerInstances.hasOwnProperty(markerInstance)) {
          markerInstances[markerInstance].setAnimation(null);
      }
    }
  }

  infoWindow.addListener('closeclick', function() {
    stopBouncing();
    infoWindow.setContent('');
  });
  infoWindow.setMap(null);
}

var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 22.2850, lng: 114.1700},
    zoom: 15
  });
  ko.applyBindings(new viewModel());
}

function mapLoadError() {
  window.alert('The google map API failed to load. Sorry about that!');
}
