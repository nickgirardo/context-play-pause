
const checkVideoStatus = `{
  const video = document.querySelector('video');
  if (video) {
    if (video.paused) 'VIDEO_PAUSED';
    else 'VIDEO_PLAYING';
  } else {
    'NO_VIDEO';
  }
}`

const toggleVideoPlaying = `{
  const video = document.querySelector('video');
  if (video) {
    if (video.paused) video.play();
    else video.pause();
  }
}`

function onCreated() {
  if(browser.runtime.lastError) {
    console.error(`Error: ${browser.runtime.lastError}`);
  }
}

browser.menus.onClicked.addListener((info, tab) => {
  switch(info.menuItemId) {
    case "yt-play":
    case "yt-pause":
      browser.tabs.executeScript(tab.id, {code: toggleVideoPlaying});
      break;
    default:
      console.error("Error: Unexpected button press");
      break;
  }
});

browser.menus.onShown.addListener((info, tab) => {

  if(!info.contexts.includes('tab'))
    return;

  browser.menus.removeAll();
  browser.tabs.executeScript(tab.id, {code: checkVideoStatus})
  .then(videoStatus => {
    switch(videoStatus[0]) {
      case 'VIDEO_PAUSED':
        browser.menus.create({
          "id": "yt-play",
          "title": "Play Video",
          "contexts": ["tab"],
        }, onCreated);
        break;
      case 'VIDEO_PLAYING':
        browser.menus.create({
          "id": "yt-pause",
          "title": "Pause Video",
          "contexts": ["tab"],
        }, onCreated);
        break;
      case 'NO_VIDEO':
      default:
        break;
    }
  }).then(() => browser.menus.refresh());
});
