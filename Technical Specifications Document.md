# Technical Specifications Document

## 1. Title Page

Project Name: Altitude 
Version: 1.0  
Date: July 16, 2026  
Authors(s): Erol Babas, Jedidia Omison, Carl Limjoco, Kiara Valencia

## 2. Table of Contents

1. [Introduction](#3-introduction)
2. [Overall Description](#4-overall-description)
3. [Visual Mockup Reference](#5-visual-mockup-reference)
4. [Features](#6-features)
5. [Functional Requirements](#7-functional-requirements)
6. [Non-Functional Requirements](#8-non-functional-requirements)
7. [Data Requirements](#9-data-requirements)
8. [External Interface Requirements](#10-external-interface-requirements)
9. [Glossary](#11-glossary)
10. [Appendices](#12-appendices)

## 3. Introduction

### **Purpose**

The purpose of this application is to provide users with a simple online platform for searching, viewing, and booking flights. The system is intended to simulate the basic process of an airline booking website, where users can check available flights, select a preferred flight, create a booking, and view their booking details.

This project will also serve as a practice application for applying core web development concepts such as HTML, CSS, Bootstrap, JavaScript, backend development, API handling, and database management using MongoDB.

### **Scope**

The Airline Booking System will allow users to browse available flights, search for flights based on selected travel details, register or log in to an account, and create flight bookings. The system will also include basic administrative features that allow authorized users to manage users, airline information and flight records.

The application will focus on the core booking process only. It will not include real airline ticket issuance, real payment processing, real-time flight tracking, real airport systems, or actual airline company integration. Any payment-related feature will only be represented as a placeholder or simulated process for project purposes.

### **Definitions, Acronyms, and Abbreviations**

* **API** \- Application Programming Interface. A way for different parts of the application to communicate with each other.  
* **UI** \- User Interface. The visual part of the application that users interact with.  
* **UX** \- User Experience. The overall experience of the user while using the application.  
* **MVP** \- Minimum Viable Product. A simple working version of the application that includes the most important features.  
* **CRUD** \- Create, Read, Update, Delete. The basic operations used when managing data.  
* **Database** \- A structured storage system used to save application data.  
* **MongoDB** \- A NoSQL database that stores data in document-like format.  
* **Frontend** \- The client-side part of the application that users see and interact with.  
* **Backend** \- The server-side part of the application that handles business logic, APIs, and database operations.  
* **Booking** \- A reservation made by a user for a selected flight.

## #**References**

The following websites and resources may be used as references for design and feature inspiration:

Zuitt course materials \- used as reference for HTML, CSS, Bootstrap, JavaScript, backend, and MongoDB implementation.

## 4. Overall Description

### Product Perspective

The Airline Booking System is a web-based application designed to simulate a basic airline reservation platform. It is not connected to real airline systems, but it is intended to represent how users interact with an online flight booking website.

The system will include a frontend interface for users and a backend system for handling flight data, user accounts, and booking records. The application may later be connected to a database so that information can be stored, retrieved, updated, and deleted.

### Product Functions

The main functions of the application include:

* Allowing users to register and log in.  
* Allowing users to search for available flights.  
* Displaying flight results based on selected travel details.  
* Allowing users to view flight information.  
* Allowing users to create a booking.  
* Allowing users to view their booking details.  
* Allowing admin users to add, update, or remove flight records.  
* Storing user, flight, and booking information in a database.  
* User Classes and Characteristics  
* The system will have two main types of users:

***Regular User / Customer***

A regular user is someone who wants to search for flights and create a booking. This user can view available flights, select a flight, and check booking details. Regular users are expected to have basic knowledge of using websites and online forms.

***Admin User***

An admin user is responsible for managing flight information in the system. The admin can add new flights, update existing flight details, and remove unavailable flights. Admin users are expected to understand the basic management needs of the application.

### Operating Environment

The application is intended to run in a modern web browser such as Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari. Users will need an internet connection to access the deployed application.

For development, the project may use the following environment:

* Visual Studio Code as the code editor.  
* Git and GitHub for version control.  
* HTML, CSS, Bootstrap, and JavaScript for the frontend.  
* Node.js and Express.js for the backend.  
* MongoDB for database storage.  
* A web browser for testing the application.

### Assumptions and Dependencies

The development of this project assumes that users have access to a device with a modern web browser and stable internet connection. It also assumes that the system is for educational and project demonstration purposes only.

The project depends on the availability of the required development tools and technologies, such as GitHub, Bootstrap, Node.js, Express.js, and MongoDB. The application also depends on the accuracy of sample flight data provided by the developers, since it will not be connected to real airline databases.

## 5. Visual Mockup Reference

![](./images/image1.png)

![](./images/image2.png)  
![](./images/image4.png)

## 6. Features**

**Feature 1: User Registration and Login**

The system will allow users to create an account and log in. Registered users will be able to access booking-related features, such as creating a booking and viewing their booking details.

**Feature 2: Flight Search**

The system will allow users to search for flights by entering travel information such as departure location, destination, travel date, and number of passengers. This feature will help users find available flights based on their selected criteria.

**Feature 3: View Available Flights**

The system will display available flights based on the user’s search. Each flight result may show important details such as airline name, departure city, destination city, departure date and time, arrival date and time, available seats, and price.

**Feature 4: Flight Booking**

The system will allow users to select a flight and create a booking. The booking will store important information such as the selected flight, user details, number of passengers, total price, and booking status.

**Feature 5: View Booking Details**

The system will allow users to view their booking information after creating a reservation. This may include the booking reference, flight details, passenger details, total price, and booking status.

**Feature 6: Admin Flight Management**

The system will include basic admin functionality for managing flight records. Admin users may be able to add new flights, update flight information, and remove flights that are no longer available.

**Feature 7: Responsive Web Design**

The application will be designed to work on different screen sizes, including desktop, tablet, and mobile devices. Bootstrap and custom CSS may be used to help create a responsive layout.

**Feature 8: Simulated Payment Status**

The system may include a simple payment status feature for demonstration purposes. This Awill not involve real payment processing. It may only show statuses such as pending, paid, or cancelled.

## 7. Functional Requirements

## **Use Cases**

### **Use Case 1: User Registration**

### **Title:**  Create User Account

### **Description:**  This use case describes how a new user creates an account in the system to access booking features.

### **Actors:**  Regular User / Customer

### **Preconditions:**

* ### User must have access to the website.

* ### User must not already have an existing account using the same email.

### **Postconditions:**

* ### A new user account is created.

* ### User information is stored in the database.

* ### User can log in using registered credentials.

### **Main Flow:**

1. ### User opens the registration page.

2. ### User enters required information such as name, email, password, and contact details.

3. ### System validates the entered information.

4. ### System creates a new user record.

5. ### System confirms successful registration.

### **Alternate Flows:**

* ### If the email already exists, the system displays an error message.

* ### If required fields are missing, the system asks the user to complete the form.

### 

### **Use Case 2: Search Flights**

**Title:**  
 Search Available Flights

**Description:**  
 This use case allows users to search available flights based on travel preferences.

**Actors:**  
 Regular User / Customer

**Preconditions:**

* User can access the flight search page.

**Postconditions:**

* Matching flight records are displayed.

**Main Flow:**

1. User enters the departure location.  
2. User enters the destination.  
3. User selects travel date.  
4. User enters a number of passengers.  
5. System processes the search request.  
6. System displays available flights.

**Alternate Flows:**

* If no flights match the search, the system displays "No available flights found."  
* If invalid information is entered, the system requests corrections.

### **Use Case 3: Create Flight Booking**

**Title:**  
 Book Selected Flight

**Description:**  
 This use case allows users to reserve a selected flight.

**Actors:**  
 Regular User / Customer

**Preconditions:**

* User must be logged in.  
* A flight must be available.

**Postconditions:**

* Booking information is stored.  
* Booking reference is generated.

**Main Flow:**

1. User selects a preferred flight.  
2. User enters passenger information.  
3. System calculates total cost.  
4. User confirms booking.  
5. System saves booking details.  
6. System displays booking confirmation.

**Alternate Flows:**

* If seats are unavailable, booking cannot proceed.  
* If user cancels, booking creation is stopped.

# **System Features**

## **Feature 1: User Authentication**

**Description:**  
 Allows users to register, log in, and access account-based features.

**Priority:**  
 High

**Inputs:**

* Username  
* Email address  
* Password

**Processing:**

* Validate user information.  
* Store account details.  
* Authenticate login credentials.

**Outputs:**

* Successful login message.  
* User account access.

**Error Handling:**

* Invalid password.  
* Duplicate email.  
* Missing required fields.

## **Feature 2: Flight Management**

**Description:**  
 Allows administrators to manage available flight records.

**Priority:**  
 High

**Inputs:**

* Flight number  
* Airline name  
* Departure location  
* Destination  
* Schedule  
* Price  
* Seat availability

**Processing:**

* Admin creates, updates, or removes flight records.  
* System updates the database.

**Outputs:**

* Updated flight listings.

**Error Handling:**

* Invalid flight information.  
* Missing required fields.  
* Unauthorized access.

## 8. Non-functional Requirements

## **Performance**

The system should provide fast responses when users search flights, view booking details, and perform account actions.

Requirements:

* Pages should load within a reasonable amount of time.  
* Database queries should return results efficiently.  
* The system should support multiple users accessing the application.

## **Security**

The system should protect user information and prevent unauthorized access.

Requirements:

* Passwords should be securely stored.  
* Users should only access their own booking information.  
* Admin features should require administrator authorization.  
* User input should be validated to prevent malicious data.

## **Usability**

The system should provide a simple and understandable interface.

Requirements:

* Navigation should be clear.  
* Forms should provide understandable instructions.  
* Error messages should guide users properly.  
* The interface should follow the provided mockup design.

## **Reliability**

The system should operate consistently during normal usage.

Requirements:

* Data should be saved correctly.  
* The application should handle errors without crashing.  
* Booking information should remain available after creation.

## **Supportability**

The system should be easy to maintain and improve.

Requirements:

* Code should follow proper organization.  
* Documentation should be provided.  
* Components should be reusable.  
* Database structure should allow future expansion.

## 9. Data Requirements

***Data Models:***

**User Model**

| Field | Type | Description |
| :---- | :---- | :---- |
| userID | ObjectId | Unique identifier |
| firstName | String | User first name |
| lastName | String | User last name |
| pfp | String | Profile Picture |
| email | String | User email |
| password | String | Encrypted password |
| role | String | User/Admin |
| dateCreated | Date | Date the user was created |

**Airline Model**

| Field | Type | Description |
| :---- | :---- | :---- |
| airlineID | ObjectId | Unique flight identifier |
| name | String | Airline name |
| logo | String | Profile Picture |
| rating | Number | Airline Rating |

**Flight Model**

| Field | Type | Description |
| :---- | :---- | :---- |
| flightID | ObjectId | Unique flight identifier |
| airline | ObjectId | Associated Airline |
| isDirect | Boolean | Either a Layover, or a Direct Flight |
| departure | String | Departure location |
| destination | String | Arrival location |
| departureDate | Date | Flight schedule |
| arrivalDate | Date | Arrival schedule |
| price | Number | Ticket price |
| busSeatsAvailable | Number | Remaining business class seats |
| ecoSeatAvailable | Number | Remaining economy class seats |
| dateCreated | Date | Date the flight was created |

**Booking Model**

| Field | Type | Description |
| :---- | :---- | :---- |
| bookingID | ObjectId | Unique booking identifier |
| userID | ObjectId | User reference |
| flightID | ObjectId | Flight reference |
| passengers | Number | Number of passengers |
| totalPrice | Number | Booking cost |
| status | String | Pending/Paid/Cancelled |
| bookingDate | Date | Date created |

***Database Requirements:***

The system will use MongoDB as the primary database.

Requirements:

* Store user account information.  
* Store airline information  
* Store flight records.  
* Store booking transactions.  
* Support CRUD operations.  
* Maintain relationships between users, airlines, flights, and bookings.

***Data Storage and Retrieval:***

The application will use MongoDB collections:

### **Users Collection**

Stores customer and administrator accounts.

### **Airline Collection**

Stores airline information.

### **Flights Collection**

Stores available flight information.

### **Bookings Collection**

Stores completed and pending reservations.

The backend will use Express.js APIs to communicate between the frontend and database.

***ERD:***

![](./images/image3.png)

## 10. External Interface Requirements

### **User Interface**

The frontend interface will include:

* Navigation bar  
* Flight search form  
* Flight cards/results  
* Booking forms  
* User account pages  
* Admin dashboard

The design will follow the provided visual mockup reference with:

* Clean white layout  
* Search-focused homepage  
* Card-based flight displays  
* Responsive Bootstrap components

### **API Interface**

* Booking API   
* Flights API   
* Ticketing API   
* Payment API
* Users API

### **Hardware Interface**

* None 

### **Software Interface**

The system will communicate using:

* REST API  
* JSON data format  
* MongoDB database connection

Technologies:

Frontend:

* HTML  
* CSS  
* Bootstrap

Backend:

* JavaScript  
* Node.js  
* Express.js

Database:

* MongoDB

## 11. Glossary

| Term | Definition |
| :---: | :---: |
| Airline Booking System | A web application used for searching and reserving flights |
| Flight | A scheduled transportation service between locations |
| Booking | A reservation made by a customer |
| Passenger | Person traveling on a flight |
| Admin | User responsible for managing system records |
| API | Communication method between application components |
| CRUD | Create, Read, Update, Delete operations |
| Database | System used to store application information |
| MongoDB | NoSQL database used by the application |

## 12. Appendices

### **Appendix A: Visual Mockup Reference, Home Page**

![](./images/image1.png)

The interface design is inspired by modern flight search platforms such as Kayak. The homepage focuses on:

* Flight search functionality  
* Destination recommendations  
* Travel deal cards  
* Frequently asked questions  
* Footer navigation

The final implementation may adjust visual elements depending on development requirements.

### **Appendix B: Visual Mockup Reference, Flight Selection**

![](./images/image2.png)

The interface design is inspired by modern flight search platforms such as Kayak. The flight selection comes after selecting a destination, and focuses on:

* Flight search functionality  
* Best Booking Tickets  
* Flight Information  
* Filters and Sorting  
* Footer navigation

The final implementation may adjust visual elements depending on development requirements.

### **Appendix C: Visual Mockup Reference, Booking**

![](./images/image4.png)

The interface design is inspired by modern flight search platforms such as Kayak. The booking comes after selecting a determined flight, and focuses on:

* Ticket Prices  
* Flight Information  
* Amount of Tickets

The final implementation may adjust visual elements depending on development requirements.

### **Appendix D: Entity Relationship Diagram**

![](./images/image3.png)

The ERD is meant to showcase the information that will be stored in each table, their respective data types, as well as their relationship with one another, whether or not they take information from each other or not.
