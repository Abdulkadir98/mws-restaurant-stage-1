# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### What I did

### Stage One

#### Responsiveness

Made changes to the existing code so that the website was responsive on all viewports.

#### Accessibility

Added accessibility features - Proper roles were defined for HTML elements and alternate text was provided for all images in the event the images failed to load.

#### Progressive Web App principles

Added service worker to make to cache all assets and the make the website offline-enabled.

### Stage Two

#### Offline Support

Saved data in indexed DB on first load. Everytime the content was loaded from database when the user was offline.

#### Lighthouse Score

Met the following requirements for the project
* `>75 Performance`
* `>75 Progressive Web App`
* `>90 Accessibility`

### Stage Three

#### Add New Features

1. Designed a form for submission of restaurant review. In the event the user is offline. The review is saved in local storage and when the user gets back online, the review is sent to the server.

2. Added functionality to mark a restaurant as favorite. The change in the status is persisted in the database.

#### Lighthouse Score

Met the following requirements for the successful completion of Project

* `>90 Performance`
* `>90 Progressive Web App`
* `>90 Accessibility`

View the site live over [here](https://mws-restaurant-reviews.netlify.com/)

#### Note:
The site only works if run server locally on your machine. Head over to this [repo](https://github.com/udacity/mws-restaurant-stage-3) for the server code and instructions to run it.




