# Express JS API

## About

* This is a simple ExpressJS API that allows you to create, read, update and delete data.
* The API is built with the following technologies:
* * [NodeJS](https://nodejs.org/en/)
* * [ExpressJS](https://expressjs.com/)
* * [MongoDB](https://www.mongodb.com/)
* * [JWT](https://jwt.io/)
* * [Mongoose](https://mongoosejs.com/)
* Token authentication is used to authenticate users. A middleware is used to verify the token.
* All models are created under the /modules folder as micro structuring and can be modified as needed easily.
* A router-bundler is the middleware, used to bundle all the routes.
* All list endpoints are paginated and can be filtered by any field. This is done by the middleware and interceptor.
* A generic interceptor is used to handle all requests.

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

## API Documentation

Postman API documentation is created and can be accessible by visiting public urls.

- **Visit Online Documentation:** https://documenter.getpostman.com/view/11424728/VUxKTUqv
- **Send Requests Online:** https://www.postman.com/berkaymizrak/workspace/express-js-api/overview

**Note:** Be sure you selected the environment *Express JS API Env Local* from top right corner.
