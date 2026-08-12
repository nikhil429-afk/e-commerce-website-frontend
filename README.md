# E-Commerce Furniture Website - Frontend

Frontend for an AI-powered furniture E-Commerce platform built with React and TypeScript.


## Description

AI-Powered E-Commerce Furniture Website is a full-stack web application that allows users to browse, search, and purchase furniture online while providing AI-assisted room decoration. Users can upload an image of their room, where AI analyzes the room layout, detects available and recommends the most suitable furniture products from the existing product database based on room size, style, colors, according to the available space.
The project also includes role-based authentication and authorization with separate dashboards for Owner, Admin, Manager, and Users. Product, user, and order management are handled through a FastAPI backend with a MySQL database.


## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Fetch API


## Project Structure

node_modules/
public/

src/

    api/
        Product_item_API/ contains APIs of subroutes
        contains APIs

    assets/
        Extra/ conatins extra & svg functions
        images/ contains images of products

    auth/
        contains authorization and authentication logics

    Components/
        pagenavigation/ contains logic of page navigation (back)

            pages/
                about/ about us page
                cart/ cart page
                contact/ contact us page
                products/ all products page
                wishlist/ wishlist page
                pagination/ contains pagination logic

            profiles/
                owner/ conatins owner's page

            services/
                contains ai decorate page
            
            store/
                contains dashboard page

            utils/
                contains token storage logic

    App.css
    App.tsx
    index.css
    main.tsx
.gitignore
index.html
package-lock.json
package.json
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
            

# Features

- User Registration & Login
- JWT Authentication
- RESTful APIs
- Role-Based Access Control (Owner, User)
- Product Management
- Shopping Cart
- Wishlist
- Order Management
- Product Search & Filtering
- AI Room Decoration
- AI-Based Furniture Recommendation
- Database Migrations using Alembic
- Responsive User Interface
- MySQL Database Integration
- Secure Password Hashing


## Installation

Install dependencies

npm install


Run the development server

npm run dev


The application will start at: http://localhost:5173
