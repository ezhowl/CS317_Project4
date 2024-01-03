# CS317_Project4
Project 4 for CS317

React Native Path Recorder App
Emilie Zhang

File Summaries:

App.js
1. Properties: none
2. State Hooks:
    - currentScreen (string): Stores the current active screen ('Summary', 'Display', or 'Recording'). Determines which screen to render.
    - paths (array of objects): Holds all the paths recorded or loaded from storage. Each path object includes details like name, start time, etc.
    - selectedPath (object/null): Stores the path selected by the user for detailed viewing on the Display screen.

SummaryScreen.js
1. Properties:
    - onPathSelect (function): Callback when a path is selected for viewing.
2. State Hooks:
    - paths (array of objects): Holds the list of paths to display.
    - sortType (string): Determines the sorting criterion for paths.
3. Above & Beyond: implemented both above & beyond tasks. There are buttons at the top of the screen that sort the paths according to name, date, and path length. To delete a path persistently, press on the path desired to activate deleting interface.

DisplayScreen.js
1. Properties: 
    - path (object): The path data to be displayed, including coordinates, spots, start and stop times.
2. State Hooks: none
3. Above & Beyond: implemented above & beyond so that the entire path can be displayed without zooming in (doesn't always work for newly recorded paths, but definitely works for the ones already there.)

RecordingScreen.js
1. Properties:
    - onRecordingComplete (function): Callback to handle the completion of recording.
    - existingPathNames (array of strings): Names of existing paths to prevent duplicate names.   
2. State Hooks:
    - isRecording (boolean): Indicates whether path recording is currently active.
    - path, currentLocation, spots (arrays): Store the coordinates of the path, the current location, and spots marked respectively.
    - modalVisible (boolean): Controls the visibility of the modal for adding a spot.
    - spotTitle, spotInfo (strings): Store the title and additional information of the spot being added.
    - startTime, stopTime (strings): Store the timestamps for the start and end of the recording.

PathView.js
1. Properties: 
    - path (array of coordinates): The coordinates for the path polyline.
    - spots (array of objects): The spots marked along the path.
    - startTime and stopTime (strings): Timestamps for when the path recording started and stopped.
2. State Hooks: none


Limitations:
1. Above & Beyond for displayscreen (having the entire path be displayed without having to zoom in) doesn't always work on newly recorded paths.
2. There are sometimes issues with the stop marker if the "stopTime" is not accurate
3. Sometimes there are minor issues with time stamps or path distances, especially if the distance traveled is extremely little (i was mainly testing inside my apartment, which shouldn't be indicative of the app's performance with a path that actually has more than 20 meters in it)


Above & Beyonds implemented (all 3):
1. DisplayScreen: the entire path can usually be displayed without zooming in 
2. Summary Screen: there are buttons at the top of the screen that sort the paths according to name, date, and path length. 
3. Summary Screen: you can delete a path persistently by pressing on the desired path and pressing delete after the interface activates 


Lessons Learned:
Gained understanding of state management in React Native, the use of hooks, and creating a multi-screen app. Learned about sorting algorithms, handling asynchronous data operations, and implementing user interaction in React Native. Gained insights into real-time location tracking, state management, and modal handling in React Native. Enhanced understanding of using React Native Maps and abstracting complex map logic into a reusable component. Learned how to handle conditional rendering based on the passed properties and integrate a custom component (PathView).

