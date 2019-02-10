## uBin

⚠️ dev version

### Installation

1. Make sure a recent version of [NodeJS](https://nodejs.org/en/download/) is installed
2. Download the zip (and unzip it) or use `git clone`
3. Use your terminal to navigate to the folder and run the following commands:
    - `npm install` (or use `yarn` if you prefer)
    - `npm run entities`
    - `npm run rebuild`
4. From now on you shouldn't have to run the commands above anymore 
(until you use a new version). The project should now be runnable (in `dev` mode)
via `npm run dev`


### Features

- The _Import_ tab leads you to a view that has a file tree to find your import files
and a list of files queued to import.
- In the _samples_ tab you can select your already imported data sets through the Import button
(which are ordered by their creation time but have arbitrary names for now).
Those can be selected by clicking.
- After importing, you will see different graphs based on the imported data. 
Taxonomies are filtered by through clicking on the corresponding taxonomy. 
Clicking on it again will let you select a new one.
- The scatter plot can be used to draw a rectangle for the samples you want to filter.
Unlike taxonomies, you need to apply the filter (green button) manually.
- gc/length and gc/coverage bar charts can be zoomed in and be trimmed.