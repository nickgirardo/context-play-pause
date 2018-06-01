
// Checks if we failed to create a menu item
function onCreated() {
  if(browser.runtime.lastError)
    console.error(`Error: ${browser.runtime.lastError}`);
}

/*
 * This code is passed as a string to the tab for which a context menu is being opened
 * This runs before the tab is displayed we know which menu item (if any) to display
 *
 * Returns one of three possible values: NO_VIDEO, VIDEO_PAUSED, VIDEO_PLAYING
 */
const checkVideoStatus = `{
  const video = document.querySelector('video');
  if (video) {
    if (video.paused) 'VIDEO_PAUSED';
    else 'VIDEO_PLAYING';
  } else {
    'NO_VIDEO';
  }
}`

/*
 * This code is passed as a string when a user hits the "Pause Video" or "Play Video" menu item
 *
 * The same code runs in either case, toggling the playing status of the video
 */
const toggleVideoPlaying = `{
  const video = document.querySelector('video');
  if (video) {
    if (video.paused) video.play();
    else video.pause();
  }
}`

// Runs one of our context menu items is clicked
browser.menus.onClicked.addListener((info, tab) => {
  switch(info.menuItemId) {
    // Note: the injected code toggles the play status so both the play and pause buttons have the same functionality
    case "yt-play":
    case "yt-pause":
      browser.tabs.executeScript(tab.id, {code: toggleVideoPlaying});
      break;
    default:
      console.error(`Error: An unexpected menu item was pressed: ${info.menuItemId}`);
      break;
  }
});

/*
 * Runs whenever a context menu is to be shown
 * We are only concerned with menus opening on tabs so return immediately otherwise
 *
 * We remove all previous context menu items we have created
 *
 * We check the video status of the tab for which the menu will be opened
 * Three possible values:
 * - NO_VIDEO: the tab in question has no html5 video elements
 * - VIDEO_PAUSED: an html5 video exists and is paused
 * - VIDEO_PLAYING: an html5 video exists and is playing
 *
 * We then add a menu item depending on this video status
 */
browser.menus.onShown.addListener((info, tab) => {
  if(!info.contexts.includes('tab'))
    return;

  browser.menus.removeAll()
  .then(() => browser.tabs.executeScript(tab.id, {code: checkVideoStatus}))
  .then(videoStatus => {
    // Note: The result of the previous execution is wrapped in an array for some reason
    // As far as I can tell only one value can be returned so I'm not too sure why
    switch(videoStatus[0]) {
      case 'VIDEO_PAUSED':
        browser.menus.create({
          "id": "yt-play",
          "title": "Play Video",
          "contexts": ["tab"],
          "icons": {
            "16": "icons/play-16.png",
            "32": "icons/play-32.png"
          }
        }, onCreated);
        break;
      case 'VIDEO_PLAYING':
        browser.menus.create({
          "id": "yt-pause",
          "title": "Pause Video",
          "contexts": ["tab"],
          "icons": {
            "16": "icons/pause-16.png",
            "32": "icons/pause-32.png"
          }
        }, onCreated);
        break;
      case 'NO_VIDEO':
      default:
        break;
    }
  })
  .then(() => browser.menus.refresh());
});
