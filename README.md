**Railway Commodity Reservation System**

 
    Name: Lalit Kumar (185020), 
    Course: CSD-327 Software Engineering LAB
    Date: May 6th, 2021
    Submitted to: Dr. Dharmendra Prasad Mahto

Instructions to Run:<br />
Pre-requisites<br />
Mongodb<br />
Nodejs<br />
StripeAccount <br />

Download the zip file or clone it.<br />
Connect to your local mongodb database inside app.js <br />
Edit this line in app.js (mongoose.connect("mongodb://localhost:27017/railsDBS2",{useNewUrlParser : true,useUnifiedTopology : true});)<br />
Open terminal, navigate to the folder.<br />
Run the command `npm install` , it will install all the dependencies.<br />
Create a .env file in the project folder and add variables ,(SECRET=YourSecret) for session,<br />
ADMIN=YourAdminModeUserIdandPassword <br />
Admin mode has same userid and password<br />
PUBLISHABLEKEY=YourStripePublishableKey<br />
SECRETKEY=YourStripeSecretKey<br />
You can get your secret and publishable key for free by creating an account on stripe.com<br />
Run the command `nodemon app.js`<br />
Open any web browser and search localhost:3000<br />

At the home page you will see two modes user mode, and the admin mode.<br />
In the admin mode you first need to login with the right credentials and then you can insert,update and delete the railways database.<br />
In the user mode, first you need to create a account.<br />
Then after logging in you will see three options,<br />
1: Book a ticket.<br />
2: Cancel a ticket.<br />
3: Your Tickets.<br />

On clicking book a ticket you will be asked to enter the date , mobile no. ,source ,destination after that you will see all trains. After entering the no. of tickets you want to 
book and selecting the train you will be asked for payment , you can make a payment only through card.
Please see Project Report for full details.
