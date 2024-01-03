/* 
 * PathStore is a module for storing annotated path objects persistently 
 * on your device. 
 * 
 * Author: Lyn Turbak
 * Date: 2023/11/18
 * Version: 1.0
 */

import * as FileSystem from 'expo-file-system';
// For debugging: 
// import { pathDistanceInMeters } from './distance.js';

const pathStoreDir = FileSystem.documentDirectory + 'PathStorage/'

function pathFilename(filename) {
    return pathStoreDir + filename; 
}

/** 
 * PathStore.loadPathObj(ISOStartTimeString) loads a path object from the 
 * file system using its ISO start time string as a file name. 
 * 
 * This is usually not called directly. Instead, it is called indirectly by
 * PathStore.init(), which loads all of the paths that have been saved on the 
 * device. 
 * 
 * Behind the scenes, PathStore.loadPathObj  reads the string contents of the 
 * file named by the ISO start time string and converts this string to a path 
 * object using JSON.parse.
 */
export async function loadPathObj(ISOStartTimeString) {
    try {
        const pathName = ISOStartTimeString;
        const pathJson = await FileSystem.readAsStringAsync(pathFilename(pathName));
        const pathObj = JSON.parse(pathJson);
        console.log(`Successfully loaded path from ${pathName}`);
        console.log(`Loaded path name: ${pathObj.name}`);
        // For debugging: 
        // console.log(`Loaded path distance: ${pathObj.pathDistance}`);
        // console.log(`Actual path distance: ${(pathDistanceInMeters(pathObj.coords)/1000).toFixed(2)}`);
        return pathObj; 
    } catch(err) {
        console.log(`Error when loading path from ${pathName}; returning undefined for this path.`);
        return undefined;
    }
}

// Create PathStore directory if it doesn't already exist
// and returns list of path objects in PathStore.
export async function init() {
    const fileInfo = await FileSystem.getInfoAsync(pathStoreDir);
    if (!fileInfo.exists) {
        try {
            await FileSystem.makeDirectoryAsync(pathStoreDir, {intermediates: true}); 
            console.log('Created PathStorage directory')
        } catch (err) {
            console.log('Something went wrong when creating PathStorage directory');
            return []; // Treat as if no path files. 
        }
    } else {
        console.log('PathStorage directory already exists.')
    }
    console.log('Reading names of paths in PathStorage directory.')
    const pathNames = await FileSystem.readDirectoryAsync(pathStoreDir);
    console.log('Read path names are:', pathNames);
    let pathObjs = []; 
    pathNames.sort();
    console.log('Loading path objects for each path name'); 
    pathObjs = await Promise.all(pathNames.map(
        async (pathName) => await loadPathObj(pathName)));
    // remove any undefineds 
    definedPathObjs = pathObjs.filter( pathObj => pathObj !== undefined);
    /* // forEach won't work!!!
    pathNames.forEach( 
        async pathName => {
            const pathObj = await loadPathObj(pathName);
            if (pathObj !== undefined) {
                pathObjs.push(pathObj);
            }
        });
    */
    console.log(`Successfully loaded ${definedPathObjs.length} of ${pathNames.length} paths.`);
    return definedPathObjs;
}

/** 
 * PathStore.storePath(pathObj) stores pathObj persistently on the device. 
 * 
 * Behind the scenes it uses JSON.stringify to convert pathObj to a string, 
 * and then stores this string in a special PathStorage directory using the 
 * ISO start time string of the path as a filename. 
 * 
 * You should call PathStore.storePath in the Recording PseudoScreen as 
 * part of saving a recorded path. 
 */
export async function storePath(pathObj) {
    try {
        const pathJson = JSON.stringify(pathObj);
        const pathFN = pathFilename(pathObj.startTime);
        FileSystem.writeAsStringAsync(pathFN, pathJson);
        console.log(`Successfully stored path at filename ${pathFN}.`);
    } catch(err) {
        console.log(`Failed attempt to store path at filename ${pathFN}.`);
    }
}

/**
 * PathStore.deletePath(pathObj) deletes pathObj from the persistent storage 
 * on the device. You will need to use this function if you implement path 
 * deletion. 
 */
export async function deletePath(pathObj) {
    deletePathName(pathObj.startTime);
}

/**
 * PathStore.deletePathName(pathObj) deletes from the device
 * the path object with the given ISOStartTimeString.
 */
export async function deletePathName(ISOStartTimeString) {
    try {
       const pathFN = pathFilename(ISOStartTimeString);
        await FileSystem.deleteAsync(pathFN);
        console.log(`Successfully deleted path at filename ${pathFN}.`);
    } catch (err) {
          setDeleteFeedback(`Deletion of ${pathFN} failed.`);
    }
}

/**
 * PathStore.deleteAllPaths(): deletes all path objects from the persistent 
 * storage on the device. This is most useful when debugging, where it returns 
 * the file system to the initial state where no paths are stored. 
 */
export async function deleteAllPaths() {
    try {
        // Delete the PathStorage directory and all its files
        await FileSystem.deleteAsync(pathStoreDir);
        // ... and re-create an empty PathStorage directory. 
        await FileSystem.makeDirectoryAsync(pathStoreDir, {intermediates: true}); 
        console.log(`Successfully deleted all paths`);
    } catch (err) {
        console.log(`Something went wrong when deleted all paths`);
    }
}

/**
 * Below, testPath1, testPath2, and testPath3 are short paths that can be 
 * used to test that persistent storage is working correctly on your device.
 */
export const testPath1 = {
    "name": "Walk just beyond stop sign",
    "startTime": "2015-09-26T12:32:19.000Z", // "09/26/2015 08:32:19 AM",
    "stopTime": "2015-09-26T12:33:13.000Z", // "09/26/2015 08:33:13 AM"
    "pathDistance": 0.11, // kilometers
    "spots": [
      { title: "Stop sign",
        time: "2015-09-26T12:33:01.000Z", // "09/26/2015 08:33:01 AM"
        coord: {
          "latitude": 42.20460277,
          "longitude": -71.23760608
        }
      }
    ],
    "coords": [
        {
          "latitude": 42.20415058,
          "longitude": -71.23801299
        },
        {
          "latitude": 42.204244,
          "longitude": -71.2379603
        },
        {
          "latitude": 42.20433136,
          "longitude": -71.23792269
        },
        {
          "latitude": 42.20441331,
          "longitude": -71.23786763
        },
        {
          "latitude": 42.20449825,
          "longitude": -71.23781547
        },
        {
          "latitude": 42.20457378,
          "longitude": -71.2377293
        },
        {
          "latitude": 42.20460277,
          "longitude": -71.23760608
        },
        {
          "latitude": 42.20459046,
          "longitude": -71.23748404
        },
        {
          "latitude": 42.20456792,
          "longitude": -71.23736456
        },
        {
          "latitude": 42.20455421,
          "longitude": -71.23722751
        },
        {
          "latitude": 42.20455105,
          "longitude": -71.2371062
        }
      ]
};

export const testPath2 = {
    "name": "Walk from just before stop sign to just after book kiosk",
    "startTime": "2015-09-26T12:32:47.000Z", // "09/26/2015 08:32:47 AM"
    "stopTime": "2015-09-26T12:35:59.000Z",  // "09/26/2015 08:35:59 AM"
    "pathDistance": 0.31, // kilometers
    "spots": [
      { title: "Stop sign",
        time: "2015-09-26T12:33:01.000Z", // "09/26/2015 08:33:01 AM"
        coord: {
          "latitude": 42.20460277,
          "longitude": -71.23760608
	    }
      }, 
      { title: "Share-a-book kiosk",
        moreInfo: "Remember to bring a book on next walk!",
        time: "2015-09-26T12:35:45.000Z",  // "09/26/2015 08:35:45 AM"
        coord: {
	        "latitude": 42.20411741,
    	    "longitude": -71.23454133
	      },	
      },
   ],
    "coords": [
      {
        "latitude": 42.20449825,
        "longitude": -71.23781547
      },
      {
        "latitude": 42.20457378,
        "longitude": -71.2377293
      },
      {
        "latitude": 42.20460277,
        "longitude": -71.23760608
      },
      {
        "latitude": 42.20459046,
        "longitude": -71.23748404
      },
      {
        "latitude": 42.20456792,
        "longitude": -71.23736456
      },
      {
        "latitude": 42.20455421,
        "longitude": -71.23722751
      },
      {
        "latitude": 42.20455105,
        "longitude": -71.2371062
      },
      {
        "latitude": 42.20455578,
        "longitude": -71.23697369
      },
      {
        "latitude": 42.20454683,
        "longitude": -71.23685275
      },
      {
        "latitude": 42.20452547,
        "longitude": -71.23673475
      },
      {
        "latitude": 42.20454098,
        "longitude": -71.2366065
      },
      {
        "latitude": 42.20450584,
        "longitude": -71.23648958
      },
      {
        "latitude": 42.20449471,
        "longitude": -71.23636679
      },
      {
        "latitude": 42.20447766,
        "longitude": -71.2362373
      },
      {
        "latitude": 42.20447101,
        "longitude": -71.23611261
      },
      {
        "latitude": 42.20445728,
        "longitude": -71.23598241
      },
      {
        "latitude": 42.20442462,
        "longitude": -71.23585337
      },
      {
        "latitude": 42.20441441,
        "longitude": -71.23572343
      },
      {
        "latitude": 42.20442326,
        "longitude": -71.23560165
      },
      {
        "latitude": 42.20438685,
        "longitude": -71.23547526
      },
      {
        "latitude": 42.20435121,
        "longitude": -71.23534351
      },
      {
        "latitude": 42.20432766,
        "longitude": -71.23522594
      },
      {
        "latitude": 42.20428625,
        "longitude": -71.23511645
      },
      {
        "latitude": 42.2042526,
        "longitude": -71.23499008
      },
      {
        "latitude": 42.20423522,
        "longitude": -71.23486233
      },
      {
        "latitude": 42.20421296,
        "longitude": -71.23473341
      },
      {
        "latitude": 42.20419942,
        "longitude": -71.23461272
      },
      {
        "latitude": 42.20411741,
        "longitude": -71.23454133
      },
      {
        "latitude": 42.20401568,
        "longitude": -71.23456134
      },
      {
        "latitude": 42.20391966,
        "longitude": -71.2346106
      },
    ]
}; 

  export const testPath3 =   {
    "name": "Walk from just before book kiosk to just after zen garden",
    "startTime": "2015-09-26T12:35:33.000Z",  // "09/26/2015 08:35:33 AM"
    "stopTime": "2015-09-26T12:37:14.000Z",  // "09/26/2015 08:37:14 AM"
    "pathDistance": 0.16, // kilometers
    "spots": [
      { title: "Share-a-book kiosk",
        moreInfo: "Remember to bring a book on next walk!",
        time: "2015-09-26T12:35:45.000Z",  // "09/26/2015 08:35:45 AM"
        coord: {
	        "latitude": 42.20411741,
    	    "longitude": -71.23454133
	      },	
      },
      { title: "Zen garden",
	    moreInfo: "with fairy lights!",
        time: "2015-09-26T12:37:01.000Z",  // "09/26/2015 08:37:01 AM"
        coord: {
       		"latitude": 42.20333214,
        	"longitude": -71.23536417
        },
      },
    ],
    "coords": [
      {
        "latitude": 42.20421296,
        "longitude": -71.23473341
      },
      {
        "latitude": 42.20419942,
        "longitude": -71.23461272
      },
      {
        "latitude": 42.20411741,
        "longitude": -71.23454133
      },
      {
        "latitude": 42.20401568,
        "longitude": -71.23456134
      },
      {
        "latitude": 42.20391966,
        "longitude": -71.2346106
      },
      {
        "latitude": 42.20384294,
        "longitude": -71.23467965
      },
      {
        "latitude": 42.20376296,
        "longitude": -71.23475731
      },
      {
        "latitude": 42.20367978,
        "longitude": -71.23483145
      },
      {
        "latitude": 42.20359294,
        "longitude": -71.2348931
      },
      {
        "latitude": 42.20350404,
        "longitude": -71.23495707
      },
      {
        "latitude": 42.20341414,
        "longitude": -71.23502234
      },
      {
        "latitude": 42.20332691,
        "longitude": -71.23510122
      },
      {
        "latitude": 42.20331393,
        "longitude": -71.23523501
      },
      {
        "latitude": 42.20333214,
        "longitude": -71.23536417
      },
      {
        "latitude": 42.20335658,
        "longitude": -71.23549757
      },
      {
        "latitude": 42.20338629,
        "longitude": -71.23561434
      },
    ]
};

export const testPaths = [testPath1, testPath2, testPath3];
      