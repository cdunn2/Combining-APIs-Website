const searchForm = document.getElementById("top-search");
searchForm.onsubmit = async (ev) => {
  ev.preventDefault();

  const formData = new FormData(ev.target);
  const queryText = formData.get("query").toLowerCase();

  try {
      const [moves, pokemon] = await Promise.all([
      getPokemonMoves(queryText),
      getPokemonData(queryText),
    ]);
    

    displayPokemonMoves(moves, queryText);
    displayPokemonImage(pokemon.sprites.front_default, pokemon.sprites.back_default, queryText);
  } catch (error) {
    const imageContainer = document.getElementById("image-results");
    const movesContainer = document.getElementById("moves-results");
    const songsContainer = document.getElementById("song-results");

    imageContainer.innerHTML = "";
    movesContainer.innerHTML = "";
    songsContainer.innerHTML = "";

    alert("404 Error: Pokemon not found");
  }
};

async function getPokemonData(pokemonName) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  const data = await response.json();
  return data;
}

const getPokemonMoves = async (pokemonName) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  const data = await response.json();
  
  const moveDetailsPromises = data.moves.map(async (moveObj) => {
    const moveResponse = await fetch(moveObj.move.url);
    const moveData = await moveResponse.json();
    return moveData;
  });


  const moveDetails = await Promise.all(moveDetailsPromises);
  return moveDetails;
};



function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

function displayPokemonMoves(moves, name) {
  const movesContainer = document.getElementById("moves-results");
  movesContainer.innerHTML = ""; // Clear previous results

  shuffleArray(moves); // Shuffle the moves array
  const randomMoves = moves.slice(0, 6); // Get 6 random moves

  randomMoves.forEach((moveObj) => {
    const moveButton = document.createElement("button");
    moveButton.textContent = `${moveObj.name}`;
    moveButton.classList.add("btn");
    moveButton.classList.add("btn-info");

    const moveType = moveObj.type.name;
    const moveTypeColor = getMoveTypeColor(moveType); 
    moveButton.style.backgroundColor = moveTypeColor;

    moveButton.onclick = async () => {
      const accessToken = await getSpotifyAccessToken();
      searchForSongs(accessToken, moveObj.name);



    };
    movesContainer.appendChild(moveButton);
  });
}

const searchSong = async (songName) => {

  const apiUrl = `https://api.spotify.com/v1/search?q=${songName}&type=track`;
  const authString = btoa(`${clientId}:${clientSecret}`);
  const authHeader = `Basic ${authString}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': 'Bearer ' + authHeader
    }
  });
  const data = await response.json();
  const spotifyId = data.tracks.items[0].id;
  const songLink = `https://open.spotify.com/track/${spotifyId}`;

  return songLink;
}

function displayPokemonImage(pokemonFront, pokemonBack, name) {
  const imageContainer = document.getElementById("image-results");
  imageContainer.style.display = "flex"
  imageContainer.style.justifyContent = "center";

  // Check if there's already an image in the container
  if (imageContainer.firstChild) {
    imageContainer.removeChild(imageContainer.firstChild);
    imageContainer.removeChild(imageContainer.firstChild);
  }

  // Create a new front image element and set its attributes
  const frontImage = document.createElement("img");
  frontImage.id = "pokemon-front"
  frontImage.src = pokemonFront;
  frontImage.alt = name + " front";
  frontImage.style.maxWidth = "250px";

  // Create a new front image element and set its attributes
  const backImage = document.createElement("img");
  backImage.id = "pokemon-back"
  backImage.src = pokemonBack;
  backImage.alt = name + " back";
  backImage.style.maxWidth = "250px";

  // Append the image element to the imageContainer
  imageContainer.appendChild(frontImage);
  imageContainer.appendChild(backImage);
}

  async function getSpotifyAccessToken(clientId, clientSecret) {
    const authUrl = 'https://accounts.spotify.com/api/token';
    const authString = btoa(`${clientId}:${clientSecret}`);
    const authHeader = `Basic ${authString}`;
  
    try {
      const response = await axios.post(authUrl, 'grant_type=client_credentials', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader
        }
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error obtaining Spotify access token:', error);
      return null;
    }
  }

const clientId = '29c47e634ac24fd5806399416987ff70';
const clientSecret = '5b317c4d02a14996b40ba88511749453';

async function getSpotifyAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

let sortAlphabetically = false;
// Search for songs with the player's first name using the Spotify API
const getSongs = async (playerFirstName) => {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${playerFirstName}&type=track&market=US`, {
        headers: {
          'Authorization': 'Bearer YOUR_SPOTIFY_API_KEY'
        }
      }
    );
    const data = await response.json();
    return data.tracks.items;
  };

  async function searchForSongs(accessToken, query) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  
    const data = await response.json();
    console.log(data);
  
    // Call a function to display the results (e.g., displaySongs(data.tracks.items))
    displaySongs(data.tracks.items);

  }

  async function displaySongs(songs) {
    displayedSongs = songs;
    const songList = document.getElementById("song-list");
    songList.innerHTML = ""; // Clear previous results
  
    if (songs.length === 0) {
      const noSongsMessage = document.createElement("p");
      noSongsMessage.textContent = "No songs found for that player";
      songList.appendChild(noSongsMessage);
      sortButton.style.display = "none";
    } else {
      sortButton.style.display = "inline-block";
      const songUl = document.createElement("ul");
      
      songs.forEach(song => {
        const songLi = document.createElement("li");
        const songLink = document.createElement("a");
        songLink.href = song.external_urls.spotify;
        songLink.textContent = `${song.name} by ${song.artists[0].name}`;
        songLi.appendChild(songLink);
        songUl.appendChild(songLi);
      });
  
      songList.appendChild(songUl);
    }
  }
  

  function getMoveTypeColor(moveType) {
    const typeColors = {
      normal: 'grey',
      fighting: 'red',
      flying: 'light-blue',
      poison: 'purple',
      ground: 'brown',
      rock: 'grey',
      bug: 'green',
      ghost: 'light-grey',
      steel: 'silver',
      fire: 'orange',
      water: 'blue',
      grass: 'green',
      electric: 'yellow',
      psychic: 'pink',
      ice: 'light-blue',
      dragon: 'purple',
      dark: 'dark grey',
      fairy: 'pink'
    };
  
    return typeColors[moveType] || 'grey';
  }

  function sortSongsAlphabetically(songs) {
    return songs.sort((a, b) => a.name.localeCompare(b.name));
  }

  const sortButton = document.getElementById("sort-alphabetically");
  let displayedSongs = [];

  sortButton.addEventListener("click", () => {
    displayedSongs = sortSongsAlphabetically(displayedSongs);
    displaySongs(displayedSongs);
  });

