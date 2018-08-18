# content-scraper
Treehouse tech degree project to build a content scraper

This is a nodejs app run exclusively from the command line. NPM Install checks the pacakge.json file and installs all required
packages.

NPM start, or npm scraper.js, runs the app. The app first checks to see if a 'data' folder exists, if it doesn't then it
creates the folder. It then creates an error log file, if it doesn't already exist, and stores it within the data folder.

The app then accesses a single URL, from which it can access other URLs dynamically based on what is in the page content.

Once it is reading the sub-pages, it pulls out some key data points, utilsing the NPM package Cherio, and stores the values
in separate rows in a CSV file. This file is named based on the date the scraper crawled the website.
