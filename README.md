# uBin

Software for manual curation of genomes from metagenomes

Contact: till.bornemann@uni-duisburg-essen.de

The uBin app is located in the repository https://github.com/ProbstLab/uBin.

A worflow including the input generation script as well as test files are located in https://github.com/ProbstLab/uBin-helperscripts.
This is a step by step guide for the uBin workflow so we recommend using this if you are new to uBin.

The main README with instructions on how to install and use both the input generation script as well as uBin itself, including pictures and a short video tutorial, are located in the uBin-helperscripts repository https://github.com/ProbstLab/uBin-helperscripts. 

The following contains mainly installation instructions for the uBin software.

## uBin Installation

### Use an installer (recommended)

1. Find the latest release on the release page: https://github.com/ProbstLab/uBin/releases
2. Get the correct installer (other files can be ignored):
   - Windows: .exe
   - MacOS: .dmg
   - Linux: .deb
3. After downloading, execute the file and install the software

### (Updates)

If you find yourself on an old release and want to update the software, simply repeat the same process as for the initial installation.

### Compile it yourself

1. Make sure a recent version of [NodeJS](https://nodejs.org/en/download/) is installed
2. Download the zip (and unzip it) or use `git clone`
3. Use your terminal to navigate to the folder and run the following commands (**this only need to be done once**):
   - `npm install` (or use `yarn` if you prefer)
   - `npm run entities`
   - `npm run rebuild`
4. Now you can either run the software in its `dev` mode or `build` it to an executable
   1. `dev` mode: Simply run `npm run dev`. The program should launch after a bit and offer you more tools for debugging and inspecting
   2. `npm run package` build/packages the software for your current OS. Check the `package.json` if you want to try to build it for other systems.

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
