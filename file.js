let currentsong = new Audio();
let songs;
let curfolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

async function getsongs(folder) {
  curfolder = folder;
  let response = await fetch(folder);
  let text = await response.text();
  let div = document.createElement("div");
  div.innerHTML = text;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(folder)[1]);
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  currentsong.src = `${curfolder}${track}`;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function loadSongsAndDisplay(folder) {
  songs = await getsongs(folder);
  playMusic(songs[0], true);

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="music.svg" alt="music" />
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>MUAZ</div>
        </div>
        <div class="playnow">
          <span>Playnow</span>
          <img class="invert" src="play.svg"/>
        </div>
      </li>`;
  }

  Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
    e.addEventListener("click", () => {
      let songName = e
        .querySelector(".info")
        .firstElementChild.innerHTML.trim();
      playMusic(songName);
    });
  });
}

async function main() {
  loadSongsAndDisplay("/songs/src");

  document.getElementById("play").addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentsong.currentTime
    )}/${formatTime(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  document.getElementById("previous").addEventListener("click", () => {
    currentsong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentsong.src.split("/").pop());
    if (index > 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  document.getElementById("next").addEventListener("click", () => {
    currentsong.pause();
    console.log("Next clicked");
    let index = songs.indexOf(currentsong.src.split("/").pop());
    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  document.querySelector(".range input").addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
    if (currentsong.volume > 0) {
      document.querySelector(".volume>img").src = document
        .querySelector(".volume>img")
        .src.replace("mute.svg", "volume.svg");
    }
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentsong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentsong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
  Array.from(document.getElementsByClassName("card")).forEach((card) => {
    card.addEventListener("click", async (item) => {
      play.src = "play.svg";
      document.querySelector(".circle").style.left = 0;
      await loadSongsAndDisplay(`songs/${item.currentTarget.dataset.folder}`);
    });

    const playButton = card.querySelector(".play");
    if (playButton) {
      playButton.addEventListener("click", async (event) => {
        event.stopPropagation(); // Prevent the card's click event from firing
        const folder = card.dataset.folder;
        await loadSongsAndDisplay(`songs/${folder}`);
        playMusic(songs[0]);
        document.querySelector(".circle").style.left = 0;
      });
    }
  });
}

main();
