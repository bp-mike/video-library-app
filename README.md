# Quotes Api

This is a simple Express.js API for managing quotes. It allows you to create, read, update, and delete quotes. The API uses a Prisma-based database.

## Getting Started

Follow these instructions to get the API up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following:

- [Node.js](https://nodejs.org/) installed on your machine.
- An environment variable `DATABASE_URL` pointing to your database (e.g., Postgressql, SQLite).

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/bp-mike/quotes-api.git
   ```

2. Navigate to the project folder:

   ```
   cd quotes-api
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Environment Configuration

   a). Create a `.env` file in the root directory of the project.

   b). Set the `PORT` variable to specify the port on which the API will run. For example, to run it on port 3000:

   ```env
   PORT=3000
   ```

   c). For SQLite as the database, add the following line to your `.env` file, specifying the path to your SQLite database file (in this case, it's named `dev.db`):

   ```env
   DATABASE_URL="file:./dev.db"
   ```

   Make sure to adjust the `PORT` and `DATABASE_URL` values to suit your specific requirements, especially if you're using a different database system or port number

5. Start the server:
   ```
   npm start
   ```

The API will be accessible at http://localhost:3000 by default.

## Endpoints

- `GET /`: A welcome message.

- `GET /quotes`: Get a list of all quotes.

- `GET /quotes/:id`: Get a specific quote by its ID.

- `POST /quotes`: Create a new quote.

- `PATCH /quotes/:id`: Update a quote by its ID.

- `DELETE /quotes/:id`: Delete a quote by its ID.

## Usage

You can use tools like [Postman](https://www.postman.com/) or [curl](https://curl.se/) to interact with the API.

Here's an example of creating a new quote:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"quote": "Your Quote Here", "author": "Author Name"}' http://localhost:3000/quotes
```

## Error Handling

- If there's an issue with a request, the API will respond with a JSON error message.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [dotenv](https://www.npmjs.com/package/dotenv)

Enjoy using the API!
